import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building,
  User,
  Phone,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SpecialAssistanceModal() {
  const {
    activeModal,
    setActiveModal,
    places,
    services,
    submitSpecialAssistance
  } = useApp();

  const [placeId, setPlaceId] = useState(places[0]?.id || 'place-hospital-1');
  const [serviceId, setServiceId] = useState('');
  const [category, setCategory] = useState('senior_citizen');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [supportDetails, setSupportDetails] = useState('');
  const [directConsultant, setDirectConsultant] = useState(true);
  const [preferredTime, setPreferredTime] = useState('Morning (09:00 AM - 12:00 PM)');
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (activeModal !== 'special_assistance') return null;

  const availableServices = services.filter(s => s.placeId === placeId);
  const currentService = services.find(s => s.id === serviceId) || availableServices[0];
  const isHospital = placeId.includes('hospital');

  const assistanceOptions = [
    { id: 'senior_citizen', label: 'Senior Citizen (60+ yrs)', icon: '👵', desc: 'Front-of-line priority & comfortable seating' },
    { id: 'disability', label: 'Person with Disability', icon: '♿', desc: 'Wheelchair access & staff escort support' },
    { id: 'pregnant', label: 'Pregnant Individual', icon: '🤰', desc: 'Expedited turn & maternity assistance' },
    { id: 'urgent_triage', label: 'Urgent Care Request', icon: '🩺', desc: 'Clinical evaluation & fast-track review' },
    { id: 'other', label: 'Other Support Need', icon: '🤝', desc: 'Document filling, translation, or personal aid' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedPlace = places.find(p => p.id === placeId) || places[0];
      const selectedCategoryObj = assistanceOptions.find(o => o.id === category);

      const request = await submitSpecialAssistance({
        customerName: customerName.trim() || 'Senior / Care Guest',
        customerPhone: customerPhone.trim() || '+1 (555) 777-6655',
        placeId,
        serviceId: currentService ? currentService.id : availableServices[0]?.id,
        category,
        categoryLabel: selectedCategoryObj?.label || 'Special Support',
        supportDetails: supportDetails || 'Assistance requested for appointment visit.',
        requestDirectConsultant: isHospital ? directConsultant : false,
        preferredTime: isHospital ? preferredTime : 'Immediate'
      });

      setSubmittedRequest(request);
      confetti({ particleCount: 70, spread: 60 });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveModal(null);
    setSubmittedRequest(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-200 dark:border-purple-800 animate-slide-up text-left transition-colors">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedRequest ? (
          /* Confirmation View as required by prompt */
          <div className="space-y-6 text-center animate-slide-up">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950 text-brand-purple rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-purple-500/20">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-brand-purple uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                Priority Assistance Logged
              </span>
              <h3 className="text-2xl font-black text-brand-navy dark:text-white tracking-tight mt-1.5">
                💜 Request Submitted
              </h3>
            </div>

            <div className="bg-purple-50/70 dark:bg-slate-800 rounded-2xl p-5 border border-purple-200 dark:border-purple-800 text-left space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Service:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{submittedRequest.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Assistance Category:</span>
                <span className="font-bold text-brand-purple">{submittedRequest.categoryLabel}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-purple-200 dark:border-purple-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 animate-pulse">
                  Awaiting Staff Confirmation
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-left">
              Your request has been forwarded to the attendant station. <strong>When staff reviews and approves your request, you will receive an immediate notification pop-up.</strong>
            </p>

            <button
              onClick={() => {
                setActiveModal('track_token');
              }}
              className="w-full py-3.5 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 transition-all"
            >
              View Request Status in Token Pass
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-brand-purple flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-brand-navy dark:text-white tracking-tight">
                  Special Assistance Booking
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Priority access and mobility assistance for eligible visitors.
                </p>
              </div>
            </div>

            {/* Place & Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Location
                </label>
                <select
                  value={placeId}
                  onChange={(e) => {
                    setPlaceId(e.target.value);
                    const s = services.filter(x => x.placeId === e.target.value);
                    if (s.length > 0) setServiceId(s[0].id);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  {places.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Service
                </label>
                <select
                  value={serviceId || availableServices[0]?.id}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  {availableServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assistance Category Options */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Assistance Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assistanceOptions.map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setCategory(opt.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      category === opt.id
                        ? 'border-brand-purple bg-purple-50/70 dark:bg-purple-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 bg-slate-50 dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{opt.icon}</span>
                      <div className="font-bold text-xs text-brand-navy dark:text-white leading-snug">{opt.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Consultant Access (For Hospitals) */}
            {isHospital && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🩺</span>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Request Direct Consultant Access
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={directConsultant}
                    onChange={(e) => setDirectConsultant(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 leading-snug">
                  Requests priority doctor consultation room assignment without waiting in general triage.
                </p>
              </div>
            )}

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Visitor Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Grandma Evelyn"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 777-6655"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Support Details Note */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Describe Support Needed (Optional)
              </label>
              <textarea
                rows="2"
                value={supportDetails}
                onChange={(e) => setSupportDetails(e.target.value)}
                placeholder="e.g. Wheelchair assistance from main entrance, physical mobility support..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Special Assistance Request'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
