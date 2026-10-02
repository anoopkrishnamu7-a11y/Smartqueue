import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  ArrowRight,
  Star,
  Building2
} from 'lucide-react';

export default function CustomerHistory({ onSelectToken, onOpenFeedback }) {
  const { tokens, appointments, currentUser, setMyActiveTokenId, checkInAppointment } = useApp();

  const customerName = currentUser?.name || 'Sophia Martinez';

  // Filter tokens belonging to current customer
  const myTokens = tokens.filter(t => 
    t.customerName === customerName || t.customerPhone === currentUser?.phone
  ).sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  // Filter appointments
  const myAppointments = appointments.filter(a =>
    a.customerName === customerName || a.customerPhone === currentUser?.phone
  );

  return (
    <div className="space-y-6">
      
      {/* Appointments Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Upcoming & Scheduled Visits</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When you arrive at the branch, click "Check In" to enter the queue with priority.
            </p>
          </div>
        </div>

        {myAppointments.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No upcoming appointments booked.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myAppointments.map(apt => (
              <div
                key={apt.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mb-1">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>{apt.date} &bull; {apt.timeSlot}</span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {apt.notes || 'Routine Scheduled Consultation'}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize mt-0.5">
                    Status: <span className="font-semibold text-brand-600 dark:text-brand-400">{apt.status.replace('_', ' ')}</span>
                  </div>
                </div>

                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => checkInAppointment(apt.id)}
                    className="py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                  >
                    <span>Check In</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {apt.status === 'checked_in' && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded">
                    In Queue ({apt.tokenId ? 'Active' : ''})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2 mb-4">
          <Clock className="w-4 h-4 text-brand-600" />
          <span>Recent Queue History & Passes</span>
        </h3>

        {myTokens.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No queue history found for this account.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Token #</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Counter</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myTokens.map(tok => {
                  return (
                    <tr key={tok.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        {tok.tokenNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {tok.serviceName}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(tok.joinedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(tok.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {tok.counterName || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">
                        {tok.actualServiceMins ? `${tok.actualServiceMins}m` : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          tok.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : tok.status === 'waiting'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : tok.status === 'calling'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : tok.status === 'in_service'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {tok.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {tok.status === 'completed' ? (
                          <button
                            onClick={() => onOpenFeedback(tok)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 rounded text-[11px] font-semibold flex items-center space-x-1 ml-auto"
                          >
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>Rate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setMyActiveTokenId(tok.id);
                              onSelectToken(tok);
                            }}
                            className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 rounded text-[11px] font-semibold"
                          >
                            View Pass
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
