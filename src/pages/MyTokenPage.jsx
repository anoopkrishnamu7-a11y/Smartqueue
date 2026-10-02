import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ticket,
  Search,
  Clock,
  Users,
  CheckCircle2,
  Printer,
  Copy,
  XCircle,
  RotateCcw,
  Sparkles,
  MapPin,
  HeartHandshake,
  Bell
} from 'lucide-react';

export default function MyTokenPage() {
  const {
    myToken,
    tokens,
    myTokenNumber,
    setMyTokenNumber,
    cancelToken,
    refreshData,
    specialAssistanceRequests,
    setActiveModal
  } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const currentlyServing = myToken
    ? tokens.find(t => t.categoryKey === myToken.categoryKey && t.status === 'in_service')
    : null;

  const sar = specialAssistanceRequests.find(r => 
    (myToken && r.tokenNumber === myToken.tokenNumber) || (myToken && r.customerPhone === myToken.customerPhone)
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const term = searchInput.trim().toUpperCase();

    // Look by token number or phone
    const found = tokens.find(t => 
      t.tokenNumber.toUpperCase() === term || 
      (t.customerPhone && t.customerPhone.includes(searchInput.trim()))
    );

    if (found) {
      setMyTokenNumber(found.tokenNumber);
      setSearchInput('');
    } else {
      alert(`No active ticket found for "${searchInput.trim()}". Try entering H125, V105, or B205.`);
    }
  };

  const handleCopy = () => {
    if (myToken) {
      navigator.clipboard?.writeText(myToken.tokenNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancel = async () => {
    if (!myToken) return;
    if (window.confirm(`Are you sure you want to cancel token ${myToken.tokenNumber}?`)) {
      setCancelling(true);
      try {
        await cancelToken(myToken.id);
      } finally {
        setCancelling(false);
      }
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto text-left animate-fade-in">
      
      {/* Top Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-brand-blue mb-1">
            <Ticket className="w-4 h-4" />
            <span>Digital Token Lookup</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-brand-navy dark:text-white tracking-tight">
            Track My Token
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enter your mobile number or token number below to track your live queue status.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Mobile Number or Token # (e.g. H125, V105, B205)..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto py-3 px-6 bg-brand-blue hover:opacity-90 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-brand-blue/25 transition-all whitespace-nowrap"
          >
            Track My Turn
          </button>
        </form>

        {/* Quick Demo Token Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Quick Demo Presets:</span>
          {['H125', 'V105', 'B205', 'H123'].map(tokNum => (
            <button
              key={tokNum}
              onClick={() => setMyTokenNumber(tokNum)}
              className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold transition-all ${
                myTokenNumber === tokNum
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tokNum}
            </button>
          ))}
        </div>
      </div>

      {/* Main Ticket Display (Section 11) */}
      {!myToken ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-brand-navy dark:text-white">No Active Token Loaded</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have an active token loaded right now. Enter your number above or join a queue.
          </p>
          <button
            onClick={() => setActiveModal('join_queue')}
            className="py-3 px-6 bg-brand-blue hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Join Queue Now
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-brand-blue/30 shadow-xl space-y-8">
          
          {/* Top Location & Live Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
                <span>{myToken.placeName}</span>
                <span>&bull;</span>
                <span className="font-semibold text-slate-500 dark:text-slate-400">Visitor: {myToken.customerName}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white mt-1">
                {myToken.serviceName}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>🟢 Status: Queue Moving</span>
              </span>
            </div>
          </div>

          {/* Hero Digital Token Banner */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 dark:from-slate-800 dark:to-slate-800/90 rounded-3xl p-6 sm:p-10 border-2 border-brand-blue text-center relative overflow-hidden">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 block mb-1">
              YOUR TOKEN NUMBER
            </span>
            <div className="font-mono text-6xl sm:text-8xl font-black text-brand-navy dark:text-white tracking-tight drop-shadow-sm">
              {myToken.tokenNumber}
            </div>

            <div className="mt-3 flex items-center justify-center space-x-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Token #'}</span>
              </button>
            </div>

            {/* 3 Large Stat Pills (Section 11 requirement) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 mt-8 border-t border-blue-200/80 dark:border-slate-700 text-center">
              <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-blue-100 dark:border-slate-700">
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Current Token</span>
                <span className="font-mono text-2xl font-black text-brand-blue">
                  {currentlyServing ? currentlyServing.tokenNumber : 'Ready'}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Now at Counter</span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-blue-100 dark:border-slate-700">
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">People Ahead</span>
                <span className="font-mono text-2xl font-black text-slate-900 dark:text-slate-100">
                  {myToken.status === 'in_service' ? 0 : myToken.peopleAhead}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Ahead of you</span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-blue-100 dark:border-slate-700">
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Estimated Wait</span>
                <span className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                  {myToken.status === 'in_service' ? '0 min' : `~${myToken.estimatedWaitMins} minutes`}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Dynamic calculation</span>
              </div>
            </div>
          </div>

          {/* Progress Bar (Section 11 requirement) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Queue Position Progress</span>
              <span>
                {myToken.status === 'in_service'
                  ? 'At Counter Desk (100%)'
                  : myToken.peopleAhead <= 1
                  ? 'Turn Approaching (80%)'
                  : 'In Queue Line (40%)'}
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-blue via-indigo-500 to-emerald-500 transition-all duration-700"
                style={{
                  width: myToken.status === 'in_service' ? '100%' : myToken.peopleAhead === 0 ? '85%' : myToken.peopleAhead === 1 ? '65%' : '40%'
                }}
              ></div>
            </div>
          </div>

          {/* Two-minute notification status banner */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-200">
            <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">⭐ 2-Minute Turn Alert Active</span>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                You do not need to stand in line. SmartQueue calculates your position and automatically alerts you approximately 2 minutes before your turn.
              </p>
            </div>
          </div>

          {/* Action Buttons (Section 11 requirement: Track Queue, Cancel Token) */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={refreshData}
              className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Queue Data</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>

              {myToken.status === 'waiting' && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="py-3 px-5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{cancelling ? 'Cancelling...' : 'Cancel Token'}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
