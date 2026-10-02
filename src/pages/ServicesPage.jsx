import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Stethoscope,
  Coffee,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  Search,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export default function ServicesPage() {
  const { places, services, counters, tokens, setActiveModal, setModalPreselect } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'All Services', icon: '✨' },
    { key: 'village_office', label: 'Village Office', icon: '🏛️' },
    { key: 'hospital', label: 'Hospital', icon: '🏥' },
    { key: 'beverage_shop', label: 'Beverage Shop', icon: '🥤' }
  ];

  const handleJoinService = (placeId, serviceId) => {
    setModalPreselect({
      placeId,
      serviceId,
      step: 3
    });
    setActiveModal('join_queue');
  };

  const handleJoinCategory = (placeId) => {
    setModalPreselect({
      placeId,
      step: 2
    });
    setActiveModal('join_queue');
  };

  return (
    <div className="space-y-10 py-4 max-w-7xl mx-auto text-left animate-fade-in">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl p-6 sm:p-10 border border-blue-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-brand-blue text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Service Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-navy dark:text-white tracking-tight">
            Choose Where You Want to Go
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Select an organization below to digitally join their queue, track your token position in real-time, and get notified approximately 2 minutes before your turn.
          </p>

          {/* Quick Search & Filter */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services (e.g. Doctor, Certificate, Pickup)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue text-slate-900 dark:text-slate-100 shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map(c => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    selectedCategory === c.key
                      ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/25'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Main Location Cards (Section 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Village Office Card */}
        {(selectedCategory === 'all' || selectedCategory === 'village_office') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border-2 border-blue-200 dark:border-blue-900/60 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 text-4xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  🏛️
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-brand-blue border border-blue-200 dark:border-blue-800">
                  Avg. Wait: ~9 mins
                </span>
              </div>

              <h2 className="text-2xl font-black text-brand-navy dark:text-white mb-2">
                🏛️ Village Office
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Access village office services without spending unnecessary time in a physical queue.
              </p>

              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Available Services:
                </span>
                {[
                  { name: 'Certificate Application', desc: 'Income, residence, nativity, caste' },
                  { name: 'Certificate Collection', desc: 'Pick up stamped & verified certificates' },
                  { name: 'Document Verification', desc: 'In-person scrutiny of credentials' },
                  { name: 'Other Services', desc: 'Revenue, patta, tax & public grievances' }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleJoinCategory('place-village-1')}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{s.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-5">{s.desc}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-blue" />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleJoinCategory('place-village-1')}
              className="w-full py-3.5 bg-brand-blue hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Join Village Office Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2. Hospital Card */}
        {(selectedCategory === 'all' || selectedCategory === 'hospital') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border-2 border-emerald-200 dark:border-emerald-900/60 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-4xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  🏥
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Avg. Wait: ~8 mins
                </span>
              </div>

              <h2 className="text-2xl font-black text-brand-navy dark:text-white mb-2">
                🏥 Hospital
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Track your consultation queue and receive an alert when your turn is near.
              </p>

              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Available Services:
                </span>
                {[
                  { name: 'Registration', desc: 'Outpatient check-in & file generation' },
                  { name: 'Doctor Consultation', desc: 'General & specialist physician' },
                  { name: 'Laboratory', desc: 'Blood, diagnostic and urine testing' },
                  { name: 'Pharmacy', desc: 'Prescription dispensing & medicine handoff' },
                  { name: 'Billing', desc: 'Insurance claims & clearance counter' }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleJoinCategory('place-hospital-1')}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{s.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-5">{s.desc}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleJoinCategory('place-hospital-1')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Join Hospital Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. Beverage Shop Card */}
        {(selectedCategory === 'all' || selectedCategory === 'beverage_shop') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border-2 border-amber-200 dark:border-amber-900/60 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950 text-4xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  🥤
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Avg. Wait: ~4 mins
                </span>
              </div>

              <h2 className="text-2xl font-black text-brand-navy dark:text-white mb-2">
                🥤 Beverage Shop
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Place your order and receive a pickup token without standing in line.
              </p>

              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Available Services:
                </span>
                {[
                  { name: 'Order Counter', desc: 'Browse artisanal beverage menu & order' },
                  { name: 'Beverage Pickup', desc: 'Fresh drink prep window handoff' },
                  { name: 'Takeaway Collection', desc: 'Pre-ordered boxes & snacks pickup' }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleJoinCategory('place-beverage-1')}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{s.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-5">{s.desc}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleJoinCategory('place-beverage-1')}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Join Beverage Shop Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Special Assistance Highlight Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-100/70 via-indigo-50 to-pink-50 dark:from-purple-950/40 dark:via-slate-900 dark:to-pink-950/30 border-2 border-purple-300 dark:border-purple-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-200 dark:bg-purple-900 text-brand-purple flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-brand-navy dark:text-white">
              Senior Citizen or Need Accessibility Support?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Submit a dedicated Special Assistance request for front-of-line priority and mobility escorts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveModal('special_assistance')}
          className="py-3 px-6 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/25 whitespace-nowrap transition-all"
        >
          💜 Request Special Assistance
        </button>
      </div>

    </div>
  );
}
