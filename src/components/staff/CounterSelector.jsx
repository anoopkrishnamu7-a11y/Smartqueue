import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Coffee,
  CheckCircle,
  AlertOctagon,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function CounterSelector({ activeCounter, onSelectCounter }) {
  const { counters, branches, selectedBranchId, updateCounterStatus, currentUser } = useApp();
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakReason, setBreakReason] = useState('Lunch Break');

  const branchCounters = counters.filter(c => c.branchId === selectedBranchId);

  const breakOptions = [
    'Lunch Break',
    'Tea / Coffee Break',
    'Sanitization & Restock',
    'System Maintenance',
    'Shift Handover',
    'Administrative Work'
  ];

  const handleStatusChange = async (newStatus) => {
    if (!activeCounter) return;
    if (newStatus === 'on_break') {
      setShowBreakModal(true);
      return;
    }
    await updateCounterStatus(activeCounter.id, newStatus, '');
  };

  const submitBreak = async (e) => {
    e.preventDefault();
    if (!activeCounter) return;
    await updateCounterStatus(activeCounter.id, 'on_break', breakReason);
    setShowBreakModal(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      
      {/* Left: Active Counter Picker */}
      <div className="flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-black">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assigned Station
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            <select
              value={activeCounter?.id || ''}
              onChange={(e) => {
                const c = counters.find(x => x.id === e.target.value);
                if (c) onSelectCounter(c);
              }}
              className="bg-transparent font-black text-lg text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {branchCounters.map(c => (
                <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm">
                  {c.name} &bull; {c.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Attendant: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.name || 'Staff Member'}</span>
          </p>
        </div>
      </div>

      {/* Right: Counter Status Controls */}
      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          
          <button
            onClick={() => handleStatusChange('available')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeCounter?.status === 'available'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Available</span>
          </button>

          <button
            onClick={() => handleStatusChange('busy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeCounter?.status === 'busy'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Busy</span>
          </button>

          <button
            onClick={() => handleStatusChange('on_break')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeCounter?.status === 'on_break'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>On Break</span>
          </button>

          <button
            onClick={() => handleStatusChange('closed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeCounter?.status === 'closed'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Closed</span>
          </button>

        </div>
      </div>

      {/* Break Reason Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              Select Break Reason
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              This message will be displayed on the public TV display for waiting customers.
            </p>

            <form onSubmit={submitBreak} className="space-y-4">
              <select
                value={breakReason}
                onChange={(e) => setBreakReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                {breakOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBreakModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg"
                >
                  Start Break
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
