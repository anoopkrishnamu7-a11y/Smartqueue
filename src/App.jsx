import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HeroSection from './components/home/HeroSection';
import QuickStatsSection from './components/home/QuickStatsSection';
import ServiceCategoriesSection from './components/home/ServiceCategoriesSection';
import HowItWorksSection from './components/home/HowItWorksSection';
import ServicesPage from './pages/ServicesPage';
import SpecialAssistancePage from './pages/SpecialAssistancePage';
import MyTokenPage from './pages/MyTokenPage';
import HowItWorksPage from './pages/HowItWorksPage';
import StaffDashboard from './components/staff/StaffDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import PublicDisplayBoard from './components/display/PublicDisplayBoard';
import SelfServiceKiosk from './components/kiosk/SelfServiceKiosk';
import JoinQueueModal from './components/modals/JoinQueueModal';
import SpecialAssistanceModal from './components/modals/SpecialAssistanceModal';
import SpecialAssistanceApprovedModal from './components/modals/SpecialAssistanceApprovedModal';
import TrackTokenModal from './components/modals/TrackTokenModal';
import TwoMinuteAlertModal from './components/modals/TwoMinuteAlertModal';
import FinalTurnAlertModal from './components/modals/FinalTurnAlertModal';
import PresentationSimulatorBar from './components/PresentationSimulatorBar';
import AudioNotificationToast from './components/AudioNotificationToast';

function MainLayout() {
  const { currentView, notificationPermission, requestNotificationPermission } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

      {/* Notification banner */}
      {notificationPermission === 'default' && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white px-4 py-2.5 text-xs font-semibold">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-center sm:text-left">
              🔔 <strong>Enable 2-Minute Turn Alerts:</strong> Allow notifications so SmartQueue can alert you before your turn!
            </span>
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-1.5 bg-white text-indigo-700 rounded-lg text-xs font-bold shadow hover:bg-indigo-50 transition-colors shrink-0"
            >
              Enable Notifications
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full">
        {currentView === 'home' && (
          <div>
            <HeroSection />
            <QuickStatsSection />
            <ServiceCategoriesSection />
            <HowItWorksSection />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {currentView === 'services' && <ServicesPage />}
          {currentView === 'special-assistance' && <SpecialAssistancePage />}
          {currentView === 'my-token' && <MyTokenPage />}
          {currentView === 'how-it-works' && <HowItWorksPage />}
          {currentView === 'staff' && <StaffDashboard />}
          {currentView === 'admin' && <AdminDashboard />}
          {currentView === 'display' && <PublicDisplayBoard />}
          {currentView === 'kiosk' && <SelfServiceKiosk />}
        </div>
      </main>

      {/* Modals */}
      <JoinQueueModal />
      <SpecialAssistanceModal />
      <SpecialAssistanceApprovedModal />
      <TrackTokenModal />
      <TwoMinuteAlertModal />
      <FinalTurnAlertModal />

      <PresentationSimulatorBar />
      <AudioNotificationToast />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-black">S</div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">SmartQueue</span>
              <p className="text-[10px] text-slate-400 mt-0.5">"Your Time Matters. Join the Queue, Not the Crowd."</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SSE Real-Time Sync
            </span>
            <span>•</span>
            <span>2-Min Mobile Alert</span>
            <span>•</span>
            <span>Priority Assistance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
