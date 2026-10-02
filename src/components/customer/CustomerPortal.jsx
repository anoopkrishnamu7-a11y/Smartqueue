import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import LiveTokenTicket from './LiveTokenTicket';
import BranchDirectory from './BranchDirectory';
import JoinQueueModal from './JoinQueueModal';
import BookAppointmentModal from './BookAppointmentModal';
import FeedbackModal from './FeedbackModal';
import CustomerHistory from './CustomerHistory';
import {
  Ticket,
  Building,
  History,
  PlusCircle,
  Calendar,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function CustomerPortal() {
  const { myActiveToken, services, selectedBranchId, branches } = useApp();

  const [activeTab, setActiveTab] = useState('ticket'); // 'ticket', 'branches', 'history'
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [feedbackToken, setFeedbackToken] = useState(null);
  const [modalBranch, setModalBranch] = useState(null);

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const branchServices = services.filter(s => s.branchId === selectedBranchId);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-600/10 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute right-40 top-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Real-Time Queuing</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Never wait in a crowded line again.
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed mb-6">
            Join queues remotely from your smartphone, monitor live countdowns, and get notified right when your turn is approaching at the counter.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setModalBranch(currentBranch);
                setShowJoinModal(true);
              }}
              className="py-2.5 px-5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-black/10 transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              <span>Get Digital Token</span>
            </button>
            <button
              onClick={() => {
                setModalBranch(currentBranch);
                setShowBookModal(true);
              }}
              className="py-2.5 px-5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Subnav Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ticket')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ticket'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>My Live Token</span>
          {myActiveToken && myActiveToken.status !== 'completed' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'branches'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Locations & Services</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Visit History & Appointments</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'ticket' && (
        <div className="space-y-6">
          <LiveTokenTicket
            token={myActiveToken}
            onOpenFeedback={(tok) => setFeedbackToken(tok)}
          />

          {/* Quick Service Selection Grid below ticket */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Available Services at {currentBranch?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select any service to generate an immediate token.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('branches')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <span>View all locations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {branchServices.map(srv => (
                <div
                  key={srv.id}
                  onClick={() => {
                    setModalBranch(currentBranch);
                    setShowJoinModal(true);
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-brand-50/20 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                      Prefix {srv.prefix}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      ~{srv.avgDurationMins}m
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                    {srv.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {srv.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branches' && (
        <BranchDirectory
          onSelectBranch={(b) => setModalBranch(b)}
          onOpenJoinQueue={(b) => {
            setModalBranch(b);
            setShowJoinModal(true);
          }}
          onOpenBookAppointment={(b) => {
            setModalBranch(b);
            setShowBookModal(true);
          }}
        />
      )}

      {activeTab === 'history' && (
        <CustomerHistory
          onSelectToken={(tok) => setActiveTab('ticket')}
          onOpenFeedback={(tok) => setFeedbackToken(tok)}
        />
      )}

      {/* Modals */}
      <JoinQueueModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        defaultBranch={modalBranch || currentBranch}
      />

      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        defaultBranch={modalBranch || currentBranch}
      />

      <FeedbackModal
        isOpen={!!feedbackToken}
        token={feedbackToken}
        onClose={() => setFeedbackToken(null)}
      />

    </div>
  );
}
