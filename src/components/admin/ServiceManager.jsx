import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  Plus,
  Clock,
  Layers,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';

export default function ServiceManager() {
  const { services, branches, addService, selectedBranchId } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('G');
  const [description, setDescription] = useState('');
  const [avgDurationMins, setAvgDurationMins] = useState(10);
  const [dailyCapacity, setDailyCapacity] = useState(150);
  const [color, setColor] = useState('#4f46e5');
  const [submitting, setSubmitting] = useState(false);

  const branchServices = services.filter(s => s.branchId === selectedBranchId);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addService({
        branchId: selectedBranchId,
        name,
        prefix: prefix.toUpperCase().trim(),
        description,
        avgDurationMins: Number(avgDurationMins),
        dailyCapacity: Number(dailyCapacity),
        color
      });
      setShowAddModal(false);
      setName('');
      setDescription('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
            Configured Services & Token Prefixes
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define service codes (e.g. A, B, C, P), target consultation durations, and daily token quotas.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branchServices.map(srv => (
          <div
            key={srv.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 relative"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {srv.prefix}-Series
                </span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: srv.color }}></span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
              {srv.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
              {srv.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Target Time</span>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {srv.avgDurationMins} minutes
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Daily Cap</span>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {srv.dailyCapacity} tokens
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Create New Service
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Triage / Specialist Surgery"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Token Prefix
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    placeholder="e.g. A, B, C, V"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Avg Handling (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={avgDurationMins}
                    onChange={(e) => setAvgDurationMins(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note about this department..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
                >
                  {submitting ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
