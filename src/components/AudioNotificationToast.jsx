import React from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, X, ArrowRight, Sparkles } from 'lucide-react';

export default function AudioNotificationToast() {
  const { lastNotification, setLastNotification, setCurrentRole, setMyActiveTokenId } = useApp();

  if (!lastNotification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border-2 border-brand-500 animate-slide-up flex items-start space-x-3">
      <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-brand-500/30 animate-pulse">
        <Volume2 className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-white tracking-tight">
            {lastNotification.title}
          </h4>
          <button
            onClick={() => setLastNotification(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mt-0.5 leading-snug">
          {lastNotification.message}
        </p>

        {lastNotification.tokenId && (
          <button
            onClick={() => {
              setMyActiveTokenId(lastNotification.tokenId);
              setCurrentRole('customer');
              setLastNotification(null);
            }}
            className="mt-2 text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
          >
            <span>View Ticket Pass</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
