import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  HeartHandshake,
  Ticket,
  Volume2,
  VolumeX,
  Activity,
  Shield,
  Tv,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

const themeOptions = [
  { key: 'default', label: 'Indigo Blue', color: '#4F46E5', dot: 'bg-indigo-600' },
  { key: 'emerald', label: 'Emerald Green', color: '#059669', dot: 'bg-emerald-600' },
  { key: 'amber', label: 'Warm Amber', color: '#D97706', dot: 'bg-amber-500' },
  { key: 'violet', label: 'Deep Violet', color: '#7C3AED', dot: 'bg-violet-600' },
];

export default function Navbar() {
  const {
    currentView,
    setCurrentView,
    setActiveModal,
    soundEnabled,
    setSoundEnabled,
    theme,
    setTheme,
    darkMode,
    setDarkMode,
    myToken,
    resetSimulation
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const navLinks = [
    { key: 'home', label: 'Home' },
    { key: 'services', label: 'Services' },
    { key: 'how-it-works', label: 'How It Works' },
  ];

  const closeAll = () => { setShowDemoMenu(false); setShowThemeMenu(false); };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* ── Logo ── */}
          <button
            onClick={() => { setCurrentView('home'); closeAll(); }}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                  SmartQueue
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                  Beta
                </span>
              </div>
              <p className="hidden sm:block text-[10px] font-medium text-slate-400 dark:text-slate-500 -mt-0.5">
                Digital Queue Management
              </p>
            </div>
          </button>

          {/* ── Desktop Nav Links ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setCurrentView(key); closeAll(); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === key
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => { setCurrentView('special-assistance'); closeAll(); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'special-assistance'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                  : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Special Assistance
            </button>

            <button
              onClick={() => { setCurrentView('my-token'); closeAll(); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'my-token'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-indigo-500" />
              My Token
              {myToken && myToken.status === 'waiting' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2">

            {/* Theme picker */}
            <div className="relative">
              <button
                onClick={() => { setShowThemeMenu(!showThemeMenu); setShowDemoMenu(false); }}
                title="Change Color Theme"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <Palette className="w-4 h-4 text-indigo-500" />
              </button>
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in">
                  <p className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Color Theme</p>
                  {themeOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setTheme(opt.key); setShowThemeMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 text-sm transition-colors ${
                        theme === opt.key
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${opt.dot} shrink-0`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Sound */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute' : 'Enable Sound'}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Views dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => { setShowDemoMenu(!showDemoMenu); setShowThemeMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-sm font-semibold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Views
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in text-sm">
                  <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Role Views</p>
                  {[
                    { key: 'home', label: 'Customer Home', icon: Layers, color: 'text-indigo-600' },
                    { key: 'services', label: 'Services Directory', icon: Sparkles, color: 'text-indigo-600' },
                    { key: 'special-assistance', label: 'Special Assistance', icon: HeartHandshake, color: 'text-purple-600' },
                    { key: 'my-token', label: 'My Token Pass', icon: Ticket, color: 'text-indigo-600' },
                    { key: 'staff', label: 'Staff Counter Desk', icon: Activity, color: 'text-emerald-600' },
                    { key: 'admin', label: 'Admin Analytics', icon: Shield, color: 'text-purple-600' },
                    { key: 'display', label: 'Lobby TV Display', icon: Tv, color: 'text-amber-500' },
                  ].map(({ key, label, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => { setCurrentView(key); setShowDemoMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                        currentView === key
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${color} shrink-0`} />
                      {label}
                    </button>
                  ))}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => { resetSimulation(); setShowDemoMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg font-semibold transition-colors"
                    >
                      ↺ Reset Demo Simulation
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Join Queue CTA */}
            <button
              onClick={() => { setActiveModal('join_queue'); closeAll(); }}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
            >
              <span>Join Queue</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 dark:text-slate-300 hover:text-indigo-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-1 animate-fade-in">
            {[
              { key: 'home', label: 'Home' },
              { key: 'services', label: 'Services (3 Hubs)' },
              { key: 'how-it-works', label: 'How It Works' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setCurrentView(key); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { setCurrentView('special-assistance'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40"
            >
              <HeartHandshake className="w-4 h-4" /> Special Assistance
            </button>
            <button
              onClick={() => { setCurrentView('my-token'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              <Ticket className="w-4 h-4" /> My Token
            </button>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-4 pb-1">Switch Roles</p>
              <div className="grid grid-cols-2 gap-1.5 px-2">
                {[
                  { key: 'staff', label: 'Staff Desk' },
                  { key: 'admin', label: 'Admin Panel' },
                  { key: 'display', label: 'Lobby TV' },
                  { key: 'kiosk', label: 'Kiosk' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setCurrentView(key); setMobileMenuOpen(false); }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 text-left hover:bg-indigo-50 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
