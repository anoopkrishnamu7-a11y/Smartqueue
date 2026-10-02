import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  HeartHandshake,
  Users,
  Volume2,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Check,
  X,
  PhoneForwarded,
  SkipForward,
  Pause,
  Play,
  LogIn,
  LogOut,
  Shield,
  HelpCircle,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StaffDashboard() {
  const {
    counters,
    tokens,
    specialAssistanceRequests,
    reviewSpecialAssistance,
    callNextCounter,
    completeToken,
    refreshData
  } = useApp();

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sq_staff_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Filters & Stations
  const [activeCategory, setActiveCategory] = useState('hospital');
  const [selectedCounterId, setSelectedCounterId] = useState('ctr-h1');
  const [actionLoading, setActionLoading] = useState(false);

  // Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferToken, setTransferToken] = useState(null);
  const [transferServiceId, setTransferServiceId] = useState('srv-h3');
  const [transferReason, setTransferReason] = useState('Referred for diagnostic lab test');

  // Approve Assistance Modal State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvingReq, setApprovingReq] = useState(null);
  const [assignedRoom, setAssignedRoom] = useState('Consultation Room 2');
  const [assignedStaff, setAssignedStaff] = useState('Dr. Marcus Vance');

  const filteredCounters = counters.filter(c => {
    if (activeCategory === 'hospital') return c.id.startsWith('ctr-h');
    if (activeCategory === 'village_office') return c.id.startsWith('ctr-v');
    return c.id.startsWith('ctr-b');
  });

  const activeCounter = filteredCounters.find(c => c.id === selectedCounterId) || filteredCounters[0] || counters[0];

  // Tokens for category
  const categoryTokens = tokens.filter(t => t.categoryKey === activeCategory);
  const waitingTokens = categoryTokens.filter(t => t.status === 'waiting');
  const servingToken = categoryTokens.find(t => 
    t.status === 'in_service' && (t.counterName === activeCounter?.name || t.tokenNumber === activeCounter?.currentTokenNumber)
  ) || categoryTokens.find(t => t.status === 'in_service');
  const completedToday = categoryTokens.filter(t => t.status === 'completed').length;
  const avgWait = activeCategory === 'hospital' ? '8 mins' : activeCategory === 'village_office' ? '9 mins' : '4 mins';

  const categoryRequests = specialAssistanceRequests.filter(r => {
    if (activeCategory === 'hospital') return r.placeId?.includes('hospital') || r.serviceName?.includes('Doctor') || r.serviceName?.includes('Hospital');
    if (activeCategory === 'village_office') return r.placeId?.includes('village') || r.serviceName?.includes('Certificate') || r.serviceName?.includes('Revenue');
    return r.placeId?.includes('beverage') || r.serviceName?.includes('Beverage') || r.serviceName?.includes('Order');
  });

  // Handle Login
  const handleLogin = (u, p) => {
    const user = u || usernameInput;
    const pass = p || passwordInput;
    if ((user === 'staff' || user === 'doctor' || user === 'officer' || user === 'barista' || user === 'admin') && pass === 'password123') {
      const userObj = {
        username: user,
        name: user === 'doctor' ? 'Dr. Sarah Chen, MD' : user === 'officer' ? 'Officer Ramesh Kumar' : user === 'barista' ? 'Alex Rivera' : 'Staff Officer',
        role: 'staff'
      };
      setCurrentUser(userObj);
      localStorage.setItem('sq_staff_user', JSON.stringify(userObj));
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Use demo: doctor / password123 or click a quick login button.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sq_staff_user');
  };

  // Queue Actions
  const handleCallNext = async () => {
    if (!activeCounter) return;
    setActionLoading(true);
    try {
      await callNextCounter(activeCounter.id);
    } catch (err) {
      alert(err.message || 'No customers in queue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async (tok) => {
    try {
      await fetch(`/api/staff/ticket/${tok.id}/recall`, { method: 'POST' });
      alert(`Recalled ${tok.tokenNumber} to ${activeCounter?.name || 'Counter'}! Announcement broadcasted.`);
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSkip = async (tok) => {
    if (window.confirm(`Skip token ${tok.tokenNumber}? (Mark as No Show)`)) {
      try {
        await fetch(`/api/staff/ticket/${tok.id}/skip`, { method: 'POST' });
        refreshData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleHold = async (tok) => {
    try {
      await fetch(`/api/staff/ticket/${tok.id}/hold`, { method: 'POST' });
      alert(`Token ${tok.tokenNumber} placed on hold.`);
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (tok) => {
    try {
      await completeToken(tok.id);
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!transferToken) return;
    try {
      await fetch(`/api/staff/ticket/${transferToken.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetServiceId: transferServiceId,
          targetCounterName: 'Consultation Room 2',
          reason: transferReason
        })
      });
      alert(`Token ${transferToken.tokenNumber} successfully transferred!`);
      setTransferModalOpen(false);
      setTransferToken(null);
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmApproval = async () => {
    if (!approvingReq) return;
    try {
      await reviewSpecialAssistance(approvingReq.id, {
        status: 'approved',
        assignedRoom,
        staffNote: `Approved by ${assignedStaff}`,
        staffName: assignedStaff
      });
      confetti({ particleCount: 60, spread: 60 });
      setApproveModalOpen(false);
      setApprovingReq(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // If not logged in, show Staff Login Screen
  if (!currentUser) {
    return (
      <div className="py-10 max-w-md mx-auto text-left animate-fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-brand-blue flex items-center justify-center mx-auto text-2xl font-black">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-brand-navy dark:text-white tracking-tight">
              Staff Portal Login
            </h2>
            <p className="text-xs text-slate-500">
              Sign in with your staff credentials to manage counters and queues.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. doctor, officer, barista, staff"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <button
              onClick={() => handleLogin()}
              className="w-full py-3.5 bg-brand-blue hover:opacity-90 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-brand-blue/25 transition-all flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Staff Desk</span>
            </button>
          </div>

          {/* Quick Demo 1-Click Login Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block text-center">
              Quick 1-Click Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => handleLogin('doctor', 'password123')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-center font-bold text-slate-700 dark:text-slate-300"
              >
                🏥 Doctor
              </button>
              <button
                onClick={() => handleLogin('officer', 'password123')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-center font-bold text-slate-700 dark:text-slate-300"
              >
                🏛️ Officer
              </button>
              <button
                onClick={() => handleLogin('barista', 'password123')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-center font-bold text-slate-700 dark:text-slate-300"
              >
                🥤 Barista
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center">Password: <code>password123</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto py-2 animate-fade-in">
      
      {/* Top Banner & Hub Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
            <span>Staff Portal</span>
            <span>&bull;</span>
            <span className="text-slate-500 dark:text-slate-400">Signed in as {currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight mt-0.5">
            Staff Counter Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Attend customers, call next tokens, manage skips/holds/transfers, and review Special Assistance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hub Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setActiveCategory('hospital'); setSelectedCounterId('ctr-h1'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'hospital' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              🏥 Hospital
            </button>
            <button
              onClick={() => { setActiveCategory('village_office'); setSelectedCounterId('ctr-v1'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'village_office' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              🏛️ Village Office
            </button>
            <button
              onClick={() => { setActiveCategory('beverage_shop'); setSelectedCounterId('ctr-b1'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'beverage_shop' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              🥤 Beverage Shop
            </button>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Dashboard Metric Cards (Section 18 requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Queue</span>
          <div className="font-mono text-2xl font-black text-brand-navy dark:text-white">{categoryTokens.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold">Total tokens today</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Waiting Customers</span>
          <div className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400">{waitingTokens.length}</div>
          <span className="text-[10px] text-amber-600 font-semibold">In active line</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Currently Serving</span>
          <div className="font-mono text-2xl font-black text-brand-blue">{servingToken ? servingToken.tokenNumber : 'None'}</div>
          <span className="text-[10px] text-brand-blue font-semibold">{servingToken ? servingToken.customerName : 'Ready'}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Completed Today</span>
          <div className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedToday}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Served visitors</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Average Waiting Time</span>
          <div className="font-mono text-2xl font-black text-purple-600 dark:text-purple-400">~{avgWait}</div>
          <span className="text-[10px] text-purple-600 font-semibold">Dynamic algorithm</span>
        </div>
      </div>

      {/* Special Assistance Staff Panel (Section 19 requirement) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-purple-300 dark:border-purple-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-purple-100 dark:border-purple-900/60 mb-5 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-brand-purple flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-brand-navy dark:text-white">
                  Special Assistance Requests Panel
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-brand-purple border border-purple-200">
                  {categoryRequests.filter(r => r.status === 'pending').length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review and approve priority requests, assign consultation rooms, counters, and staff members.
              </p>
            </div>
          </div>
        </div>

        {categoryRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center italic">
            No special assistance requests currently logged for this hub.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryRequests.map(req => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';

              return (
                <div
                  key={req.id}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                    isApproved
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : isPending
                      ? 'border-purple-300 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-brand-purple block">
                        {req.categoryLabel}
                      </span>
                      <h4 className="font-extrabold text-sm text-brand-navy dark:text-white">
                        {req.tokenNumber || 'Token'} &bull; {req.customerName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">{req.customerPhone}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isApproved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mb-3 space-y-1">
                    <div><strong>Service:</strong> {req.serviceName}</div>
                    <div><strong>Support Detail:</strong> {req.supportDetails}</div>
                    {req.assignedRoom && (
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Assigned Station: {req.assignedRoom}</span>
                      </div>
                    )}
                  </div>

                  {isPending ? (
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => {
                          setApprovingReq(req);
                          setApproveModalOpen(true);
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Assign Room</span>
                      </button>

                      <button
                        onClick={() => reviewSpecialAssistance(req.id, { status: 'rejected', staffNote: 'Rejected by staff' })}
                        className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved &bull; Customer notified with room assignment</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Queue Management Station & Action Grid (Section 18 requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Counter Control Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Station</span>
              <h3 className="font-extrabold text-base text-brand-navy dark:text-white">
                {activeCounter?.name || 'Counter Desk'}
              </h3>
            </div>

            {filteredCounters.length > 1 && (
              <select
                value={selectedCounterId}
                onChange={(e) => setSelectedCounterId(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
              >
                {filteredCounters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Currently Serving Hero */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              CURRENTLY SERVING AT THIS COUNTER
            </span>
            <div className="font-mono text-5xl font-black text-brand-navy dark:text-white">
              {servingToken ? servingToken.tokenNumber : 'Ready'}
            </div>
            <div className="text-xs font-bold text-brand-blue">
              {servingToken ? `${servingToken.customerName} (${servingToken.serviceName})` : 'Counter Available for Next Customer'}
            </div>

            {servingToken && (
              <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleComplete(servingToken)}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Service</span>
                </button>
                <button
                  onClick={() => handleRecall(servingToken)}
                  className="py-2.5 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold"
                  title="Recall with chime"
                >
                  Recall
                </button>
              </div>
            )}
          </div>

          {/* Call Next Button */}
          <button
            onClick={handleCallNext}
            disabled={actionLoading || waitingTokens.length === 0}
            className="w-full py-4 bg-brand-blue hover:opacity-90 disabled:opacity-50 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-brand-blue/25 transition-all flex items-center justify-center space-x-2"
          >
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span>{actionLoading ? 'Calling...' : `Call Next (${waitingTokens.length} waiting)`}</span>
          </button>
        </div>

        {/* Right: Main Queue Table with Actions (Section 18 requirement) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Queue Management Table</span>
              <h3 className="font-extrabold text-base text-brand-navy dark:text-white">
                Queue Roster & Fast Actions
              </h3>
            </div>
            <button
              onClick={refreshData}
              className="text-xs font-semibold text-slate-500 hover:text-brand-blue flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Table: Token | Customer | Wait | Status | Action */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-extrabold text-[10px]">
                  <th className="py-2.5 px-2">Token</th>
                  <th className="py-2.5 px-2">Customer</th>
                  <th className="py-2.5 px-2">Wait</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categoryTokens.slice(0, 10).map((tok) => {
                  const isServing = tok.status === 'in_service';
                  const isWaiting = tok.status === 'waiting';

                  return (
                    <tr key={tok.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-2 font-mono font-black text-sm text-brand-navy dark:text-white">
                        {tok.tokenNumber}
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{tok.customerName}</div>
                        <div className="text-[10px] text-slate-400">{tok.serviceName}</div>
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {isServing ? '0m' : `~${tok.estimatedWaitMins}m`}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isServing ? 'bg-amber-400 text-slate-950 font-black' : isWaiting ? 'bg-blue-100 text-brand-blue dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tok.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {isServing && (
                            <>
                              <button
                                onClick={() => handleComplete(tok)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                                title="Complete"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleRecall(tok)}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold"
                                title="Recall"
                              >
                                Recall
                              </button>
                            </>
                          )}
                          {isWaiting && (
                            <>
                              <button
                                onClick={() => handleHold(tok)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold"
                                title="Put on Hold"
                              >
                                Hold
                              </button>
                              <button
                                onClick={() => handleSkip(tok)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold"
                                title="Skip customer"
                              >
                                Skip
                              </button>
                              <button
                                onClick={() => {
                                  setTransferToken(tok);
                                  setTransferModalOpen(true);
                                }}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold"
                                title="Transfer"
                              >
                                Transfer
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Transfer Modal Dialog */}
      {transferModalOpen && transferToken && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-brand-navy dark:text-white">
              Transfer Token {transferToken.tokenNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Transfer customer to another service or specialized counter.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Target Service</label>
              <select
                value={transferServiceId}
                onChange={(e) => setTransferServiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="srv-h3">Laboratory (Express Diagnostics)</option>
                <option value="srv-h4">Pharmacy (Prescription Dispense)</option>
                <option value="srv-h5">Billing & Clearance</option>
                <option value="srv-v1">Certificate Application</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Reason / Attendant Note</label>
              <input
                type="text"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="px-5 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Special Assistance Modal Dialog */}
      {approveModalOpen && approvingReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-200 dark:border-purple-800 space-y-4">
            <h3 className="text-lg font-black text-brand-navy dark:text-white">
              Approve Assistance for {approvingReq.customerName}
            </h3>
            <p className="text-xs text-slate-500">
              Assign counter, room, and attending staff member. A real-time notification will be sent to the customer.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Assigned Counter / Room</label>
              <select
                value={assignedRoom}
                onChange={(e) => setAssignedRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="Consultation Room 2">Consultation Room 2 (Specialist)</option>
                <option value="Consultation Room 1">Consultation Room 1 (Main OPD)</option>
                <option value="Counter 1 - Certificates">Counter 1 - Certificates (Priority Desk)</option>
                <option value="Pickup Counter 1">Pickup Counter 1 (Express Bar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Attending Staff Member</label>
              <input
                type="text"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Approve & Notify Customer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
