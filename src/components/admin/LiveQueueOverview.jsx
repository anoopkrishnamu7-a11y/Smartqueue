import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Coffee,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

export default function LiveQueueOverview() {
  const { counters, services, tokens, branches, selectedBranchId } = useApp();

  const branchCounters = counters.filter(c => c.branchId === selectedBranchId);
  const branchServices = services.filter(s => s.branchId === selectedBranchId);
  const branchTokens = tokens.filter(t => t.branchId === selectedBranchId);

  const waitingTokens = branchTokens.filter(t => t.status === 'waiting');
  const servingTokens = branchTokens.filter(t => t.status === 'in_service' || t.status === 'calling');

  return (
    <div className="space-y-6">
      
      {/* Counters Status Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Live Counter Stations & Attendants
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time monitoring of all service windows and active tokens.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
            {branchCounters.filter(c => c.status === 'busy' || c.status === 'available').length} / {branchCounters.length} Counters Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchCounters.map(ctr => {
            const activeToken = tokens.find(t => t.id === ctr.currentTokenId || (t.counterId === ctr.id && (t.status === 'in_service' || t.status === 'calling')));

            return (
              <div
                key={ctr.id}
                className={`p-4 rounded-2xl border transition-all ${
                  ctr.status === 'busy'
                    ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20'
                    : ctr.status === 'available'
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : ctr.status === 'on_break'
                    ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {ctr.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {ctr.currentStaffName || 'Unassigned Staff'}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    ctr.status === 'busy'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : ctr.status === 'available'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : ctr.status === 'on_break'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {ctr.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Serving Info */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">Now Serving: </span>
                    {activeToken ? (
                      <span className="font-mono font-black text-brand-600 dark:text-brand-400 text-sm">
                        {activeToken.tokenNumber}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold italic">Ready for next</span>
                    )}
                  </div>

                  {ctr.breakReason && (
                    <span className="text-[10px] font-medium text-amber-600 truncate max-w-[120px]">
                      {ctr.breakReason}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Services Waiting Depth Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-1">
          Service Queues & Waiting Volume
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Real-time breakdown of waiting customers, average handling time, and active capacity by service.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {branchServices.map(srv => {
            const serviceWaiting = waitingTokens.filter(t => t.serviceId === srv.id);
            const activeCountersServing = branchCounters.filter(c => c.serviceIds.includes(srv.id));

            return (
              <div
                key={srv.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    Series {srv.prefix}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    ~{srv.avgDurationMins}m / turn
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 truncate">
                  {srv.name}
                </h4>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Waiting Queue:</span>
                  <span className="font-mono font-black text-base text-brand-600 dark:text-brand-400">
                    {serviceWaiting.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Assigned Counters:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {activeCountersServing.length} Open
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
