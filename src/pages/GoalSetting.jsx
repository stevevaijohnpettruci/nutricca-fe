import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  healthGoalsApi,
  generateDailyPlanApi,
  updateOnboardingStatus,
} from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../hooks/useApp';

export const GoalSetting = () => {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();
  const { userProfile } = useApp();

  const [formData, setFormData] = useState({
    primaryGoal: 'Weight Loss',
    targetWeight: '',
    commitmentDays: 5,
    preferredActivities: [],
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goals = [
    'Weight Loss',
    'Muscle Gain',
    'Endurance',
    'General Well-being',
  ];

  const activities = [
    'Yoga',
    'Running',
    'Weight Training',
    'Walking',
    'Swimming',
    'Cycling',
    'HIIT',
    'Pilates',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleActivityToggle = (activity) => {
    setFormData((prev) => ({
      ...prev,
      preferredActivities: prev.preferredActivities.includes(activity)
        ? prev.preferredActivities.filter((a) => a !== activity)
        : [...prev.preferredActivities, activity],
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.targetWeight) {
      setError('Target weight is required');
      return;
    }
    if (formData.preferredActivities.length === 0) {
      setError('Select at least one preferred activity');
      return;
    }
    const targetWeight = Number(formData.targetWeight);
    if (targetWeight < 30 || targetWeight > 300) {
      setError('Target weight must be between 30-300 kg');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        primary_goal: formData.primaryGoal,
        target_weight_kg: Number(formData.targetWeight),
        commitment_days: Number(formData.commitmentDays),
        preferred_activity: formData.preferredActivities.join(', '),
      };

      await healthGoalsApi(payload);
      await updateOnboardingStatus();
      await completeOnboardingStep(payload);

      const today = new Date().toISOString().split('T')[0];
      generateDailyPlanApi(today).catch((err) =>
        console.warn('AI generation failed silently:', err),
      );

      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save data');
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide";

  const weightDiff =
    userProfile?.weight && formData.targetWeight
      ? (Number(formData.targetWeight) - Number(userProfile.weight)).toFixed(1)
      : null;

  const steps = [
    { id: 1, title: 'Basic Identity', desc: 'Age, Weight, Height', status: 'completed' },
    { id: 2, title: 'Lifestyle', desc: 'Diet & Sleep habits', status: 'completed' },
    { id: 3, title: 'Medical', desc: 'Health conditions', status: 'completed' },
    { id: 4, title: 'Goals', desc: 'Your main objectives', status: 'current' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-slate-900">

      {/* --- SIDEBAR STEPPER --- */}
      <div className="w-full md:w-80 lg:w-[400px] bg-slate-50 border-r border-slate-200 p-8 md:p-10 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-green-600 rounded-xl shadow-lg shadow-green-600/30 flex items-center justify-center">
            <img src="/favicon.svg" alt="Logo" className="w-6 h-6 brightness-0 invert" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Nutricca</span>
        </div>

        <div className="hidden md:block">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Onboarding Progress</h3>
          <div className="flex flex-col gap-8 relative">
            <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-slate-200 z-0"></div>
            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  step.status === 'current'
                    ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/30'
                    : step.status === 'completed'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-400'
                }`}>
                  {step.id}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-bold ${step.status === 'current' ? 'text-green-700' : 'text-slate-600'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-16 lg:px-24 bg-white">
        <div className="max-w-2xl w-full mx-auto">

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Set your health goals.
            </h1>
            <p className="text-base text-slate-500">
              Tell us your targets and commitment so we can build a personalized plan just for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Primary Goal */}
            <div>
              <label className={labelClass}>Primary Health Goal <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, primaryGoal: goal }))}
                    className={`px-4 py-3.5 rounded-xl text-sm font-bold border-2 transition-all duration-150 ${
                      formData.primaryGoal === goal
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Weight */}
            <div>
              <label className={labelClass}>Target Weight (kg) <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  name="targetWeight"
                  step="0.1"
                  min="30"
                  max="300"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  placeholder="e.g. 65"
                  className="flex-1 px-4 py-3.5 border-2 border-transparent rounded-xl text-sm text-slate-900 bg-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
                />
                {weightDiff !== null && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-slate-400 mb-0.5">Difference from now</p>
                    <p className={`text-2xl font-extrabold ${Number(weightDiff) < 0 ? 'text-green-600' : 'text-amber-500'}`}>
                      {Number(weightDiff) > 0 ? '+' : ''}{weightDiff} kg
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Commitment Days */}
            <div>
              <label className={labelClass}>Exercise Days Per Week <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-6">
                <input
                  type="range"
                  name="commitmentDays"
                  min="1"
                  max="7"
                  value={formData.commitmentDays}
                  onChange={handleChange}
                  className="flex-1 accent-green-600 h-2"
                />
                <div className="flex-shrink-0 text-center w-16">
                  <span className="text-3xl font-extrabold text-green-600">{formData.commitmentDays}</span>
                  <p className="text-xs text-slate-400 mt-0.5">days/week</p>
                </div>
              </div>
              {/* Day markers */}
              <div className="flex justify-between px-0.5 mt-1">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <span key={d} className={`text-xs font-bold ${d <= formData.commitmentDays ? 'text-green-600' : 'text-slate-300'}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Activities */}
            <div>
              <label className={labelClass}>Preferred Activities <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activities.map((activity) => (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => handleActivityToggle(activity)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-150 ${
                      formData.preferredActivities.includes(activity)
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="h-px bg-slate-100 my-4"></div>

            {/* Buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate('/onboarding/health-security')}
                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 ${
                  loading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {loading ? 'Saving...' : 'Finish & Go to Dashboard'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};