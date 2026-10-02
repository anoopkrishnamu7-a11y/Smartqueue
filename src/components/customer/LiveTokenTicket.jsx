import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Printer,
  XCircle,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  MapPin,
  QrCode,
  Calendar
} from 'lucide-react';

export default function LiveTokenTicket({ token, onOpenFeedback }) {
  const { cancelToken, soundEnabled, setSoundEnabled, branches, services } = useApp();
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!token) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">No Active Token</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          You haven't joined any queue yet. Browse our services below to generate your digital token or book an appointment.
        </p>
      </div>
    );
  }

  const branch = branches.find(b => b.id === token.branchId);
  const service = services.find(s => s.id === token.serviceId);

  // Status mapping
  const steps = [
    { key: 'waiting', label: 'In Queue', desc: 'Token generated & position held' },
    { key: 'approaching', label: 'Approaching', desc: 'Within 2 customers of turn' },
    { key: 'calling', label: 'Calling', desc: 'Please proceed to counter' },
    { key: 'in_service', label: 'At Counter', desc: 'Being served now' },
    { key: 'completed', label: 'Completed', desc: 'Service finished' },
  ];

  const getStepIndex = () => {
    if (token.status === 'completed') return 4;
    if (token.status === 'in_service') return 3;
    if (token.status === 'calling') return 2;
    if (token.status === 'waiting' && token.peopleAhead <= 1) return 1;
    if (token.status === 'waiting') return 0;
    if (token.status === 'on_hold') return 1;
    return 0;
  };

  const currentStepIdx = getStepIndex();
  const isTurnNow = token.status === 'calling';
  const isCompleted = token.status === 'completed';
  const isCancelled = token.status === 'cancelled';
  const isSkipped = token.status === 'skipped';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/track?token=${token.tokenNumber}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCancel = async () => {
    if (window.confirm(`Are you sure you want to cancel token ${token.tokenNumber}?`)) {
      setCancelling(true);
      try {
        await cancelToken(token.id, 'Customer cancelled from ticket view');
      } finally {
        setCancelling(false);
      }
    }
  };

  return (
    <div className="relative">
      
      {/* Alert Banner if Called or Approaching */}
      {isTurnNow && (
        <div className="mb-4 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-0.5 rounded-2xl animate-bounce-subtle shadow-xl shadow-amber-500/20">
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 animate-pulse">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  IT'S YOUR TURN! PROCEED TO {token.counterName?.toUpperCase() || 'COUNTER'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Staff member <span className="font-semibold text-slate-700 dark:text-slate-300">{token.staffName || 'Attendant'}</span> is calling you.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-500 text-white font-bold rounded-lg text-xs animate-pulse">
              NOW CALLING
            </span>
          </div>
        </div>
      )}

      {token.status === 'waiting' && token.peopleAhead <= 1 && (
        <div className="mb-4 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3.5 flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 animate-pulse" />
          <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
            <strong className="font-bold">Turn Approaching:</strong> Only {token.peopleAhead} person ahead of you. Please head toward the service lobby area.
          </p>
        </div>
      )}

      {/* Main Digital Ticket Pass */}
      <div 
        id="printable-ticket"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all"
      >
        {/* Top Ticket Header */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 p-6 text-white relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{branch?.name || 'SmartQueue Branch'}</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{token.serviceName}</h2>
              <p className="text-xs text-indigo-100/80 mt-0.5">
                Customer: <span className="font-semibold text-white">{token.customerName}</span> &bull; {token.type === 'appointment' ? 'Scheduled Appointment' : 'Walk-in Token'}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                token.priority === 'vip' 
                  ? 'bg-rose-500 text-white border-rose-400' 
                  : token.priority === 'priority' 
                  ? 'bg-amber-400 text-amber-950 border-amber-300' 
                  : 'bg-white/20 text-white border-white/30 backdrop-blur-sm'
              }`}>
                {token.priority === 'priority' ? 'Priority Group' : token.priority === 'vip' ? 'VIP Priority' : 'Standard'}
              </span>
              <span className="text-[11px] text-indigo-200 mt-1 font-mono">
                {new Date(token.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Perforated divider line for realistic ticket look */}
        <div className="relative h-6 bg-slate-100 dark:bg-slate-950 flex items-center justify-between px-2 overflow-hidden border-y border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 -ml-4"></div>
          <div className="w-full border-t border-dashed border-slate-300 dark:border-slate-700"></div>
          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 -mr-4"></div>
        </div>

        {/* Hero Token Display & Metrics */}
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
              YOUR DIGITAL TOKEN
            </p>
            <div className="inline-block relative">
              <h1 className="text-6xl sm:text-7xl font-black tracking-tight font-mono text-slate-900 dark:text-white drop-shadow-sm">
                {token.tokenNumber}
              </h1>
              {token.status === 'calling' && (
                <span className="absolute -top-3 -right-6 px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full animate-ping">
                  NOW
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                token.status === 'waiting'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : token.status === 'calling'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 animate-pulse'
                  : token.status === 'in_service'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  : token.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                Status: {token.status.replace('_', ' ')}
              </span>
              {token.counterName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {token.counterName}
                </span>
              )}
            </div>
          </div>

          {/* Key Queue Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center text-slate-400 mb-1">
                <Users className="w-4 h-4 mr-1 text-brand-600" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">People Ahead</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {token.status === 'waiting' ? token.peopleAhead : 0}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {token.peopleAhead === 0 && token.status === 'waiting' ? 'Next in line!' : 'in queue ahead'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center text-slate-400 mb-1">
                <Clock className="w-4 h-4 mr-1 text-amber-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Est. Wait</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {token.status === 'waiting' ? `${token.estimatedWaitMins}m` : token.status === 'calling' ? '0m' : 'In Desk'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {token.status === 'waiting' ? 'live calculated' : 'ready now'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center text-slate-400 mb-1">
                <Sparkles className="w-4 h-4 mr-1 text-emerald-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Serving Now</span>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {token.counterName ? token.counterName.replace('Counter ', 'C-') : 'Awaiting'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">assigned station</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center text-slate-400 mb-1">
                <CheckCircle2 className="w-4 h-4 mr-1 text-indigo-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Service</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {service?.avgDurationMins || 10}m
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">target handling</p>
            </div>

          </div>

          {/* Stepper Visual Progress Indicator */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Queue Lifecycle Progress
            </h4>
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0 hidden sm:block"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-brand-600 -translate-y-1/2 z-0 transition-all duration-500 hidden sm:block"
                style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
              ></div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
                {steps.map((step, idx) => {
                  const isPast = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div key={step.key} className="flex sm:flex-col items-center sm:text-center space-x-3 sm:space-x-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950 scale-110'
                          : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="sm:mt-2">
                        <div className={`text-xs font-bold ${isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {step.label}
                        </div>
                        <div className="text-[10px] text-slate-400 hidden sm:block">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ticket Footer Actions */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Ticket</span>
              </button>

              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{copied ? 'Link Copied!' : 'Share Pass'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {isCompleted ? (
                <button
                  onClick={() => onOpenFeedback(token)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Rate Your Experience</span>
                </button>
              ) : !isCancelled && !isSkipped ? (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{cancelling ? 'Cancelling...' : 'Cancel Token'}</span>
                </button>
              ) : null}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
