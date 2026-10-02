import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { announceTokenCall, playChime } from '../utils/audioAnnouncer';

const AppContext = createContext();

function getViewFromPath(pathname) {
  const clean = (pathname || window.location.pathname || '').replace(/^\/+|\/+$/g, '');
  if (['services', 'special-assistance', 'my-token', 'staff', 'admin', 'display', 'how-it-works'].includes(clean)) {
    return clean;
  }
  return 'home';
}

export function AppProvider({ children }) {
  // Navigation & View with browser URL syncing
  const [currentView, setInternalCurrentView] = useState(() => getViewFromPath(window.location.pathname));
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync view to browser URL history
  const setCurrentView = (view) => {
    setInternalCurrentView(view);
    const targetPath = view === 'home' ? '/' : `/${view}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setInternalCurrentView(getViewFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Theme & Dark Mode System
  const [theme, setTheme] = useState(() => localStorage.getItem('sq_theme') || 'default');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('sq_dark') === 'true');

  useEffect(() => {
    localStorage.setItem('sq_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sq_dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Browser Notification Permission State (Section 13)
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        return perm;
      } catch (e) {
        console.warn('Could not request notification permission:', e);
      }
    }
    return 'denied';
  };

  const triggerBrowserNotification = (title, body) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'smartqueue-alert'
        });
      } catch (e) {
        console.warn('Browser notification trigger failed:', e);
      }
    }
  };

  // Master Data
  const [organization, setOrganization] = useState(null);
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [specialAssistanceRequests, setSpecialAssistanceRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Active User / Demo Token (Defaults to prompt scenario: H125)
  const [myTokenNumber, setMyTokenNumber] = useState('H125');
  const [activeModal, setActiveModal] = useState(null); // 'join_queue', 'special_assistance', 'track_token', 'two_min_alert', 'final_turn_alert', 'token_success', 'special_assistance_approved', 'appointment'
  const [modalPreselect, setModalPreselect] = useState(null);
  const [lastGeneratedToken, setLastGeneratedToken] = useState(null);

  // 2-Minute Alert & Final Turn Alert States
  const [twoMinAlertData, setTwoMinAlertData] = useState(null);
  const [finalTurnAlertData, setFinalTurnAlertData] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [specialAssistanceApprovedData, setSpecialAssistanceApprovedData] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);

  // Simulation Controls (Section 22)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(3);
  const simTimerRef = useRef(null);

  const handleSetMyTokenNumber = (tokNum) => {
    setMyTokenNumber(tokNum);
    setTwoMinAlertData(null);
    setFinalTurnAlertData(null);
    setAlertDismissed(false);
  };

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      const data = await res.json();
      setOrganization(data.organization || null);
      setSettings(data.settings || null);
      setCategories(data.categories || []);
      setPlaces(data.places || []);
      setServices(data.services || []);
      setCounters(data.counters || []);
      setTokens(data.tokens || []);
      setSpecialAssistanceRequests(data.specialAssistanceRequests || []);
      setAppointments(data.appointments || []);
      setNotifications(data.notifications || []);
      setAuditLogs(data.auditLogs || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Server-Sent Events for real-time synchronization
  useEffect(() => {
    let evtSource = null;
    try {
      evtSource = new EventSource('/api/events');

      evtSource.addEventListener('two-minute-alert', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.token && (!myTokenNumber || payload.token.tokenNumber === myTokenNumber)) {
          setTwoMinAlertData(payload.token);
          setActiveModal('two_min_alert');
          playChime();
          triggerBrowserNotification(
            "🔔 SmartQueue - Your turn is approaching!",
            `Token ${payload.token.tokenNumber}: Estimated wait ~2 minutes. Please get ready to approach the service counter.`
          );
        }
      });

      evtSource.addEventListener('final-turn-alert', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.token && (!myTokenNumber || payload.token.tokenNumber === myTokenNumber)) {
          setFinalTurnAlertData(payload.token);
          setActiveModal('final_turn_alert');
          announceTokenCall(payload.token.tokenNumber, payload.token.counterName || 'Assigned Counter', soundEnabled);
          triggerBrowserNotification(
            "🎉 SmartQueue - It's Your Turn!",
            `Token ${payload.token.tokenNumber}: Please proceed to ${payload.token.counterName || 'assigned counter'}.`
          );
        }
      });

      evtSource.addEventListener('special-assistance-updated', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.request && payload.request.status === 'approved') {
          setSpecialAssistanceApprovedData(payload.request);
          setActiveModal('special_assistance_approved');
          playChime();
          triggerBrowserNotification(
            "💜 Special Assistance Approved!",
            `${payload.request.customerName} assigned to ${payload.request.assignedRoom || 'Consultation Room 2'}.`
          );
        }
        loadData();
      });

      evtSource.addEventListener('token-called', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.token) {
          announceTokenCall(payload.token.tokenNumber, payload.token.counterName, soundEnabled);
        }
        loadData();
      });

      const reloadEvents = [
        'token-created',
        'token-completed',
        'token-cancelled',
        'special-assistance-created',
        'queue-updated',
        'queue-reset'
      ];

      reloadEvents.forEach(evt => {
        evtSource.addEventListener(evt, () => loadData());
      });

    } catch (err) {
      console.error('SSE Error:', err);
    }

    return () => {
      if (evtSource) evtSource.close();
    };
  }, [soundEnabled, myTokenNumber, loadData]);

  // Fallback polling interval
  useEffect(() => {
    const intv = setInterval(() => {
      loadData();
    }, 6000);
    return () => clearInterval(intv);
  }, [loadData]);

  // Monitor active token for 2-minute alert
  const myToken = tokens.find(t => t.tokenNumber === myTokenNumber) || null;

  useEffect(() => {
    if (!myToken) return;

    if (myToken.status === 'waiting' && myToken.estimatedWaitMins <= 2 && !twoMinAlertData && !alertDismissed) {
      setTwoMinAlertData(myToken);
      setActiveModal('two_min_alert');
      playChime();
      triggerBrowserNotification(
        "🔔 SmartQueue - Your turn is approaching!",
        `Token ${myToken.tokenNumber}: Only a few customers ahead (~2 mins). Please approach the desk.`
      );
    }

    if (myToken.status === 'in_service' && !finalTurnAlertData) {
      setFinalTurnAlertData(myToken);
      setActiveModal('final_turn_alert');
      announceTokenCall(myToken.tokenNumber, myToken.counterName || 'Assigned Counter', soundEnabled);
    }
  }, [myToken, twoMinAlertData, finalTurnAlertData, alertDismissed, soundEnabled]);

  // Actions
  const handleJoinQueue = async (bookingData) => {
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const token = await res.json();
      if (!res.ok) throw new Error(token.error || 'Failed to generate token');

      setLastGeneratedToken(token);
      handleSetMyTokenNumber(token.tokenNumber);
      setActiveModal('token_success');
      loadData();
      return token;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const handleSpecialAssistance = async (data) => {
    try {
      const res = await fetch('/api/special-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit special assistance');
      loadData();
      return result;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const handleReviewSpecialAssistance = async (id, reviewData) => {
    try {
      const res = await fetch(`/api/special-assistance/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      const result = await res.json();
      loadData();
      return result;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const handleCancelToken = async (tokenId) => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/cancel`, { method: 'POST' });
      const result = await res.json();
      loadData();
      return result;
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCallNextCounter = async (counterId) => {
    try {
      const res = await fetch(`/api/counters/${counterId}/call-next`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'No customers in queue');
      loadData();
      return result;
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteToken = async (tokenId) => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/complete`, { method: 'POST' });
      const result = await res.json();
      loadData();
      return result;
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBookAppointment = async (aptData) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aptData)
      });
      const result = await res.json();
      loadData();
      return result;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const handleSimStep = async () => {
    try {
      await fetch('/api/simulation/step-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryKey: 'hospital' })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSimulation = async () => {
    try {
      await fetch('/api/simulation/reset', { method: 'POST' });
      handleSetMyTokenNumber('H125');
      setTwoMinAlertData(null);
      setFinalTurnAlertData(null);
      setSpecialAssistanceApprovedData(null);
      setAlertDismissed(false);
      setIsSimulating(false);
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isSimulating) {
      const intervalMs = Math.round(7000 / simSpeed);
      simTimerRef.current = setInterval(() => {
        handleSimStep();
      }, intervalMs);
    } else {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    }
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulating, simSpeed]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        soundEnabled,
        setSoundEnabled,
        theme,
        setTheme,
        darkMode,
        setDarkMode,
        notificationPermission,
        requestNotificationPermission,
        organization,
        settings,
        categories,
        places,
        services,
        counters,
        tokens,
        specialAssistanceRequests,
        appointments,
        notifications,
        auditLogs,
        myToken,
        myTokenNumber,
        setMyTokenNumber: handleSetMyTokenNumber,
        activeModal,
        setActiveModal,
        modalPreselect,
        setModalPreselect,
        lastGeneratedToken,
        setLastGeneratedToken,
        twoMinAlertData,
        setTwoMinAlertData,
        finalTurnAlertData,
        setFinalTurnAlertData,
        specialAssistanceApprovedData,
        setSpecialAssistanceApprovedData,
        lastNotification,
        setLastNotification,
        setAlertDismissed,

        // Simulation
        isSimulating,
        setIsSimulating,
        simSpeed,
        setSimSpeed,
        advanceSimulationStep: handleSimStep,
        resetSimulation: handleResetSimulation,

        // Actions
        joinQueue: handleJoinQueue,
        submitSpecialAssistance: handleSpecialAssistance,
        reviewSpecialAssistance: handleReviewSpecialAssistance,
        cancelToken: handleCancelToken,
        callNextCounter: handleCallNextCounter,
        completeToken: handleCompleteToken,
        bookAppointment: handleBookAppointment,
        refreshData: loadData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
