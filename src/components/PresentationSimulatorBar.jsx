import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  Bell,
  CheckCircle2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function PresentationSimulatorBar() {
  const {
    myToken,
    setMyTokenNumber,
    isSimulating,
    setIsSimulating,
    simSpeed,
    setSimSpeed,
    advanceSimulationStep,
    resetSimulation,
    tokens
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [selectedHub, setSelectedHub] = useState('hospital'); // 'hospital', 'village_office', 'beverage_shop'

  const demoTargets = {
    hospital: { name: 'Hospital', service: 'Doctor Consultation', token: 'H125', prefix: 'H' },
    village_office: { name: 'Village Office', service: 'Certificate Collection', token: 'V105', prefix: 'V' },
    beverage_shop: { name: 'Beverage Shop', service: 'Pickup Counter', token: 'B205', prefix: 'B' }
  };

  const currentHubConfig = demoTargets[selectedHub];

  // Currently serving for this hub
  const currentlyServing = tokens.find(t => t.categoryKey === selectedHub && t.status === 'in_service');
  const targetToken = tokens.find(t => t.tokenNumber === currentHubConfig.token);

  // Relevant timeline tokens for this hub
  const hubTokens = tokens.filter(t => t.categoryKey === selectedHub);

  const handleSelectHub = (hubKey) => {
    setSelectedHub(hubKey);
    setMyTokenNumber(demoTargets[hubKey].token);
  };

  const handleStep = async () => {
    try {
      await fetch('/api/simulation/step-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryKey: selectedHub })
      });
      advanceSimulationStep();
    } catch (e) {
      advanceSimulationStep();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-lg w-full bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border-2 border-brand-purple p-3.5 sm:p-4 animate-slide-up">
      
      {/* Header with Demo Mode Label (Section 22 requirement) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-black uppercase tracking-wider text-purple-300">
            ⚡ Demo Mode & Queue Simulator
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-900 text-purple-200 border border-purple-500/50">
            Demo Mode
          </span>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1"
          aria-label={collapsed ? "Expand simulator" : "Collapse simulator"}
        >
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-3 space-y-3">
          
          {/* Hub Selector (Sections 22, 23, 24) */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-400">Simulation Hub:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleSelectHub('hospital')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  selectedHub === 'hospital' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🏥 Hospital (H125)
              </button>
              <button
                onClick={() => handleSelectHub('village_office')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  selectedHub === 'village_office' ? 'bg-brand-blue text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🏛️ Village (V105)
              </button>
              <button
                onClick={() => handleSelectHub('beverage_shop')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  selectedHub === 'beverage_shop' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🥤 Cafe (B205)
              </button>
            </div>
          </div>

          {/* Current Serving & Target Token Status */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Now Serving</div>
              <div className="font-mono font-black text-amber-400 text-sm">
                {currentlyServing ? currentlyServing.tokenNumber : 'Ready'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                Demo Token: {currentHubConfig.token}
              </div>
              <div className="font-mono font-bold text-white text-xs">
                {targetToken?.status === 'in_service' ? (
                  <span className="text-emerald-400 font-black animate-pulse">CALLING NOW!</span>
                ) : targetToken?.status === 'completed' ? (
                  <span className="text-slate-400">Completed</span>
                ) : (
                  <span>{targetToken?.peopleAhead ?? 2} ahead &bull; ~{targetToken?.estimatedWaitMins ?? 4}m wait</span>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Chips */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 overflow-x-auto gap-1">
            {hubTokens.slice(0, 6).map((tok) => {
              const isPast = tok.status === 'completed';
              const isCurrent = tok.status === 'in_service';
              const isTarget = tok.tokenNumber === currentHubConfig.token;

              return (
                <div
                  key={tok.id}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                      : isPast
                      ? 'bg-emerald-900/60 text-emerald-300'
                      : isTarget
                      ? 'bg-purple-900/60 text-purple-300 border border-purple-500'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tok.tokenNumber}
                </div>
              );
            })}
          </div>

          {/* Control Bar: Play / Pause, Next Step, Speed (Normal, Fast, Presentation Mode) */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSimulating
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-brand-blue text-white hover:bg-blue-600'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? 'Pause' : 'Start Queue Simulation'}</span>
              </button>

              <button
                onClick={handleStep}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-700 flex items-center space-x-1"
                title="Advance queue by 1 step"
              >
                <SkipForward className="w-3.5 h-3.5 text-purple-400" />
                <span>Next Step</span>
              </button>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Speed Configurator (Section 22 requirement: Normal, Fast, Presentation Mode) */}
              <select
                value={simSpeed}
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                className="bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-700 outline-none"
              >
                <option value={1}>Normal</option>
                <option value={3}>Fast</option>
                <option value={5}>Presentation Mode</option>
              </select>

              <button
                onClick={resetSimulation}
                title="Reset simulation to initial state"
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
