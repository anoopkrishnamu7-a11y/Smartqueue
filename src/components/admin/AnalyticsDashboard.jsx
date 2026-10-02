import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Award,
  Star,
  Sparkles,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { analytics, feedbacks, branches, selectedBranchId } = useApp();

  const currentBranch = branches.find(b => b.id === selectedBranchId);

  const stats = analytics || {
    totalTokens: 148,
    completedCount: 132,
    waitingCount: 9,
    servingCount: 5,
    avgWaitTimeMins: 11,
    avgServiceTimeMins: 9.4,
    csatRating: "4.9",
    hourlyData: [
      { hour: '08:00', tokens: 12, completed: 11, avgWait: 6 },
      { hour: '09:00', tokens: 28, completed: 25, avgWait: 9 },
      { hour: '10:00', tokens: 46, completed: 38, avgWait: 16 },
      { hour: '11:00', tokens: 52, completed: 42, avgWait: 18 },
      { hour: '12:00', tokens: 34, completed: 30, avgWait: 12 },
      { hour: '13:00', tokens: 26, completed: 25, avgWait: 8 },
      { hour: '14:00', tokens: 48, completed: 40, avgWait: 15 },
      { hour: '15:00', tokens: 39, completed: 35, avgWait: 13 },
      { hour: '16:00', tokens: 22, completed: 20, avgWait: 7 },
    ],
    serviceDistribution: [
      { name: 'General OPD Consultation', count: 48, color: '#4f46e5' },
      { name: 'Pediatrics & Child Care', count: 32, color: '#059669' },
      { name: 'Pharmacy & Billing', count: 64, color: '#7c3aed' },
      { name: 'Diagnostic Imaging', count: 24, color: '#d97706' },
    ],
    staffLeaderboard: [
      { name: 'Dr. Sarah Chen, MD', servedToday: 24, avgMins: 9.1, satisfaction: 5.0 },
      { name: 'Pharmacist James Miller', servedToday: 38, avgMins: 4.8, satisfaction: 4.9 },
      { name: 'Dr. Marcus Vance', servedToday: 18, avgMins: 11.2, satisfaction: 4.8 },
      { name: 'Dr. Elena Rostova', servedToday: 16, avgMins: 14.5, satisfaction: 4.9 },
    ]
  };

  const maxHourlyVolume = Math.max(...stats.hourlyData.map(h => h.tokens), 55);

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 mb-1">
            <Users className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Volume</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {stats.totalTokens}
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">↑ 14% vs yesterday</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Served Rate</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {Math.round((stats.completedCount / Math.max(1, stats.totalTokens)) * 100)}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{stats.completedCount} visitors served</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Wait Time</span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {stats.avgWaitTimeMins}m
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">↓ 3.2m reduction</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 mb-1">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Service Time</span>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {stats.avgServiceTimeMins}m
          </div>
          <p className="text-[10px] text-slate-400 mt-1">target: 10 mins</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-2 text-slate-400 mb-1">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">CSAT Score</span>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono flex items-center space-x-1">
            <span>{stats.csatRating}</span>
            <span className="text-base text-amber-400 font-normal">★</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{feedbacks.length} ratings recorded</p>
        </div>

      </div>

      {/* Hourly Traffic Chart (Custom SVG & CSS Visual) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Hourly Flow & Peak Waiting Times
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Correlating customer arrival surges with average queue wait time throughout the day.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-brand-600"></span>
              <span className="text-slate-600 dark:text-slate-400">Customers Arrived</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-400"></span>
              <span className="text-slate-600 dark:text-slate-400">Avg Wait (Mins)</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-8 pb-4">
          <div className="grid grid-cols-9 gap-2 sm:gap-4 items-end h-56 border-b border-slate-200 dark:border-slate-800 pb-2">
            {stats.hourlyData.map((h, i) => {
              const heightPercent = Math.round((h.tokens / maxHourlyVolume) * 100);
              const waitPercent = Math.round((h.avgWait / 20) * 100);

              return (
                <div key={i} className="flex flex-col items-center h-full justify-end group relative">
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-mono">
                    {h.tokens} tokens &bull; ~{h.avgWait}m wait
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center space-x-1 sm:space-x-1.5 h-full">
                    {/* Volume Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-1/2 bg-brand-600 rounded-t-md transition-all group-hover:bg-brand-500"
                    ></div>
                    {/* Wait Bar */}
                    <div
                      style={{ height: `${waitPercent}%` }}
                      className="w-1/2 bg-amber-400 rounded-t-md transition-all group-hover:bg-amber-300"
                    ></div>
                  </div>

                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2 font-mono">
                    {h.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-2 italic">
          Peak traffic detected between 10:00 AM and 11:30 AM. Recommendation: Activate standby Counter 4 during peak hours.
        </p>
      </div>

      {/* Two Columns: Service Distribution & Staff Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Service Volume Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-1">
            Department Volume Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Share of total daily traffic handled by department
          </p>

          <div className="space-y-4">
            {stats.serviceDistribution.map((srv, idx) => {
              const total = stats.serviceDistribution.reduce((sum, s) => sum + s.count, 0) || 1;
              const pct = Math.round((srv.count / total) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{srv.name}</span>
                    <span className="font-mono text-slate-500 font-semibold">{srv.count} visits ({pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: srv.color || '#4f46e5' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Throughput Leaderboard */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-1">
            Staff Efficiency & Leaderboard
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Daily throughput and customer satisfaction rankings
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.staffLeaderboard.map((staff, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                    #{i + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{staff.name}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">Avg time: {staff.avgMins}m / turn</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    {staff.servedToday} Served
                  </div>
                  <div className="text-[11px] text-amber-500 font-semibold">
                    {staff.satisfaction} ★ Rating
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Customer Feedback & Reviews Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-1">
          Recent Customer Feedbacks & Reviews
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Direct sentiment, praise tags, and suggestions from completed service visits.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map(fb => (
            <div
              key={fb.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {fb.customerName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {fb.serviceName} &bull; Token {fb.tokenNumber}
                  </div>
                </div>
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: fb.rating }).map((_, r) => (
                    <Star key={r} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              {fb.tags && fb.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {fb.tags.map((tag, t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {fb.comment && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  "{fb.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
