import React from 'react';
import { MapPin, Ticket, Bell, CheckCircle2, Sparkles } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Select Service & Location',
    description: 'Choose from Village Office, Hospital, or Beverage Shop and pick your required service.',
    icon: MapPin,
    badge: 'Step 1',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    step: '02',
    title: 'Get Your Digital Token',
    description: 'Receive an instant digital ticket with your token number, live position, and dynamic wait time.',
    icon: Ticket,
    badge: 'Step 2',
    gradient: 'from-indigo-500 to-purple-600',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    step: '03',
    title: '2-Minute Smart Alert',
    description: 'Relax anywhere nearby. Your smartphone notifies you 2 minutes before your turn arrives.',
    icon: Bell,
    badge: '⭐ Key Feature',
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    highlight: true,
  },
  {
    step: '04',
    title: 'Walk In & Be Served',
    description: 'Approach your assigned counter right on time. No physical waiting in crowded rooms.',
    icon: CheckCircle2,
    badge: 'Step 4',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works-section" className="py-16 sm:py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-900 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Effortless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How SmartQueue Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Designed for simplicity so anyone can skip the physical wait in four easy steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-200 via-indigo-200 via-amber-200 to-emerald-200 dark:from-blue-900 dark:via-indigo-900 dark:via-amber-900 dark:to-emerald-900 z-0" />

          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative z-10 rounded-3xl p-6 border-2 transition-all card-hover ${
                  item.highlight
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-lg shadow-amber-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                }`}
              >
                {/* Step number & badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-3xl font-black text-slate-200 dark:text-slate-800 select-none">
                    {item.step}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.highlight
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                </div>

                {/* Gradient icon */}
                <div className={`w-12 h-12 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Text */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
