import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// PASTIKAN ANDA IMPORT API-NYA DI SINI
import { lifestyleApi } from '../services/api';

export const Lifestyle = () => {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();

  // Hapus smokingHabits & activityLevel karena tidak ada di Joi Backend
  const [form, setForm] = useState({
    dietaryPattern: 'High Protein',
    mealsPerDay: 3,
    dailyWaterIntakeGoal: 2000,
    avgSleepHours: 7,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi tambahan berdasarkan batasan DB (4 - 12 jam)
    if (form.avgSleepHours < 4 || form.avgSleepHours > 12) {
      setError('Average sleep hours must be between 4 and 12 hours.');
      return;
    }

    setLoading(true);
    try {
      // 1. Susun payload menggunakan format snake_case & pastikan tipe Number
      const payload = {
        dietary_pattern: form.dietaryPattern,
        meals_per_day: Number(form.mealsPerDay),
        daily_water_intake_goal: Number(form.dailyWaterIntakeGoal),
        avg_sleep_hours: Number(form.avgSleepHours),
      };

      // 2. Tembak ke API (pastikan nama import API Anda benar)
      await lifestyleApi(payload);

      // 3. Simpan ke Context
      completeOnboardingStep(form);

      // 4. Lanjut ke step berikutnya
      navigate('/onboarding/health-security');
    } catch (err) {
      setError(
        'Failed to save: ' + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // Class input & label sama persis dengan BasicIdentity
  const inputClass = "w-full px-4 py-3.5 border-2 border-transparent rounded-xl text-sm text-slate-900 bg-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200";
  const labelClass = "block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide";

  const steps = [
    { id: 1, title: 'Basic Identity', desc: 'Age, Weight, Height', status: 'completed' },
    { id: 2, title: 'Lifestyle', desc: 'Diet & Sleep habits', status: 'current' },
    { id: 3, title: 'Medical', desc: 'Health conditions', status: 'upcoming' },
    { id: 4, title: 'Goals', desc: 'Your main objectives', status: 'upcoming' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-slate-900">

      {/* --- SIDEBAR STEPPER (Kiri di Desktop, Atas di Mobile) --- */}
      <div className="w-full md:w-80 lg:w-[400px] bg-slate-50 border-r border-slate-200 p-8 md:p-10 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-green-600 rounded-xl shadow-lg shadow-green-600/30 flex items-center justify-center">
            <img src="/favicon.svg" alt="Logo" className="w-6 h-6 brightness-0 invert" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Nutricca</span>
        </div>

        {/* Stepper Vertikal */}
        <div className="hidden md:block">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Onboarding Progress</h3>
          <div className="flex flex-col gap-8 relative">
            {/* Garis penghubung background */}
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

      {/* --- MAIN CONTENT (Form di Kanan) --- */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-16 lg:px-24 bg-white relative">
        <div className="max-w-2xl w-full mx-auto">

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Lifestyle & Diet Habits.
            </h1>
            <p className="text-base text-slate-500">
              Tell us about your daily habits so we can personalize your nutrition plan and wellness recommendations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Dietary Pattern + Meals Per Day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Dietary Pattern <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    name="dietaryPattern"
                    value={form.dietaryPattern}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option>High Protein</option>
                    <option>Low Protein</option>
                    <option>High Fiber</option>
                    <option>Vegan</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Meals Per Day <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="mealsPerDay"
                  min="1"
                  max="10"
                  value={form.mealsPerDay}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Daily Water Goal + Avg Sleep Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Daily Water Goal (ml) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="dailyWaterIntakeGoal"
                  value={form.dailyWaterIntakeGoal}
                  onChange={handleChange}
                  placeholder="e.g. 2000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Avg Sleep Hours <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="avgSleepHours"
                  step="0.1"
                  min="4"
                  max="12"
                  value={form.avgSleepHours}
                  onChange={handleChange}
                  placeholder="e.g. 7"
                  className={inputClass}
                />
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
                onClick={() => navigate('/onboarding/basic-identity')}
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
                {loading ? 'Saving...' : 'Continue to Medical'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Lifestyle;