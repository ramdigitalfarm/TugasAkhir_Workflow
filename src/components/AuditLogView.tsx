/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ShieldAlert, 
  Database, 
  Filter, 
  Clock, 
  User as UserIcon,
  Tag
} from 'lucide-react';
import { AuditLog, UserDivision, UserRole } from '../types';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
}

export default function AuditLogView({ auditLogs }: AuditLogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<UserDivision | 'All'>('All');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'All'>('All');

  const divisionsList: (UserDivision | 'All')[] = [
    'All', 'Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control', 'Ekspedisi'
  ];

  const rolesList: (UserRole | 'All')[] = [
    'All', 'Administrator', 'Engineering', 'Kepala Divisi', 'Divisi Operasional'
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const targetText = `${log.username} ${log.action} ${log.details}`.toLowerCase();
    const matchesSearch = targetText.includes(searchQuery.toLowerCase());

    const matchesDivision = selectedDivision === 'All' || log.userDivision === selectedDivision;
    const matchesRole = selectedRole === 'All' || log.userRole === selectedRole;

    return matchesSearch && matchesDivision && matchesRole;
  });

  return (
    <div className="space-y-5">
      {/* Header logs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 pb-4 text-left">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" /> Audit Trail System Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log riwayat aktivitas sistem tidak dapat diubah (immutable), merekam detail upload, revisi pertimbangan, dan approval rilis lintas divisi.
          </p>
        </div>

        <span className="text-[10px] font-mono uppercase bg-slate-900 text-white px-2.5 py-1 rounded-md font-bold tracking-wider">
          Compliance standard: ISO-9001
        </span>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aktivitas, nama staff, log detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border bg-slate-50 border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0 font-medium">Asal Divisi:</span>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value as UserDivision | 'All')}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {divisionsList.map((div) => (
              <option key={div} value={div}>
                {div === 'All' ? 'Semua Divisi' : div}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0 font-medium">Level Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole | 'All')}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {rolesList.map((role) => (
              <option key={role} value={role}>
                {role === 'All' ? 'Semua Hak Akses' : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log timeline list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-left">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User Operator</th>
                <th className="p-4">Kode Action</th>
                <th className="p-4">Detail Pengendalian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                let actionBadgeColor = 'bg-slate-150 text-slate-800 border-slate-250';
                if (log.action === 'UPLOAD_DRAWING') actionBadgeColor = 'bg-blue-50 text-blue-700 border-blue-100';
                if (log.action === 'UPLOAD_REVISION') actionBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-150';
                if (log.action === 'APPROVE_REVISION') actionBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-150';
                if (log.action === 'REJECT_REVISION') actionBadgeColor = 'bg-rose-50 text-rose-750 border-rose-150';
                if (log.action === 'ADD_USER') actionBadgeColor = 'bg-amber-50 text-amber-800 border-amber-100';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-450" />
                        <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block flex items-center gap-1">
                          <UserIcon className="h-3 w-3 text-slate-400" />
                          {log.username}
                        </span>
                        <div className="flex gap-1">
                          <span className="text-[9px] font-semibold bg-slate-100/80 text-slate-500 px-1 rounded uppercase">
                            {log.userRole}
                          </span>
                          <span className="text-[9px] font-semibold bg-blue-50/70 text-blue-600 px-1 rounded uppercase">
                            {log.userDivision}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wide border uppercase ${actionBadgeColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-650 max-w-sm">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
