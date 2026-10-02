import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Tv,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Building,
  Bell,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { playChime } from '../../utils/audioAnnouncer';

export default function PublicDisplayBoard() {
  const {
    counters,
    tokens,
    places,
    soundEnabled,
    setSoundEnabled
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState('place-hospital-1');

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPlace = places.find(p => p.id === selectedPlaceId) || places[0];
  const placeCounters = counters.filter(c => c.placeId === selectedPlaceId);
  const placeTokens = tokens.filter(t => t.placeId === selectedPlaceId);

  // Active serving tokens mapped to counters
  const activeCountersWithTokens = placeCounters.map((c, idx) => {
    // Find token in_service for this counter or assigned to it
    const activeTok = placeTokens.find(t => 
      t.tokenNumber === c.currentTokenNumber || (t.counterName === c.name && t.status === 'in_service')
    );
    return {
      counter: c,
      token: activeTok,
      counterLabel: `Counter ${idx + 1}`
    };
  });

  // Next tokens waiting in line
  const nextTokens = placeTokens
    .filter(t => t.status === 'waiting')
    .sort((a, b) => {
      const aPrio = a.priority === 'special_assistance' ? 2 : 1;
      const bPrio = b.priority === 'special_assistance' ? 2 : 1;
      if (bPrio !== aPrio) return bPrio - aPrio;
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    })
    .slice(0, 6);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-slate-800 relative overflow-hidden font-sans select-none animate-fade-in">
      
      {/* Top TV Header Bar */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-800 gap-4">
        
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-blue to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Tv className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black tracking-widest text-brand-blue uppercase">
                SMARTQUEUE &bull; PUBLIC TV DISPLAY
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-0.5">
              {currentPlace?.name || 'SmartQueue Display'}
            </h1>
          </div>
        </div>

        {/* Hub Selector Pills */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          {places.map(p => {
            const isSelected = p.id === selectedPlaceId;
            const emoji = p.categoryKey === 'hospital' ? '🏥' : p.categoryKey === 'village_office' ? '🏛️' : '🥤';
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlaceId(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSelected ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{emoji}</span>
                <span className="hidden md:inline">{p.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Time & Controls */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="font-mono text-3xl font-black text-amber-400 tracking-wider">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playChime();
              }}
              title="Test audio chime"
              className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl transition-colors border border-slate-800"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl transition-colors border border-slate-800"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Main TV Layout (Section 21 format) */}
      <div className="py-8 space-y-8">
        
        {/* SECTION: NOW SERVING */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-sm uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>NOW SERVING</span>
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              {currentPlace?.name}
            </span>
          </div>

          {/* Large Counters Display (Counter 1, Counter 2, Counter 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeCountersWithTokens.slice(0, 3).map(({ counter, token, counterLabel }, idx) => {
              const isServing = !!token;

              return (
                <div
                  key={counter.id}
                  className={`rounded-3xl p-6 sm:p-8 border-2 transition-all relative overflow-hidden text-center flex flex-col justify-between ${
                    isServing
                      ? 'border-brand-blue bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 shadow-2xl shadow-blue-500/10'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                        {counterLabel}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${isServing ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                    </div>

                    <h2 className="text-lg font-black text-slate-200 mb-4">
                      {counter.name}
                    </h2>

                    {/* VERY LARGE TOKEN NUMBER FOR TV READABILITY (Section 21 requirement) */}
                    <div className="font-mono text-6xl sm:text-7xl font-black text-white tracking-tight drop-shadow-md py-2">
                      {token ? token.tokenNumber : 'READY'}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-4 text-xs text-slate-400">
                    {token ? (
                      <div>
                        <div className="font-bold text-emerald-400 truncate text-sm">{token.customerName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{token.serviceName}</div>
                      </div>
                    ) : (
                      <div className="text-slate-500">Counter Available</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: NEXT TOKENS (Section 21 requirement) */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              NEXT TOKENS IN LINE
            </span>
            <span className="text-xs text-slate-400">
              Estimated 2-minute arrival alerts active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {nextTokens.length === 0 ? (
              <p className="col-span-6 text-xs text-slate-500 py-4 text-center italic">
                No upcoming tokens in queue.
              </p>
            ) : (
              nextTokens.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1 hover:border-slate-700 transition-colors"
                >
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                    #{idx + 1} NEXT
                  </span>
                  <div className="font-mono text-3xl font-black text-white">
                    {item.tokenNumber}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {item.serviceName}
                  </div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold">
                    ~{item.estimatedWaitMins}m
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Bottom Marquee Announcement Ticker */}
      <div className="pt-4 border-t border-slate-800 flex items-center space-x-3 overflow-hidden">
        <div className="px-3 py-1 rounded-lg bg-brand-blue text-white font-black text-[11px] uppercase tracking-wider shrink-0">
          ANNOUNCEMENT
        </div>
        <div className="text-xs text-slate-300 whitespace-nowrap overflow-hidden">
          <div className="inline-block animate-pulse font-medium">
            {currentPlace?.emergencyNotice || 'Welcome to SmartQueue. Please track your digital pass on your phone.'}
            &nbsp;&bull;&nbsp; Special Assistance counter is open for senior citizens and persons with disabilities.
          </div>
        </div>
      </div>

    </div>
  );
}
