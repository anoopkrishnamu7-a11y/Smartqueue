import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  TrendingUp
} from 'lucide-react';

export default function StaffMetrics({ activeCounter }) {
  const { tokens, currentUser, analytics } = useApp();

  const myServedToday = currentUser?.servedCountToday || 16;
  const avgHandling = currentUser?.avgHandlingMins || 9.2;
  const satisfaction = 4.9;

  // Active waiting for this counter's branch
  const branchWaitingCount = activeCounter 
    ? tokens.filter(t => t.branchId === activeCounter.branchId && t.status === 'waiting').length
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Served Today</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {myServedToday}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Handling Time</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {avgHandling}m
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Branch Waiting</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {branchWaitingCount}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">CSAT Rating</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono flex items-center space-x-1">
            <span>{satisfaction}</span>
            <span className="text-xs text-amber-400 font-normal">★</span>
          </div>
        </div>
      </div>

    </div>
  );
}
