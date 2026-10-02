import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  MapPin,
  X,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SpecialAssistanceApprovedModal() {
  const {
    activeModal,
    setActiveModal,
    specialAssistanceApprovedData,
    setSpecialAssistanceApprovedData
  } = useApp();

  useEffect(() => {
    if (activeModal === 'special_assistance_approved' && specialAssistanceApprovedData) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.5 }
      });
    }
  }, [activeModal, specialAssistanceApprovedData]);

  if (activeModal !== 'special_assistance_approved' || !specialAssistanceApprovedData) return null;

  const handleClose = () => {
    setActiveModal(null);
  };

  const handleTrack = () => {
    setActiveModal('track_token');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-purple-500 animate-slide-up text-center">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Celebration Badge */}
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950 text-brand-purple rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20 animate-bounce-subtle">
          <HeartHandshake className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-brand-purple text-xs font-bold uppercase tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
          <span>Staff Approval Confirmed</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight mb-1">
          💜 Special Assistance Approved!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Your request for priority mobility and assistance has been reviewed and granted.
        </p>

        {/* Highlight Card */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-purple-950/50 rounded-2xl p-5 border-2 border-purple-300 dark:border-purple-800 text-left space-y-3 mb-6 shadow-inner text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-purple-200 dark:border-purple-800/80">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Visitor:</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              {specialAssistanceApprovedData.customerName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Service:</span>
            <span className="font-bold text-brand-blue">
              {specialAssistanceApprovedData.serviceName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Category:</span>
            <span className="font-bold text-brand-purple">
              {specialAssistanceApprovedData.categoryLabel}
            </span>
          </div>

          <div className="pt-2 border-t border-purple-200 dark:border-purple-800/80">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Assigned Station / Desk:</span>
            <div className="text-base font-black text-brand-navy dark:text-white flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{specialAssistanceApprovedData.assignedRoom || 'Consultation Room 2'}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Reviewed by: <strong className="text-slate-700 dark:text-slate-200">{specialAssistanceApprovedData.reviewedBy || 'Duty Officer'}</strong>
            </div>
          </div>
        </div>

        {/* Arrival Instructions */}
        <div className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-left">
          <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Please approach the entrance help desk or head directly to <strong>{specialAssistanceApprovedData.assignedRoom || 'Consultation Room 2'}</strong>. Staff has been notified of your priority arrival.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleTrack}
            className="w-full py-3.5 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <span>Proceed & Track Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            I'm On My Way (Dismiss)
          </button>
        </div>

      </div>
    </div>
  );
}
