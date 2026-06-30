import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';
import { healthSecurityApi } from '../services/api.js';

export const HealthSecurity = () => {
  const navigate = useNavigate();
  const { updateHealthSecurity } = useApp();
  const { completeOnboardingStep } = useAuth();

  const [formData, setFormData] = useState({
    medicalHistory: [],
    physicalInjuries: '',
    currentMedication: '',
    bloodPressure: {
      systolic: '',
      diastolic: '',
    },
    heartRate: '',
    allergies: [],
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const medicalOptions = [
    'Hypertension',
    'Diabetes',
    'Asthma',
    'Cholesterol',
    'Heart Disease',
    'Other',
  ];

  const commonAllergies = [
    'Peanuts',
    'Gluten',
    'Dairy',
    'Eggs',
    'Shellfish',
    'Tree Nuts',
    'Fish',
    'Soy',
  ];

  const handleMedicalChange = (condition) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.includes(condition)
        ? prev.medicalHistory.filter((c) => c !== condition)
        : [...prev.medicalHistory, condition],
    }));
  };

  const handleAllergyChange = (allergy) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'systolic' || name === 'diastolic') {
      setFormData((prev) => ({
        ...prev,
        bloodPressure: { ...prev.bloodPressure, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.bloodPressure.systolic && formData.bloodPressure.diastolic) {
      const systolic = Number(formData.bloodPressure.systolic);
      const diastolic = Number(formData.bloodPressure.diastolic);
      if (systolic < 60 || systolic > 200 || diastolic < 40 || diastolic > 150) {
        setError('Invalid blood pressure');
        return;
      }
    }

    const heartRate = Number(formData.heartRate);
    if (formData.heartRate && (heartRate < 30 || heartRate > 200)) {
      setError('Heart rate must be between 30-200 bpm');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        medical_history: formData.medicalHistory.join(', '),
        physical_injuries: formData.physicalInjuries || null,
        current_medication: formData.currentMedication || null,
        blood_pressure:
          formData.bloodPressure.systolic && formData.bloodPressure.diastolic
            ? `${formData.bloodPressure.systolic}/${formData.bloodPressure.diastolic}`
            : null,
        heart_rate: formData.heartRate ? Number(formData.heartRate) : null,
        allergy: formData.allergies.join(', ') || null,
      };

      await healthSecurityApi(payload);
      updateHealthSecurity(payload);
      completeOnboardingStep(payload);
      navigate('/onboarding/goal-setting');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save data');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 border-2 border-transparent rounded-xl text-sm text-slate-900 bg-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200";
  const labelClass = "block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide";

  const steps = [
    { id: 1, title: 'Basic Identity', desc: 'Age, Weight, Height', status: 'completed' },
    { id: 2, title: 'Lifestyle', desc: 'Diet & Sleep habits', status: 'completed' },
    { id: 3, title: 'Medical', desc: 'Health conditions', status: 'current' },
    { id: 4, title: 'Goals', desc: 'Your main objectives', status: 'upcoming' },
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
              Health & Medical History.
            </h1>
            <p className="text-base text-slate-500">
              Your medical history and health restrictions help us ensure AI recommendations are safe for you.
            </p>
          </div>

          {/* Warning Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 mb-8">
            <span className="text-amber-500 mt-0.5">⚠️</span>
            <p className="text-sm text-amber-700 font-medium">
              This information is very important to ensure AI recommendations are safe for your health condition.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Medical History */}
            <div>
              <label className={labelClass}>
                Medical History <span className="normal-case font-normal text-slate-400">(Select applicable)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {medicalOptions.map((condition) => (
                  <label
                    key={condition}
                    className={`flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-xl border-2 transition-all duration-150 ${
                      formData.medicalHistory.includes(condition)
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.medicalHistory.includes(condition)}
                      onChange={() => handleMedicalChange(condition)}
                      className="accent-green-600 w-4 h-4"
                    />
                    <span className="text-sm font-medium">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Physical Injury + Medication */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>
                  Physical Injuries <span className="normal-case font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  name="physicalInjuries"
                  value={formData.physicalInjuries}
                  onChange={handleInputChange}
                  placeholder="e.g. Knee injury in 2023..."
                  rows="3"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Current Medication <span className="normal-case font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  name="currentMedication"
                  value={formData.currentMedication}
                  onChange={handleInputChange}
                  placeholder="e.g. Metformin, Atorvastatin..."
                  rows="3"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {/* Blood Pressure + Heart Rate */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Systolic</label>
                <input
                  type="number"
                  name="systolic"
                  min="60"
                  max="200"
                  value={formData.bloodPressure.systolic}
                  onChange={handleInputChange}
                  placeholder="120"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Diastolic</label>
                <input
                  type="number"
                  name="diastolic"
                  min="40"
                  max="150"
                  value={formData.bloodPressure.diastolic}
                  onChange={handleInputChange}
                  placeholder="80"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Heart Rate (bpm)</label>
                <input
                  type="number"
                  name="heartRate"
                  min="30"
                  max="200"
                  value={formData.heartRate}
                  onChange={handleInputChange}
                  placeholder="72"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Food Allergies */}
            <div>
              <label className={labelClass}>
                Food Allergies <span className="normal-case font-normal text-slate-400">(Select applicable)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {commonAllergies.map((allergy) => (
                  <label
                    key={allergy}
                    className={`flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-xl border-2 transition-all duration-150 ${
                      formData.allergies.includes(allergy)
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.allergies.includes(allergy)}
                      onChange={() => handleAllergyChange(allergy)}
                      className="accent-green-600 w-4 h-4"
                    />
                    <span className="text-sm font-medium">{allergy}</span>
                  </label>
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
                onClick={() => navigate('/onboarding/lifestyle')}
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
                {loading ? 'Saving...' : 'Continue to Goals'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};