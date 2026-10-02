import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Volume2,
  Printer,
  XCircle,
  MapPin,
  HeartHandshake,
  Search
} from 'lucide-react';

export default function TrackTokenModal() {
  const {
    activeModal,
    setActiveModal,
    myToken,
    tokens,
    myTokenNumber,
    setMyTokenNumber,
    cancelToken,
    refreshData,
    specialAssistanceRequests
  } = useApp();

  const [cancelling, setCancelling] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  if (activeModal !== 'track_token') return null;

  // Find currently serving token for same category
  const currentlyServing = myToken
    ? tokens.find(t => t.categoryKey === myToken.categoryKey && t.status === 'in_service')
    : null;

  // Check if there is an approved special assistance request for this customer
  const sar = specialAssistanceRequests.find(r => 
    (myToken && r.tokenNumber === myToken.tokenNumber) || (myToken && r.customerPhone === myToken.customerPhone)
  );

  const handleCancel = async () => {
    if (!myToken) return;
    if (window.confirm(`Are you sure you want to cancel token ${myToken.tokenNumber}?`)) {
      setCancelling(true);
      try {
        await cancelToken(myToken.id);
        setActiveModal(null);
      } finally {
        setCancelling(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = tokens.find(t => t.tokenNumber.toUpperCase() === searchInput.trim().toUpperCase());
    if (found) {
      setMyTokenNumber(found.tokenNumber);
      setSearchInput('');
    } else {
      alert(`Token ${searchInput.trim().toUpperCase()} not found in system.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up text-left transition-colors">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Quick Token Switcher / Lookup Search Bar */}
        <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Track another token (e.g. H125, V202, B102)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono outline-none"
              />
            </div>
            <button
              type="submit"
              className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
            >
              Lookup
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto text-[10px] font-mono text-slate-400">
            <span>Recent:</span>
            {tokens.slice(0, 5).map(t => (
              <button
                key={t.id}
                onClick={() => setMyTokenNumber(t.tokenNumber)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                  t.tokenNumber === myTokenNumber
                    ? 'bg-brand-blue text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {t.tokenNumber}
              </button>
            ))}
          </div>
        </div>

        {!myToken ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-black text-brand-navy dark:text-white">No Active Token Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              You haven't booked a digital token yet.
            </p>
            <button
              onClick={() => setActiveModal('join_queue')}
              className="py-3 px-6 bg-brand-blue hover:opacity-90 text-white rounded-xl text-xs font-bold"
            >
              Join a Queue Now
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-bold text-brand-blue uppercase tracking-wider">
                <span>{myToken.placeName}</span>
                <span>&bull;</span>
                <span className="flex items-center space-x-1 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Live Queue Moving</span>
                </span>
              </div>
              <h3 className="text-2xl font-black text-brand-navy dark:text-white tracking-tight mt-0.5">
                {myToken.categoryKey === 'hospital' ? '🏥' : myToken.categoryKey === 'village_office' ? '🏛️' : '🥤'} {myToken.serviceName}
              </h3>
            </div>

            {/* Special Assistance Approved Banner (if applicable) */}
            {sar && sar.status === 'approved' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-purple-950/40 border-2 border-purple-300 dark:border-purple-800 text-left space-y-1">
                <div className="flex items-center space-x-2 text-xs font-black text-brand-purple uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                  <span>Special Assistance Confirmed!</span>
                </div>
                <div className="text-sm font-extrabold text-brand-navy dark:text-white">
                  Assigned Station: {sar.assignedRoom || 'Consultation Room 2'}
                </div>
                <p className="text-xs text-purple-900/80 dark:text-purple-300/80">
                  Approach Instructions: Please proceed to the assigned desk upon arrival. Staff has your file.
                </p>
              </div>
            )}

            {/* Main Token Display Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-800 dark:to-slate-800/80 rounded-3xl p-6 border-2 border-brand-blue/30 text-center relative overflow-hidden">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                YOUR DIGITAL TOKEN
              </span>
              <div className="font-mono text-6xl font-black text-brand-navy dark:text-white tracking-tight drop-shadow-sm">
                {myToken.tokenNumber}
              </div>

              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  myToken.status === 'in_service'
                    ? 'bg-amber-400 text-slate-950 animate-pulse font-black'
                    : myToken.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-blue-100 text-brand-blue dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {myToken.status === 'in_service' ? '🔥 Now Calling to Desk!' : myToken.status.replace('_', ' ')}
                </span>
                {myToken.priority === 'special_assistance' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-brand-purple dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                    💜 Special Assistance
                  </span>
                )}
              </div>

              {/* Status Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Currently Serving</span>
                  <span className="font-mono text-xl font-black text-brand-blue">
                    {currentlyServing ? currentlyServing.tokenNumber : 'Ready'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">People Ahead</span>
                  <span className="font-mono text-xl font-black text-slate-900 dark:text-slate-100">
                    {myToken.status === 'in_service' ? 0 : myToken.peopleAhead}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Est. Waiting</span>
                  <span className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">
                    {myToken.status === 'in_service' ? '0m' : `~${myToken.estimatedWaitMins}m`}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                <span>Queue Position Progress</span>
                <span>
                  {myToken.status === 'in_service' ? 'At Station (100%)' : myToken.peopleAhead <= 1 ? 'Approaching (85%)' : 'In Line (45%)'}
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-blue to-emerald-500 transition-all duration-500"
                  style={{
                    width: myToken.status === 'in_service' ? '100%' : myToken.peopleAhead === 0 ? '85%' : myToken.peopleAhead === 1 ? '65%' : '40%'
                  }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={refreshData}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {myToken.status === 'waiting' && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
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
    </div>
  );
}
