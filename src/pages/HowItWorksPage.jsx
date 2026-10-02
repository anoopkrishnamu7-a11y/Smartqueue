import React from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Ticket,
  Bell,
  CheckCircle2,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Volume2,
  ShieldCheck,
  Smartphone,
  Play
} from 'lucide-react';
import { playChime } from '../utils/audioAnnouncer';

export default function HowItWorksPage() {
  const { setActiveModal, advanceSimulationStep, soundEnabled, setSoundEnabled } = useApp();

  const steps = [
    {
      step: '01',
      title: 'Choose Location & Service',
      description: 'Select Village Office, Hospital, or Beverage Shop and pick your required counter service in 2 simple taps.',
      icon: MapPin,
      badge: 'Step 1: Discover'
    },
    {
      step: '02',
      title: 'Get Your Digital Pass',
      description: 'Receive an immediate digital ticket pass with your token number, current waiting count, and dynamic wait time.',
      icon: Ticket,
      badge: 'Step 2: Reserve'
    },
    {
      step: '03',
      title: '⭐ 2-Minute Smart Notification',
      description: 'Relax anywhere nearby. The queue algorithm tracks queue progress and sends an automated alert 2 minutes before your turn.',
      icon: Bell,
      badge: 'Step 3: Signature Feature',
      highlight: true
    },
    {
      step: '04',
      title: 'Walk in & Get Served',
      description: 'Approach your assigned counter or doctor consultation room right on time without crowded waiting room stress.',
      icon: CheckCircle2,
      badge: 'Step 4: Arrive on Time'
    }
  ];

  const handleTestAudio = () => {
    playChime();
  };

  return (
    <div className="space-y-12 py-4 max-w-7xl mx-auto text-left animate-fade-in">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl p-6 sm:p-10 border border-blue-100 dark:border-slate-800 shadow-sm text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-brand-blue text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Product Overview & Walkthrough</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-brand-navy dark:text-white tracking-tight">
          How SmartQueue Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
          "Your Time Matters. Join the Queue, Not the Crowd." Here is how our digital queue and automated notification platform eliminates physical waiting.
        </p>
      </div>

      {/* 4 Steps Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className={`rounded-3xl p-6 border-2 transition-all flex flex-col justify-between ${
                st.highlight
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-xl shadow-amber-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-3xl font-black text-slate-300 dark:text-slate-700">
                    {st.step}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    st.highlight ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {st.badge}
                  </span>
                </div>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold mb-4 ${
                  st.highlight ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200' : 'bg-blue-50 dark:bg-blue-950 text-brand-blue'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="font-extrabold text-base text-brand-navy dark:text-white mb-2">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {st.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive: Signature Two-Minute Turn Notification */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-amber-300 dark:border-amber-800 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Signature Feature Spotlight
              </span>
              <h2 className="text-2xl font-black text-brand-navy dark:text-white tracking-tight mt-0.5">
                The 2-Minute Dynamic Turn Alert
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTestAudio}
              className="py-2.5 px-4 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Audio Chime</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-extrabold text-sm text-brand-navy dark:text-white block">
              1. Dynamic Wait Calculation
            </span>
            <p className="leading-relaxed">
              Instead of static timers, SmartQueue calculates wait times dynamically: <code>People ahead &times; average service duration</code>. If 2 people are ahead and duration is 1 minute, estimated wait is 2 minutes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-extrabold text-sm text-brand-navy dark:text-white block">
              2. Configurable Threshold
            </span>
            <p className="leading-relaxed">
              Administrators can configure the threshold (<code>NOTIFICATION_THRESHOLD_MINUTES = 2</code>). Duplicate notifications are strictly prevented by state tracking flags.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-extrabold text-sm text-brand-navy dark:text-white block">
              3. Multi-Channel Alert
            </span>
            <p className="leading-relaxed">
              Alerts trigger through the browser Notifications API, in-app modal, notification history log, and melodic Web Audio chimes with text-to-speech voice announcements.
            </p>
          </div>
        </div>
      </div>

      {/* Special Assistance Section */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-pink-50 dark:from-purple-950/40 dark:via-slate-900 dark:to-pink-950/20 rounded-3xl p-6 sm:p-10 border-2 border-purple-200 dark:border-purple-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-brand-purple text-xs font-black uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Accessibility First</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight">
            💜 Special Assistance & Priority Consultation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Senior citizens (60+), persons with disabilities, pregnant individuals, and visitors requiring mobility escorts can submit a priority request. Hospital staff review and assign direct consultation rooms without general triage delays.
          </p>
        </div>

        <button
          onClick={() => setActiveModal('special_assistance')}
          className="py-3.5 px-7 bg-brand-purple hover:bg-purple-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/25 whitespace-nowrap transition-all flex items-center space-x-2"
        >
          <span>Open Assistance Request</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
