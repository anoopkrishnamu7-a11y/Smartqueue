import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';

const categories = [
  {
    key: 'village_office',
    emoji: '🏛️',
    title: 'Village Office',
    placeId: 'place-village-1',
    tagline: 'Perumbavoor Village Office',
    description: 'Access government services without spending unnecessary time in a physical queue.',
    gradient: 'from-blue-600 to-indigo-600',
    accentColor: 'indigo',
    bgCard: 'bg-white dark:bg-slate-900',
    borderColor: 'border-blue-100 dark:border-blue-900/50',
    hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    btnClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30',
    demoWait: '~9 mins',
    waitingCount: 3,
    services: ['Certificate Application', 'Certificate Collection', 'Document Verification', 'Other Services'],
  },
  {
    key: 'hospital',
    emoji: '🏥',
    title: 'SmartCare Hospital',
    placeId: 'place-hospital-1',
    tagline: 'Medical & Health Services',
    description: 'Track your consultation queue and receive an alert when your turn is near.',
    gradient: 'from-emerald-500 to-teal-600',
    accentColor: 'emerald',
    bgCard: 'bg-white dark:bg-slate-900',
    borderColor: 'border-emerald-100 dark:border-emerald-900/50',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    btnClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30',
    demoWait: '~8 mins',
    waitingCount: 4,
    services: ['Registration', 'Doctor Consultation', 'Laboratory', 'Pharmacy', 'Billing'],
    featured: true,
  },
  {
    key: 'beverage_shop',
    emoji: '🥤',
    title: 'FreshSip Beverages',
    placeId: 'place-beverage-1',
    tagline: 'FreshSip Beverage Shop',
    description: 'Place your order and receive a pickup token without standing in line.',
    gradient: 'from-amber-500 to-orange-500',
    accentColor: 'amber',
    bgCard: 'bg-white dark:bg-slate-900',
    borderColor: 'border-amber-100 dark:border-amber-900/50',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    btnClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30',
    demoWait: '~4 mins',
    waitingCount: 2,
    services: ['Order Counter', 'Beverage Pickup', 'Takeaway Collection'],
  },
];

export default function ServiceCategoriesSection() {
  const { setActiveModal, setModalPreselect } = useApp();

  const handleOpenBooking = (cat) => {
    setModalPreselect({ placeId: cat.placeId, step: 2 });
    setActiveModal('join_queue');
  };

  return (
    <section id="services-section" className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-900 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Locations & Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Choose Where You Want to Go
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Select a service hub to check active lines, browse counters, and reserve your spot digitally.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {categories.map((cat) => (
            <div
              key={cat.key}
              className={`relative group flex flex-col ${cat.bgCard} rounded-3xl border-2 ${cat.borderColor} ${cat.hoverBorder} transition-all duration-300 card-hover overflow-hidden`}
            >
              {/* Top gradient bar */}
              <div className={`h-1.5 bg-gradient-to-r ${cat.gradient}`} />

              {/* Featured badge */}
              {cat.featured && (
                <div className="absolute top-5 right-5 z-10">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-md">
                    <Zap className="w-3 h-3" />
                    Popular
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Icon + Wait time */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-16 h-16 rounded-2xl ${cat.iconBg} flex items-center justify-center text-4xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform`}>
                    {cat.emoji}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cat.badgeBg}`}>
                      <Clock className="w-3 h-3" />
                      {cat.demoWait}
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-1.5">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-semibold">{cat.waitingCount} in line</span>
                    </div>
                  </div>
                </div>

                {/* Title & tagline */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{cat.tagline}</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-snug">{cat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{cat.description}</p>

                {/* Services list */}
                <div className="space-y-2 mb-7 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Available Services</p>
                  {cat.services.map((svc, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {svc}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleOpenBooking(cat)}
                  className={`w-full py-3.5 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 ${cat.btnClass}`}
                >
                  Join Queue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
