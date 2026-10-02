import React from 'react';
import {
  Clock,
  Activity,
  Bell,
  HeartHandshake,
} from 'lucide-react';

const stats = [
  {
    icon: Clock,
    title: 'Less Physical Waiting',
    tagline: 'Zero Lobby Congestion',
    description: 'Relax outside or in waiting lounges. Book online and only arrive right when your turn is called.',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-100 dark:border-blue-900/50',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Activity,
    title: 'Real-Time Queue Updates',
    tagline: 'Live Position Sync',
    description: 'Continuous queue movement tracking with dynamic countdown calculation based on desk throughput.',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Bell,
    title: 'Smart Mobile Notifications',
    tagline: '2-Minute Arrival Alert',
    description: 'Automatic notification sent to your smartphone approximately two minutes before approaching the desk.',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-100 dark:border-amber-900/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: HeartHandshake,
    title: 'Accessible Priority Assistance',
    tagline: 'Dignified Access',
    description: 'Dedicated booking for senior citizens (60+), persons with disabilities, and urgent clinical cases.',
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-100 dark:border-purple-900/50',
    iconBg: 'bg-purple-100 dark:bg-purple-900/60',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

export default function QuickStatsSection() {
  return (
    <section className="py-16 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest mb-3 border border-indigo-100 dark:border-indigo-800">
            Why SmartQueue?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Built for Real-World <span className="gradient-text">Waiting Peace</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Eliminating lobby congestion and stressful physical lines across civic and healthcare spaces.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-3xl p-6 border ${s.bg} ${s.border} card-hover overflow-hidden`}
              >
                {/* Gradient accent top bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.gradient} opacity-70`} />

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center mb-5 ${s.iconColor} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Tagline */}
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {s.tagline}
                </span>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-2 leading-snug">
                  {s.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
