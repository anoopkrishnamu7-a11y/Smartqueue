import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ArrowRightLeft,
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function TransferModal({ isOpen, onClose, token }) {
  const { services, counters, transferCustomer, branches } = useApp();

  const [targetServiceId, setTargetServiceId] = useState('');
  const [targetCounterId, setTargetCounterId] = useState('');
  const [reason, setReason] = useState('Referred for diagnostic X-ray / lab test');
  const [submitting, setSubmitting] = useState(false);

  // Available services in same branch excluding current service
  const branchServices = services.filter(s => 
    token && s.branchId === token.branchId && s.id !== token.serviceId
  );

  React.useEffect(() => {
    if (branchServices.length > 0 && !targetServiceId) {
      setTargetServiceId(branchServices[0].id);
    }
  }, [branchServices, targetServiceId]);

  if (!isOpen || !token) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetServiceId) {
      alert('Please select a target service');
      return;
    }

    setSubmitting(true);
    try {
      await transferCustomer(token.id, targetServiceId, targetCounterId || null, reason);
      alert(`Token ${token.tokenNumber} has been transferred with priority retention.`);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Transfer Customer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Token {token.tokenNumber} &bull; {token.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Target Service Department
            </label>
            <select
              value={targetServiceId}
              onChange={(e) => setTargetServiceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            >
              {branchServices.map(srv => (
                <option key={srv.id} value={srv.id}>
                  {srv.name} ({srv.prefix}-Series &bull; ~{srv.avgDurationMins}m)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Transfer Reason / Clinical Referral
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold mb-2"
            >
              <option value="Referred for diagnostic X-ray / lab test">Referred for diagnostic X-ray / lab test</option>
              <option value="Referred to billing & pharmacy dispense">Referred to billing & pharmacy dispense</option>
              <option value="Specialist escalation consultation">Specialist escalation consultation</option>
              <option value="Wrong department selected by customer">Wrong department selected by customer</option>
            </select>

            <textarea
              rows="2"
              placeholder="Additional notes for target counter officer..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
            ></textarea>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-300">
            <strong>Note:</strong> Customer will automatically retain priority in the new department queue so they don't have to restart their wait from zero.
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
            >
              {submitting ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
