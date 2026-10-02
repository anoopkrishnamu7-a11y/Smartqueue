import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Clock,
  MapPin,
  ArrowRight,
  X,
  Volume2,
  Sparkles
} from 'lucide-react';

export default function TwoMinuteAlertModal() {
  const { twoMinAlertData, setTwoMinAlertData, activeModal, setActiveModal, setAlertDismissed } = useApp();

  if (activeModal !== 'two_min_alert' || !twoMinAlertData) return null;

  const handleDismiss = () => {
    setActiveModal(null);
    setAlertDismissed(true);
  };

  const handleViewQueue = () => {
    setActiveModal('track_token');
    setAlertDismissed(true);
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border-4 border-amber-400 animate-slide-up text-left transition-colors">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          aria-label="Close alert"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Smartphone Push Notification Card Style (Section 13) */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black animate-bounce-subtle shrink-0">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                🔔 SmartQueue
              </span>
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold">
                Approaching Alert
              </span>
            </div>
            <h3 className="text-xl font-black text-brand-navy dark:text-white tracking-tight mt-0.5">
              Your turn is approaching!
            </h3>
          </div>
        </div>

        {/* Main Alert Payload Box (Section 13 requirement) */}
        <div className="bg-amber-50/80 dark:bg-slate-800/80 rounded-2xl p-5 border border-amber-200/80 dark:border-amber-700/60 space-y-3 mb-5">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Your token:</span>
            <span className="font-mono text-3xl font-black text-brand-navy dark:text-white">
              {twoMinAlertData.tokenNumber}
            </span>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-medium">
            <p className="text-amber-900 dark:text-amber-200 font-bold">
              Only a few customers are ahead of you.
            </p>
            <div className="flex justify-between items-center pt-1 border-t border-amber-200/60 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Estimated time:
              </span>
              <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-950 px-2 py-0.5 rounded">
                About 2 minutes
              </span>
            </div>
          </div>
        </div>

        {/* Guidance Prompt (Section 13 requirement) */}
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          Please get ready to approach the service counter.
        </p>

        {/* Action Button: View My Queue (Section 13 requirement) */}
        <div className="space-y-2">
          <button
            onClick={handleViewQueue}
            className="w-full py-3.5 bg-brand-blue hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/25 flex items-center justify-center space-x-2 transition-all"
          >
            <span>View My Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
