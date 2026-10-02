import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function BranchDirectory({ onSelectBranch, onOpenJoinQueue, onOpenBookAppointment }) {
  const { organizations, branches, services, tokens, counters, selectedBranchId, setSelectedBranchId } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Healthcare', 'Banking & Finance', 'Government', 'Retail & Wellness'];

  const filteredBranches = branches.filter(branch => {
    if (selectedCategory === 'All') return true;
    const org = organizations.find(o => o.id === branch.orgId);
    return org && org.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Category Pills Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Select Organization & Branch
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse available locations, check current waiting times, and join a queue or schedule a visit.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBranches.map(branch => {
          const org = organizations.find(o => o.id === branch.orgId);
          const branchServices = services.filter(s => s.branchId === branch.id);
          const branchWaiting = tokens.filter(t => t.branchId === branch.id && t.status === 'waiting');
          const branchCounters = counters.filter(c => c.branchId === branch.id);
          const isSelected = selectedBranchId === branch.id;

          // Estimate total wait
          const avgWait = branchWaiting.length > 0 
            ? Math.round(branchWaiting.length * 8 / Math.max(1, branchCounters.length))
            : 3;

          return (
            <div
              key={branch.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {org?.category || 'Service Hub'}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">
                      {branch.name}
                    </h3>
                  </div>
                </div>

                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                  {branch.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{branch.address}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Hours: {branch.openHours}</span>
                </div>
              </div>

              {/* Branch Stats */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4 text-center border border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs text-slate-400 font-medium">In Queue</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {branchWaiting.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Est. Wait</div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                    ~{avgWait}m
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Counters</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {branchCounters.length} Open
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedBranchId(branch.id);
                    onOpenJoinQueue(branch);
                  }}
                  className="flex-1 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-600/20 transition-all text-center flex items-center justify-center space-x-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Join Queue</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedBranchId(branch.id);
                    onOpenBookAppointment(branch);
                  }}
                  className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Schedule</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
