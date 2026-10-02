import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  MapPin,
  Volume2,
  X,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FinalTurnAlertModal() {
  const { finalTurnAlertData, activeModal, setActiveModal, setFinalTurnAlertData } = useApp();

  useEffect(() => {
    if (activeModal === 'final_turn_alert' && finalTurnAlertData) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  }, [activeModal, finalTurnAlertData]);

  if (activeModal !== 'final_turn_alert' || !finalTurnAlertData) return null;

  const handleClose = () => {
    setActiveModal(null);
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border-4 border-emerald-500 animate-slide-up text-center transition-colors">
        
        <button
          onClick={handleClose}
          aria-label="Close alert"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Celebration Badge */}
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 animate-bounce-subtle">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Now Calling</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight mb-1">
          🎉 It's Your Turn!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Your token is currently being called at the service desk.
        </p>

        {/* Station Highlight Box */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-emerald-950/40 rounded-2xl p-6 border-2 border-emerald-300 dark:border-emerald-800 text-center space-y-2 mb-6 shadow-inner">
          <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
            YOUR TOKEN NUMBER
          </div>
          <div className="font-mono text-5xl sm:text-6xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {finalTurnAlertData.tokenNumber}
          </div>

          <div className="pt-3 border-t border-emerald-200 dark:border-slate-700">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Please proceed immediately to:</span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {finalTurnAlertData.counterName || 'Assigned Consultation Desk'}
            </div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
              Attendant: {finalTurnAlertData.staffName || 'Officer on Duty'}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Please show your digital pass or token number to the attendant upon entry.
        </p>

        <button
          onClick={handleClose}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I'm Heading to the Desk</span>
        </button>

      </div>
    </div>
  );
}
