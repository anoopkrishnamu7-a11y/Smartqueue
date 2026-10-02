import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Search,
  Download,
  Filter,
  CheckCircle,
  Clock,
  User,
  Shield
} from 'lucide-react';

export default function AuditLogsView() {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || log.actorRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smartqueue-audit-logs-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
            System Event Ledger & Audit Trail
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tamper-evident timestamped history of all tokens, calls, transfers, and rule modifications.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="py-2 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Logs (JSON)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, token, or actor..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Actor:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Actors</option>
            <option value="customer">Customers</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="system">System Engine</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Actor</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    log.action.includes('CALLED')
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                      : log.action.includes('COMPLETED')
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                      : log.action.includes('CREATED')
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
                      : log.action.includes('TRANSFERRED')
                      ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                  {log.actorName}
                </td>
                <td className="py-2.5 px-3">
                  <span className="capitalize text-slate-500 text-[11px]">
                    {log.actorRole}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
