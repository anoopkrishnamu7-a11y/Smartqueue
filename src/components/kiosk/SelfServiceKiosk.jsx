import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Tablet,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Clock,
  HeartHandshake,
  QrCode,
  Building,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SelfServiceKiosk() {
  const { services, places, joinQueue, setMyTokenNumber } = useApp();

  const [selectedPlaceId, setSelectedPlaceId] = useState('place-hospital-1');
  const [step, setStep] = useState(1); // 1: Service, 2: Priority, 3: Details, 4: Receipt
  const [selectedService, setSelectedService] = useState(null);
  const [priority, setPriority] = useState('normal'); // 'normal' or 'special_assistance'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [resetTimer, setResetTimer] = useState(15);
  const [submitting, setSubmitting] = useState(false);

  const currentPlace = places.find(p => p.id === selectedPlaceId) || places[0];
  const placeServices = services.filter(s => s.placeId === selectedPlaceId);

  // Auto reset timer on printed ticket screen
  useEffect(() => {
    let interval = null;
    if (step === 4) {
      setResetTimer(15);
      interval = setInterval(() => {
        setResetTimer(prev => {
          if (prev <= 1) {
            handleResetToStart();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleResetToStart = () => {
    setStep(1);
    setSelectedService(null);
    setPriority('normal');
    setCustomerName('');
    setCustomerPhone('');
    setGeneratedToken(null);
  };

  const handleIssueToken = async (guestMode = false) => {
    if (!selectedService) return;

    setSubmitting(true);
    try {
      const name = guestMode ? 'Walk-in Visitor' : (customerName || 'Walk-in Visitor');
      const phone = guestMode ? '' : (customerPhone || '');

      const token = await joinQueue({
        placeId: selectedPlaceId,
        serviceId: selectedService.id,
        customerName: name,
        customerPhone: phone,
        priority: priority === 'special_assistance' ? 'special_assistance' : 'normal',
        assistanceCategory: priority === 'special_assistance' ? 'senior_citizen' : null,
        supportDetails: priority === 'special_assistance' ? 'Requested kiosk accessibility assistance.' : ''
      });

      setGeneratedToken(token);
      setMyTokenNumber(token.tokenNumber);
      setStep(4);

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

  return (
    <div className="max-w-4xl mx-auto py-4">
      
      {/* Kiosk Device Frame */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-10 shadow-2xl border-4 border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
        
        {/* Kiosk Header */}
        <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-black shadow-lg shadow-brand-blue/30">
              <Tablet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue">
                Self-Service Touch Kiosk Terminal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {currentPlace?.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Hub Selector */}
            {step === 1 && (
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              >
                {places.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}

            {step > 1 && step < 4 && (
              <button
                onClick={handleResetToStart}
                className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center max-w-lg mx-auto mb-8">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Touch a Service to Begin
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Please tap the department or consultation counter you need today.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {placeServices.map(srv => (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedService(srv);
                    setStep(2);
                  }}
                  className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-brand-blue bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/20 cursor-pointer transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-brand-blue">
                      Prefix {srv.prefix}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      ~{srv.avgDurationMins}m wait
                    </span>
                  </div>

                  <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 group-hover:text-brand-blue transition-colors">
                    {srv.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {srv.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Priority Group */}
        {step === 2 && (
          <div className="space-y-6 max-w-lg mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <span className="font-mono text-xs font-bold text-brand-blue">
                Selected: {selectedService?.name}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                Do you require Special Assistance?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Senior citizens (60+) and visitors needing physical or wheelchair assistance receive priority routing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setPriority('normal');
                  setStep(3);
                }}
                className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 hover:border-brand-blue bg-slate-50 dark:bg-slate-800 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold mb-3">
                  <User className="w-5 h-5" />
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-slate-100">
                  Standard Visitor
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  General consultation & standard queue order.
                </p>
              </button>

              <button
                onClick={() => {
                  setPriority('special_assistance');
                  setStep(3);
                }}
                className="p-6 rounded-3xl border-2 border-purple-300 dark:border-purple-700/60 bg-purple-50/50 dark:bg-purple-950/30 hover:border-purple-500 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-200 dark:bg-purple-900 text-brand-purple flex items-center justify-center font-bold mb-3">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h4 className="font-black text-base text-purple-950 dark:text-purple-200">
                  Special Assistance
                </h4>
                <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mt-1">
                  Ages 60+, PWD, mobility aid & priority access.
                </p>
              </button>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Details or Quick 1-Touch */}
        {step === 3 && (
          <div className="space-y-6 max-w-md mx-auto animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                Contact Details (Optional)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your mobile number to receive live turn notifications when your turn approaches.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alice Smith"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Mobile Number (For Turn Alerts)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => handleIssueToken(false)}
                  disabled={submitting}
                  className="w-full py-4 bg-brand-blue hover:opacity-90 text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-blue/30 flex items-center justify-center space-x-2 transition-all"
                >
                  <Printer className="w-5 h-5" />
                  <span>{submitting ? 'Dispensing Ticket...' : 'Print My Ticket'}</span>
                </button>

                <button
                  onClick={() => handleIssueToken(true)}
                  disabled={submitting}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-colors"
                >
                  Skip & Issue Quick 1-Touch Token
                </button>
              </div>

              <div className="pt-2 flex justify-start">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Printed Thermal Ticket Slip */}
        {step === 4 && generatedToken && (
          <div className="space-y-6 max-w-sm mx-auto text-center animate-slide-up">
            
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce-subtle">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                Please Take Your Ticket
              </h3>
              <p className="text-xs text-slate-500">
                Watch the lobby display screen or your smartphone for your turn.
              </p>
            </div>

            {/* Simulated Thermal Ticket Receipt */}
            <div className="bg-white text-slate-950 p-6 rounded-2xl shadow-xl border-2 border-dashed border-slate-300 font-mono text-left space-y-4">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <div className="font-extrabold text-sm tracking-tight">{generatedToken.placeName}</div>
                <div className="text-[10px] text-slate-500 uppercase">{generatedToken.serviceName}</div>
              </div>

              <div className="text-center py-2">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">TOKEN NUMBER</div>
                <div className="text-5xl font-black tracking-tight">{generatedToken.tokenNumber}</div>
                <div className="text-[10px] font-bold uppercase mt-1 px-2 py-0.5 inline-block bg-slate-100 rounded">
                  {generatedToken.priority === 'special_assistance' ? '💜 Priority Care' : 'Standard'}
                </div>
              </div>

              <div className="text-xs space-y-1 pt-2 border-t border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">People Ahead:</span>
                  <span className="font-bold">{generatedToken.peopleAhead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Wait Time:</span>
                  <span className="font-bold">~{generatedToken.estimatedWaitMins} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issued At:</span>
                  <span className="font-bold">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              {/* QR Code Sim */}
              <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-center space-x-3 text-center">
                <QrCode className="w-12 h-12 text-slate-800" />
                <div className="text-[9px] text-slate-500 text-left leading-tight">
                  Scan with your phone to track queue position live outside.
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Screen will reset automatically in <span className="font-bold text-brand-blue">{resetTimer}s</span>
            </div>

            <button
              onClick={handleResetToStart}
              className="w-full py-3 bg-brand-blue text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all"
            >
              Done &bull; Next Visitor
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
