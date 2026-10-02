import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  HeartHandshake,
  Bell,
  Ticket,
  Sparkles,
  Clock,
  Users,
  CheckCircle2
} from 'lucide-react';

export default function HeroSection() {
  const { setActiveModal, setModalPreselect, myToken, tokens, setCurrentView } = useApp();

  const currentlyServing = tokens.find(t => t.categoryKey === 'hospital' && t.status === 'in_service')?.tokenNumber || 'H120';
  const targetToken = tokens.find(t => t.tokenNumber === 'H125') || myToken;

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">

      {/* ── Background Mesh Gradient ── */}
      <div className="absolute inset-0 hero-gradient dark:bg-gradient-to-br dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 -z-20" />
      
      {/* ── Decorative floating orbs ── */}
      <div className="absolute top-16 right-[12%] w-80 h-80 rounded-full bg-indigo-400/15 dark:bg-indigo-600/10 blur-3xl glow-orb -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-[8%] w-64 h-64 rounded-full bg-purple-400/15 dark:bg-purple-600/10 blur-3xl glow-orb -z-10 pointer-events-none" style={{animationDelay:'2s'}} />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-cyan-300/10 dark:bg-cyan-600/5 blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* ── Left Column ── */}
          <div className="lg:col-span-7 space-y-8">

            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 border border-indigo-200/60 dark:border-indigo-700/50 shadow-sm backdrop-blur-sm text-indigo-700 dark:text-indigo-300 text-xs font-semibold animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>India's Smartest Digital Queue Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
                Stop Waiting{' '}
                <span className="block gradient-text">in Lines.</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
                Join a digital queue, track your position in real time, and get notified when your turn is near.
              </p>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 italic">
                "Book your token. Track your turn. Arrive at the right time."
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => { setModalPreselect(null); setActiveModal('join_queue'); }}
                className="group flex items-center gap-2.5 px-7 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40"
              >
                <span>Join a Queue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentView('my-token')}
                className="flex items-center gap-2.5 px-6 py-4 bg-white dark:bg-white/10 hover:bg-indigo-50 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/20 rounded-2xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5"
              >
                <Ticket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Track My Token</span>
              </button>

              <button
                onClick={() => setCurrentView('special-assistance')}
                className="flex items-center gap-2.5 px-5 py-4 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Special Assistance</span>
              </button>
            </div>

            {/* Trust Badges Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {[
                { icon: CheckCircle2, label: '100% Free to Use', color: 'text-emerald-600 dark:text-emerald-400' },
                { icon: Bell, label: '2-Min Smart Alerts', color: 'text-amber-600 dark:text-amber-400' },
                { icon: Users, label: '3 Service Hubs', color: 'text-indigo-600 dark:text-indigo-400' },
              ].map((b, i) => (
                <div key={i} className={`flex items-center gap-1.5 text-xs font-semibold ${b.color}`}>
                  <b.icon className="w-4 h-4" />
                  <span>{b.label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* ── Right Column: Live Queue Card ── */}
          <div className="lg:col-span-5 relative">

            {/* Glow ring behind card */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-400/20 via-purple-300/15 to-cyan-400/15 rounded-[3rem] blur-2xl -z-10" />

            {/* Card */}
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/60 dark:border-slate-700/60 space-y-5">

              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-xl shadow-sm">
                    🏥
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">SmartCare Hospital</p>
                    <p className="text-[11px] text-slate-400 font-medium">Doctor Consultation</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Queue Moving
                </span>
              </div>

              {/* Token Display */}
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-center text-white overflow-hidden">
                {/* bg noise texture */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,white,transparent)]" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Your Token</p>
                <div className="text-6xl font-black tracking-tight token-display mb-1">
                  {targetToken?.tokenNumber || 'H125'}
                </div>
                <p className="text-xs font-semibold opacity-75">{targetToken?.serviceName || 'Doctor Consultation'}</p>

                {/* 3 Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-white/20">
                  {[
                    { label: 'Now Serving', value: currentlyServing, color: 'text-amber-300' },
                    { label: 'Ahead of You', value: targetToken?.status === 'in_service' ? 0 : (targetToken?.peopleAhead ?? 4), color: 'text-white' },
                    { label: 'Est. Wait', value: targetToken?.status === 'in_service' ? '0 min' : `~${targetToken?.estimatedWaitMins ?? 8}m`, color: 'text-cyan-300' },
                  ].map((m, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                      <p className="text-[9px] uppercase font-bold opacity-60 mb-0.5">{m.label}</p>
                      <p className={`text-base font-black token-display ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-Min Alert Notice */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <div className="w-8 h-8 rounded-xl bg-amber-200 dark:bg-amber-900/60 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-amber-700 dark:text-amber-300 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-300">⭐ 2-Minute Turn Alert Active</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    You'll be notified ~2 minutes before your turn.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setCurrentView('my-token')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                Track My Token Live
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
