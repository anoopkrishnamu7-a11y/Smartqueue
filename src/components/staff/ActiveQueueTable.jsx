import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Clock,
  Volume2,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function ActiveQueueTable({ activeCounter, onDirectCall }) {
  const { tokens, resumeHeldCustomer, currentUser } = useApp();
  const [filterTab, setFilterTab] = useState('waiting'); // 'waiting', 'on_hold', 'all'
  const [priorityOnly, setPriorityOnly] = useState(false);

  if (!activeCounter) return null;

  // Filter tokens matching counter services & branch
  const counterTokens = tokens.filter(t => 
    t.branchId === activeCounter.branchId &&
    activeCounter.serviceIds.includes(t.serviceId)
  );

  const waitingTokens = counterTokens.filter(t => t.status === 'waiting');
  const onHoldTokens = counterTokens.filter(t => t.status === 'on_hold');

  let displayTokens = filterTab === 'waiting' 
    ? waitingTokens 
    : filterTab === 'on_hold' 
    ? onHoldTokens 
    : counterTokens;

  if (priorityOnly) {
    displayTokens = displayTokens.filter(t => t.priority === 'priority' || t.priority === 'vip');
  }

  const handleResume = async (token) => {
    try {
      await resumeHeldCustomer(token.id, activeCounter.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Live Queue Roster
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {waitingTokens.length} waiting
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Assigned to {activeCounter.name} services
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setFilterTab('waiting')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'waiting'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Waiting ({waitingTokens.length})
            </button>
            <button
              onClick={() => setFilterTab('on_hold')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'on_hold'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              On Hold ({onHoldTokens.length})
            </button>
          </div>

          <button
            onClick={() => setPriorityOnly(!priorityOnly)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              priorityOnly
                ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
            }`}
          >
            ★ Priority Only
          </button>
        </div>
      </div>

      {/* Roster Table */}
      {displayTokens.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">
            {filterTab === 'on_hold' ? 'No customers currently on hold.' : 'Queue is clear! No customers waiting.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3">Token #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Wait Time</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayTokens.map((t, index) => {
                const waitMins = Math.max(1, Math.round((Date.now() - new Date(t.joinedAt).getTime()) / 60000));
                const isNext = index === 0 && filterTab === 'waiting';

                return (
                  <tr
                    key={t.id}
                    className={`transition-colors ${
                      isNext
                        ? 'bg-brand-50/40 dark:bg-brand-950/20 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">
                      #{index + 1}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-black text-slate-900 dark:text-slate-100">
                          {t.tokenNumber}
                        </span>
                        {isNext && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-brand-600 text-white">
                            NEXT
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{t.customerName}</div>
                      <div className="text-[10px] text-slate-400">{t.customerPhone || 'Walk-in'}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-500 capitalize">
                      {t.type === 'appointment' ? 'Appointment' : 'Walk-in'}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.priority === 'vip'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : t.priority === 'priority'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {waitMins}m in queue
                    </td>

                    <td className="py-3 px-3 text-right">
                      {filterTab === 'on_hold' ? (
                        <button
                          onClick={() => handleResume(t)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold"
                        >
                          Resume
                        </button>
                      ) : (
                        <button
                          onClick={() => onDirectCall(t)}
                          className="px-2.5 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300 rounded-lg text-xs font-bold flex items-center space-x-1 ml-auto"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
