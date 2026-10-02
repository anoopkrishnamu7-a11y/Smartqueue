import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Users,
  Check,
  Shield,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function JoinQueueModal({ isOpen, onClose, defaultBranch }) {
  const { services, branches, createToken, currentUser } = useApp();

  const [branchId, setBranchId] = useState(defaultBranch ? defaultBranch.id : 'branch-101');
  const [serviceId, setServiceId] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [priority, setPriority] = useState('normal'); // 'normal', 'priority', 'vip'
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync if branch changes
  const availableServices = services.filter(s => s.branchId === branchId);

  // Set default service if empty
  React.useEffect(() => {
    if (availableServices.length > 0 && !serviceId) {
      setServiceId(availableServices[0].id);
    }
  }, [availableServices, serviceId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceId) {
      alert('Please select a service');
      return;
    }

    setSubmitting(true);
    try {
      const token = await createToken({
        branchId,
        serviceId,
        customerName: customerName || 'Valued Guest',
        customerPhone: customerPhone || '+1 (555) 000-0000',
        priority,
        type: 'walk_in',
        notes
      });

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClose();
    } catch (err) {
      // Error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Join Digital Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get your instant token and wait comfortably from anywhere.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Branch Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Select Branch
            </label>
            <select
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                const s = services.filter(sv => sv.branchId === e.target.value);
                if (s.length > 0) setServiceId(s[0].id);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Select Service
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {availableServices.map(srv => {
                const isSelected = serviceId === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setServiceId(srv.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {srv.prefix}-Series
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-0.5" />
                        ~{srv.avgDurationMins}m
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                      {srv.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Mobile Number (SMS Alert)
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Priority Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                  priority === 'normal'
                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Standard
              </button>

              <button
                type="button"
                onClick={() => setPriority('priority')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                  priority === 'priority'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Senior / Care
              </button>

              <button
                type="button"
                onClick={() => setPriority('vip')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                  priority === 'vip'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Urgent / VIP
              </button>
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Purpose of Visit (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief note for the counter staff..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Generating Token...' : 'Generate My Token Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
