import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Plus,
  Users,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CounterManager() {
  const { counters, services, addCounter, selectedBranchId, allUsers } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [counterName, setCounterName] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [staffName, setStaffName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const branchCounters = counters.filter(c => c.branchId === selectedBranchId);
  const branchServices = services.filter(s => s.branchId === selectedBranchId);

  const toggleService = (srvId) => {
    if (selectedServices.includes(srvId)) {
      setSelectedServices(selectedServices.filter(id => id !== srvId));
    } else {
      setSelectedServices([...selectedServices, srvId]);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addCounter({
        branchId: selectedBranchId,
        name: counterName || `Counter ${branchCounters.length + 1}`,
        serviceIds: selectedServices.length > 0 ? selectedServices : branchServices.map(s => s.id),
        currentStaffName: staffName || 'Unassigned'
      });
      setShowAddModal(false);
      setCounterName('');
      setSelectedServices([]);
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
            Physical Counters & Service Windows
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Map counters to departments, assign attending staff, and regulate capacity.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Counter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branchCounters.map(ctr => {
          const mappedServices = services.filter(s => ctr.serviceIds.includes(s.id));

          return (
            <div
              key={ctr.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {ctr.name}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  ctr.status === 'busy'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : ctr.status === 'available'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {ctr.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Assigned Attendant: <strong className="text-slate-700 dark:text-slate-300">{ctr.currentStaffName || 'Open Staffing'}</strong>
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Handled Departments ({mappedServices.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {mappedServices.map(ms => (
                    <span
                      key={ms.id}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                    >
                      {ms.prefix}: {ms.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Counter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Add Counter Window
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
                  Counter Name / Number
                </label>
                <input
                  type="text"
                  required
                  value={counterName}
                  onChange={(e) => setCounterName(e.target.value)}
                  placeholder={`Counter ${branchCounters.length + 1} - Specialist`}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Primary Attendant Name
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Dr. Jennifer Lopez"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Services Handled by this Counter
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {branchServices.map(srv => {
                    const checked = selectedServices.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`p-2 rounded-xl border cursor-pointer text-xs flex items-center justify-between ${
                          checked
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>[{srv.prefix}] {srv.name}</span>
                        {checked && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                    );
                  })}
                </div>
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
                  {submitting ? 'Creating...' : 'Create Counter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
