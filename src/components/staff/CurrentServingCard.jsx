import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Volume2,
  CheckCircle,
  PauseCircle,
  SkipForward,
  Repeat,
  ArrowRightLeft,
  Clock,
  User,
  Phone,
  FileText,
  AlertCircle,
  Sparkles,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CurrentServingCard({
  activeCounter,
  servingToken,
  onCallNext,
  onOpenTransfer
}) {
  const {
    recallCustomer,
    startService,
    completeService,
    skipCustomer,
    holdCustomer,
    currentUser
  } = useApp();

  const [elapsedSec, setElapsedSec] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [staffNotes, setStaffNotes] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipReason, setSkipReason] = useState('Customer did not respond after 3 calls');
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState('Missing required identification/documents');
  const [loadingAction, setLoadingAction] = useState(false);

  // Live stopwatch timer
  useEffect(() => {
    if (!servingToken) {
      setElapsedSec(0);
      return;
    }

    const startTimestamp = servingToken.serviceStartedAt || servingToken.calledAt || servingToken.joinedAt;
    const startTime = new Date(startTimestamp).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSec(diffSec);
    }, 1000);

    return () => clearInterval(interval);
  }, [servingToken]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecall = async () => {
    if (!servingToken) return;
    setLoadingAction(true);
    try {
      await recallCustomer(servingToken.id);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStart = async () => {
    if (!servingToken) return;
    setLoadingAction(true);
    try {
      await startService(servingToken.id);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!servingToken) return;
    setLoadingAction(true);
    try {
      await completeService(servingToken.id, staffNotes);
      confetti({ particleCount: 50, spread: 60 });
      setShowCompleteModal(false);
      setStaffNotes('');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSkipSubmit = async (e) => {
    e.preventDefault();
    if (!servingToken) return;
    setLoadingAction(true);
    try {
      await skipCustomer(servingToken.id, skipReason);
      setShowSkipModal(false);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleHoldSubmit = async (e) => {
    e.preventDefault();
    if (!servingToken) return;
    setLoadingAction(true);
    try {
      await holdCustomer(servingToken.id, holdReason);
      setShowHoldModal(false);
    } finally {
      setLoadingAction(false);
    }
  };

  if (!servingToken) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">
          Counter is Idle
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
          Ready to attend the next waiting customer. The queue system will prioritize VIPs and Senior Citizens automatically.
        </p>

        <button
          onClick={onCallNext}
          className="py-3.5 px-8 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center space-x-2 mx-auto transform hover:-translate-y-0.5"
        >
          <Volume2 className="w-5 h-5 animate-pulse" />
          <span>Call Next Customer</span>
        </button>
      </div>
    );
  }

  const isCalling = servingToken.status === 'calling';
  const isInService = servingToken.status === 'in_service';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-brand-400">
              {activeCounter?.name || 'Counter Station'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-semibold text-emerald-300">Live Active Desk</span>
          </div>
          <h2 className="text-xl font-black">{servingToken.serviceName}</h2>
        </div>

        {/* Stopwatch Timer Display */}
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
          <Clock className="w-5 h-5 text-amber-300 animate-spin-slow" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Service Duration</div>
            <div className="font-mono text-2xl font-black text-white tracking-wider">
              {formatTimer(elapsedSec)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: Token & Customer Details */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          
          <div className="flex items-center space-x-5">
            <div className="w-24 h-24 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border-2 border-brand-500/30 flex flex-col items-center justify-center text-center p-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Token</span>
              <span className="font-mono text-3xl font-black text-brand-600 dark:text-brand-400">
                {servingToken.tokenNumber}
              </span>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded mt-1 ${
                servingToken.priority === 'priority' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {servingToken.priority}
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {servingToken.customerName}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  isCalling 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                }`}>
                  {isCalling ? 'Calling to Desk' : 'In Consultation'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{servingToken.customerPhone || 'N/A'}</span>
                </span>
                <span>&bull;</span>
                <span>Joined: {new Date(servingToken.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {servingToken.recallCount > 0 && (
                  <>
                    <span>&bull;</span>
                    <span className="text-amber-600 font-semibold">Recalled {servingToken.recallCount}x</span>
                  </>
                )}
              </div>

              {servingToken.notes && (
                <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-2 max-w-lg">
                  <FileText className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <span><strong>Customer Note:</strong> {servingToken.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Button for Status */}
          {isCalling && (
            <button
              onClick={handleStart}
              disabled={loadingAction}
              className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Play className="w-4 h-4" />
              <span>Customer Arrived &bull; Start Service</span>
            </button>
          )}

        </div>

        {/* Staff Action Controls Grid */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          {/* Complete Service */}
          <button
            onClick={() => setShowCompleteModal(true)}
            className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex flex-col items-center justify-center space-y-1"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete Service</span>
          </button>

          {/* Recall */}
          <button
            onClick={handleRecall}
            disabled={loadingAction}
            className="py-3 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-700 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex flex-col items-center justify-center space-y-1"
          >
            <Volume2 className="w-4 h-4 text-amber-500" />
            <span>Recall Customer</span>
          </button>

          {/* Put on Hold */}
          <button
            onClick={() => setShowHoldModal(true)}
            className="py-3 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex flex-col items-center justify-center space-y-1"
          >
            <PauseCircle className="w-4 h-4 text-blue-500" />
            <span>Put on Hold</span>
          </button>

          {/* Transfer */}
          <button
            onClick={() => onOpenTransfer(servingToken)}
            className="py-3 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex flex-col items-center justify-center space-y-1"
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-500" />
            <span>Transfer Desk</span>
          </button>

          {/* Skip / No-show */}
          <button
            onClick={() => setShowSkipModal(true)}
            className="py-3 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-700 dark:text-slate-200 hover:text-rose-600 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex flex-col items-center justify-center space-y-1"
          >
            <SkipForward className="w-4 h-4 text-rose-500" />
            <span>Skip / No Show</span>
          </button>

        </div>

      </div>

      {/* Complete Modal with Notes */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">
              Complete Consultation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Token {servingToken.tokenNumber} &bull; Total duration: {Math.max(1, Math.round(elapsedSec / 60))} minutes
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Staff Notes / Resolution
                </label>
                <textarea
                  rows="3"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="Record outcome, prescribed medication, or transaction ID..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Confirm & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skip Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-1">
              Skip Customer {servingToken.tokenNumber}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Please specify reason for marking as no-show:
            </p>

            <form onSubmit={handleSkipSubmit} className="space-y-3">
              <select
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                <option value="Customer did not respond after 3 calls">Customer did not respond after 3 calls</option>
                <option value="Customer left the premises">Customer left the premises</option>
                <option value="Called in error">Called in error</option>
              </select>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkipModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                >
                  Skip Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hold Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-1">
              Put Token {servingToken.tokenNumber} On Hold
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              This frees your counter to attend other waiting customers. You can resume this token anytime.
            </p>

            <form onSubmit={handleHoldSubmit} className="space-y-3">
              <input
                type="text"
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="Reason e.g. Payment pending, Photocopy required"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHoldModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  Put on Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
