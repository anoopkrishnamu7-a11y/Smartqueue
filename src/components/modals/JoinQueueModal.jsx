import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building2,
  Stethoscope,
  Coffee,
  CheckCircle2,
  Clock,
  Users,
  Shield,
  Phone,
  User,
  ArrowRight,
  ArrowLeft,
  Copy,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function JoinQueueModal() {
  const {
    activeModal,
    setActiveModal,
    categories,
    places,
    services,
    joinQueue,
    modalPreselect,
    setMyTokenNumber
  } = useApp();

  const [step, setStep] = useState(1);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [assistanceCategory, setAssistanceCategory] = useState('');
  const [supportDetails, setSupportDetails] = useState('');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If preselected place or service passed
  useEffect(() => {
    if (modalPreselect) {
      if (modalPreselect.placeId) setSelectedPlaceId(modalPreselect.placeId);
      if (modalPreselect.serviceId) setSelectedServiceId(modalPreselect.serviceId);
      setStep(modalPreselect.step || 2);
    } else if (places.length > 0 && !selectedPlaceId) {
      setSelectedPlaceId(places[0].id);
    }
  }, [modalPreselect, places]);

  if (activeModal !== 'join_queue' && activeModal !== 'token_success') return null;

  const currentPlace = places.find(p => p.id === selectedPlaceId) || places[0];
  const placeServices = services.filter(s => s.placeId === selectedPlaceId);
  const currentService = services.find(s => s.id === selectedServiceId) || placeServices[0];

  const handleConfirmBooking = async () => {
    if (!currentService) return;
    setSubmitting(true);
    try {
      const token = await joinQueue({
        placeId: selectedPlaceId,
        serviceId: currentService.id,
        customerName: customerName.trim() || 'Valued Visitor',
        customerPhone: customerPhone.trim() || '',
        priority: assistanceCategory ? 'special_assistance' : 'normal',
        assistanceCategory: assistanceCategory || null,
        supportDetails: supportDetails || ''
      });

      setGeneratedToken(token);
      setMyTokenNumber(token.tokenNumber);
      setStep(5);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (generatedToken) {
      navigator.clipboard?.writeText(generatedToken.tokenNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setActiveModal(null);
    setStep(1);
    setGeneratedToken(null);
  };

  const handleTrackQueue = () => {
    setActiveModal('track_token');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up text-left transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-bold text-brand-blue uppercase tracking-wider">
              <span>Step {step} of 5</span>
              <span>&bull;</span>
              <span>Online Queue Booking</span>
            </div>
            <h3 className="text-xl font-black text-brand-navy dark:text-white tracking-tight mt-0.5">
              {step === 1 && 'Select a Place'}
              {step === 2 && 'Select a Service'}
              {step === 3 && 'Enter Visitor Details'}
              {step === 4 && 'Confirm Your Booking'}
              {step === 5 && 'Token Generated!'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Select a Place */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose the category or location you wish to visit today:
            </p>

            <div className="space-y-3">
              {places.map(place => {
                const isSelected = selectedPlaceId === place.id;
                const emoji = place.categoryKey === 'village_office' ? '🏛️' : place.categoryKey === 'hospital' ? '🏥' : '🥤';
                
                return (
                  <div
                    key={place.id}
                    onClick={() => {
                      setSelectedPlaceId(place.id);
                      setStep(2);
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'border-brand-blue bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-blue dark:hover:border-brand-blue bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="text-3xl">{emoji}</span>
                      <div>
                        <h4 className="font-extrabold text-sm text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                          {place.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{place.location}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Select a Service */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Available services at <strong className="text-slate-800 dark:text-slate-200">{currentPlace?.name}</strong>:
              </p>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-brand-blue hover:underline"
              >
                Change Place
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {placeServices.map(srv => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-blue bg-blue-50/60 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-blue bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-brand-blue">
                          Prefix {srv.prefix}
                        </span>
                        <h4 className="font-extrabold text-xs text-brand-navy dark:text-white">{srv.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{srv.description}</p>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        ~{srv.avgDurationMins}m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={!selectedServiceId}
                className="py-2.5 px-5 bg-brand-blue hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-blue/20 flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Basic Details & Optional Assistance */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your details to receive your 2-minute arrival notification:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Mobile Number (Optional &bull; For 2-Min Turn SMS)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              {/* Optional Assistance Category */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2 mb-2">
                  <HeartHandshake className="w-4 h-4 text-brand-purple" />
                  <label className="text-xs font-bold text-brand-purple uppercase tracking-wider">
                    Require Special Assistance? (Optional)
                  </label>
                </div>

                <select
                  value={assistanceCategory}
                  onChange={(e) => setAssistanceCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="">No special assistance required</option>
                  <option value="senior_citizen">👵 Senior Citizen (60+ yrs)</option>
                  <option value="disability">♿ Person with Disability</option>
                  <option value="pregnant">🤰 Pregnant Individual</option>
                  <option value="urgent_triage">🩺 Urgent Care Assistance</option>
                  <option value="other">🤝 Other Assistance Request</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(4)}
                className="py-2.5 px-5 bg-brand-blue hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-blue/20 flex items-center space-x-1.5"
              >
                <span>Review & Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirm Token */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please verify your queue booking details before generating token:
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Selected Location:</span>
                <span className="font-extrabold text-brand-navy dark:text-white">{currentPlace?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Selected Service:</span>
                <span className="font-bold text-brand-blue">{currentService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Visitor Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{customerName || 'Valued Visitor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Mobile Number:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{customerPhone || 'Anonymous / Guest'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Notification Method:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded text-[11px]">
                  🔔 2-Min Mobile Alert Enabled
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="py-3 px-6 bg-brand-blue hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-blue/25 flex items-center space-x-2"
              >
                <span>{submitting ? 'Generating...' : 'Get My Token'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: TOKEN SUCCESS MODAL (Section 10 requirement) */}
        {step === 5 && generatedToken && (
          <div className="space-y-6 text-center animate-slide-up">
            <div className="text-4xl animate-bounce-subtle">
              🎉
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-brand-navy dark:text-white uppercase tracking-wider">
                YOUR TOKEN IS READY
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                {generatedToken.placeName} &bull; {generatedToken.serviceName}
              </p>
            </div>

            {/* Big Token Number Card (Section 10 format) */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-6 border-2 border-brand-blue text-center space-y-2 relative">
              <div className="font-mono text-6xl font-black text-brand-navy dark:text-white tracking-tight">
                {generatedToken.tokenNumber}
              </div>

              <div className="flex items-center justify-center pt-1">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Token'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-blue-200/80 dark:border-slate-700 text-xs text-left sm:text-center">
                <div className="bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-blue-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">People Ahead:</span>
                  <span className="font-mono text-xl font-black text-slate-900 dark:text-slate-100">
                    {generatedToken.peopleAhead}
                  </span>
                </div>
                <div className="bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-blue-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">Estimated Waiting Time:</span>
                  <span className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">
                    {generatedToken.estimatedWaitMins} minutes
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Notification: 🟢 Enabled
              </div>
            </div>

            {/* Buttons: Track My Queue, Close (Section 10 requirement) */}
            <div className="space-y-2">
              <button
                onClick={handleTrackQueue}
                className="w-full py-3.5 bg-brand-blue hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Track My Queue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleClose}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
