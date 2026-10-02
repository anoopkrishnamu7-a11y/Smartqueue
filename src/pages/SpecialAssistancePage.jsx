import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SpecialAssistancePage() {
  const {
    places,
    services,
    specialAssistanceRequests,
    submitSpecialAssistance,
    setActiveModal
  } = useApp();

  const [placeId, setPlaceId] = useState(places[0]?.id || 'place-hospital-1');
  const [serviceId, setServiceId] = useState('');
  const [assistanceType, setAssistanceType] = useState('senior_citizen');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [supportDescription, setSupportDescription] = useState('');
  const [requestPriorityConsultation, setRequestPriorityConsultation] = useState(true);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const availableServices = services.filter(s => s.placeId === placeId);
  const isHospital = placeId.includes('hospital');

  const assistanceTypes = [
    {
      id: 'senior_citizen',
      label: 'Senior Citizen (60+ yrs)',
      icon: '👵',
      desc: 'Front-of-line priority & comfortable priority desk seating'
    },
    {
      id: 'accessibility',
      label: 'Accessibility Assistance',
      icon: '🦽',
      desc: 'Wheelchair access, elevator escort & low-height desk service'
    },
    {
      id: 'mobility',
      label: 'Mobility Assistance',
      icon: '🦯',
      desc: 'Physical assistance walking from the entrance to consultation room'
    },
    {
      id: 'pregnancy',
      label: 'Pregnancy-Related Assistance',
      icon: '🤰',
      desc: 'Maternity priority check-in & expedited queue turn'
    },
    {
      id: 'other',
      label: 'Other Assistance Request',
      icon: '🤝',
      desc: 'Document translation, form filling assistance or personal aid'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedTypeObj = assistanceTypes.find(t => t.id === assistanceType);
      const req = await submitSpecialAssistance({
        customerName: customerName.trim() || 'Special Care Guest',
        customerPhone: customerPhone.trim() || '+1 (555) 777-6655',
        placeId,
        serviceId: serviceId || availableServices[0]?.id,
        category: assistanceType,
        categoryLabel: selectedTypeObj?.label || 'Special Support',
        supportDetails: supportDescription || 'Assistance requested for appointment visit.',
        requestDirectConsultant: isHospital ? requestPriorityConsultation : false
      });

      setSubmittedRequest(req);
      confetti({ particleCount: 75, spread: 60 });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 py-4 max-w-7xl mx-auto text-left animate-fade-in">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-pink-50 dark:from-purple-950/40 dark:via-slate-900 dark:to-pink-950/20 rounded-3xl p-6 sm:p-10 border-2 border-purple-200 dark:border-purple-800 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-brand-purple text-xs font-black uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Inclusive & Accessible Queue System</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-navy dark:text-white tracking-tight">
            💜 Special Assistance & Priority Access
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            We are committed to making public services accessible to everyone. Request specialized accommodations, front-of-line priority, and hospital consultation assistance without complex paperwork.
          </p>
        </div>
      </div>

      {/* Emergency Disclaimer Banner (Section 17 requirement) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 flex items-start space-x-3.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-sm block mb-0.5">
            Emergency Notice
          </span>
          <p className="leading-relaxed">
            If this is a critical medical emergency, <strong>contact the hospital emergency service immediately</strong> or approach the Emergency Casualty desk rather than waiting in the normal digital queue. SmartQueue Special Assistance is a request and approval coordination system, not an automatic emergency dispatch.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Request Assistance Flow (Sections 16 & 17) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
          
          {submittedRequest ? (
            /* Confirmation State (Section 16 requirement) */
            <div className="space-y-6 text-center py-6 animate-slide-up">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950 text-brand-purple rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                <FileCheck className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-brand-purple uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                  Request Logged #{submittedRequest.tokenNumber}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight mt-2">
                  Assistance Request Submitted
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your request has been sent to the service provider staff.
                </p>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-extrabold text-sm animate-pulse">
                <span>🟡 Status: Waiting for Staff Approval</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-left space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Visitor:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{submittedRequest.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{submittedRequest.placeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-bold text-brand-purple">{submittedRequest.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assistance Category:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{submittedRequest.categoryLabel}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                When staff reviews and approves your request, you will receive an immediate on-screen alert and your assigned consultation room will appear.
              </p>

              <button
                onClick={() => setSubmittedRequest(null)}
                className="py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-brand-navy dark:text-white tracking-tight">
                  Submit a Special Assistance Request
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Follow the steps below to inform our staff before you arrive.
                </p>
              </div>

              {/* Step 1: Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Step 1: Select Location
                </label>
                <select
                  value={placeId}
                  onChange={(e) => {
                    setPlaceId(e.target.value);
                    const list = services.filter(s => s.placeId === e.target.value);
                    if (list.length > 0) setServiceId(list[0].id);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none"
                >
                  {places.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Step 2: Service */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Step 2: Select Service
                </label>
                <select
                  value={serviceId || availableServices[0]?.id}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none"
                >
                  {availableServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (~{s.avgDurationMins}m)</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Assistance Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Step 3: Select Assistance Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {assistanceTypes.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setAssistanceType(t.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        assistanceType === t.id
                          ? 'border-brand-purple bg-purple-50/70 dark:bg-purple-950/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-2xl">{t.icon}</span>
                        <div>
                          <div className="font-extrabold text-xs text-brand-navy dark:text-white leading-tight">
                            {t.label}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                            {t.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Consultation for Hospital (Section 17 requirement) */}
              {isHospital && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🩺</span>
                      <div>
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                          Request Priority Consultation
                        </span>
                        <span className="text-[11px] text-emerald-800 dark:text-emerald-400">
                          Subject to hospital triage review & policy approval.
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={requestPriorityConsultation}
                      onChange={(e) => setRequestPriorityConsultation(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Short Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Step 4: Optional Short Description
                </label>
                <textarea
                  rows="2"
                  value={supportDescription}
                  onChange={(e) => setSupportDescription(e.target.value)}
                  placeholder="e.g. Grandma requires wheelchair assistance from the main entrance lobby..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none"
                ></textarea>
              </div>

              {/* Visitor Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Visitor Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Grandma Evelyn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Mobile Number (For Alerts)
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 777-6655"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              {/* Step 5: Submit Request */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Assistance Request'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Right Info: Live Requests & Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Special Assistance Status Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-brand-navy dark:text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-purple" />
                <span>Recent Approved Assistance</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">Live Status</span>
            </div>

            <div className="space-y-3">
              {specialAssistanceRequests.slice(0, 3).map(sar => {
                const isApproved = sar.status === 'approved';
                return (
                  <div
                    key={sar.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isApproved
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-brand-purple uppercase">
                          {sar.categoryLabel}
                        </span>
                        <div className="font-bold text-xs text-brand-navy dark:text-white">
                          {sar.customerName}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isApproved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sar.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      {sar.serviceName} &bull; {sar.placeName}
                    </p>

                    {sar.assignedRoom && (
                      <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Assigned: {sar.assignedRoom}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy & Sensitivity Notice */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <h4 className="font-bold text-brand-navy dark:text-white flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-brand-blue" />
              <span>Dignity & Privacy Protected</span>
            </h4>
            <p className="leading-relaxed">
              We never require sensitive diagnosis records or invasive medical information to join a queue or request support. Your phone number is strictly used for 2-minute arrival notifications.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
