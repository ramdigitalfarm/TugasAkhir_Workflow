/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowUpRight, 
  Bell, 
  ShieldAlert, 
  Upload, 
  Users, 
  Layers, 
  Database,
  ArrowRight,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { Drawing, User, UserDivision, SystemNotification } from '../types';

interface DashboardProps {
  drawings: Drawing[];
  currentUser: User;
  onNavigateToTab: (tab: string) => void;
  onOpenUpload: () => void;
  onSelectDrawing: (drawing: Drawing) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  notifications: SystemNotification[];
}

export default function Dashboard({
  drawings: allDrawings,
  currentUser,
  onNavigateToTab,
  onOpenUpload,
  onSelectDrawing,
  unreadNotificationsCount,
  onOpenNotifications,
  notifications,
}: DashboardProps) {
  // Operational Division Filter: Only show fully Approved (Project Dimulai) projects to operational divisions
  const isOperationalDivision = currentUser && 
    currentUser.role !== 'Administrator' &&
    currentUser.division !== 'All' && 
    currentUser.division !== 'Sales' && 
    currentUser.division !== 'Estimator' && 
    currentUser.division !== 'Engineering';

  const drawings = isOperationalDivision
    ? allDrawings.filter((d) => d.status === 'Approved')
    : allDrawings;

  // Aggregate Stats
  const totalCount = drawings.length;
  const approvedCount = drawings.filter((d) => d.status === 'Approved').length;
  const pendingCount = drawings.filter((d) => d.status === 'Pending Approval').length;
  const rejectedCount = drawings.filter((d) => d.status === 'Rejected').length;

  // Recent revisions/drawings list
  const recentDrawings = [...drawings]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  // List of 9 standard divisions
  const DIVISIONS: UserDivision[] = [
    'Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control', 'Ekspedisi'
  ];

  // Helper for status count per division
  const getDisributionPerDivision = (div: UserDivision) => {
    const totalAffected = drawings.filter((d) => d.affectedDivisions.includes(div) || d.affectedDivisions.includes('All'));
    const approvedAffected = totalAffected.filter((d) => d.status === 'Approved');
    const pendingAffected = totalAffected.filter((d) => d.status === 'Pending Approval');
    
    return {
      total: totalAffected.length,
      approved: approvedAffected.length,
      pending: pendingAffected.length
    };
  };

  return (
    <div className="space-y-6">
      {/* Upper Welcome Header banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded">
            Sistem Koordinasi Panel Distribusi Listrik (ISO-9001)
          </span>
          <h2 className="text-2xl font-display font-semibold mt-3">
            Selamat Datang, {currentUser.fullName}
          </h2>
          <p className="text-slate-300 text-sm mt-1.5 max-w-xl leading-relaxed">
            Anda aktif sebagai <strong className="text-amber-400 font-semibold uppercase">{currentUser.role === 'Kepala Divisi' ? `KABAG ${currentUser.division}` : currentUser.role}</strong>. Gunakan dashboard ini untuk meninjau rilis wiring diagram terbaru, menyetujui cetak biru, atau melaporkan progress instalasi komponen per divisi.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          {(currentUser.role === 'Engineering') && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 cursor-pointer bg-amber-500 text-slate-950 font-bold px-4 md:px-5 py-2.5 rounded-xl shadow hover:bg-amber-400 font-display transition-all text-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Gambar Panel</span>
            </button>
          )}

          {currentUser.role === 'Administrator' && (
            <button
              onClick={() => onNavigateToTab('users')}
              className="flex items-center gap-2 cursor-pointer bg-slate-800 text-white border border-slate-700 font-semibold px-4 md:px-5 py-2.5 rounded-xl shadow hover:bg-slate-700 transition-all text-sm"
            >
              <Users className="h-4 w-4" />
              <span>Kelola Akun Staff</span>
            </button>
          )}

          <button
            onClick={() => onNavigateToTab('drawings')}
            className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 md:px-5 py-2.5 rounded-xl transition-all text-sm"
          >
            <span>Daftar Proyek Panel</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stat */}
        <div 
          onClick={() => onNavigateToTab('drawings')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-amber-500 transition-all group duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-50 text-slate-700 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-0.5 group-hover:text-amber-600 font-bold transition-all">
              LIHAT DATA <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 mt-4 leading-none">
            {totalCount}
          </p>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
            Total Proyek Panel
          </h3>
        </div>

        {/* Approved Stat (Latest approved drawing validation) */}
        <div 
          onClick={() => onNavigateToTab('drawings')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-emerald-500 transition-all group duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-0.5 group-hover:text-emerald-500 font-bold transition-all">
              SIAP PRODUKSI <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 mt-4 leading-none">
            {approvedCount}
          </p>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
            Approved (Rilis Kerja)
          </h3>
        </div>

        {/* Pending Review Stat */}
        <div 
          onClick={() => onNavigateToTab('drawings')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-amber-400 transition-all group duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-0.5 group-hover:text-amber-500 font-bold transition-all">
              SPOILER REVISI <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 mt-4 leading-none">
            {pendingCount}
          </p>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
            Menunggu Approval
          </h3>
        </div>

        {/* Rejected Stat */}
        <div 
          onClick={() => onNavigateToTab('drawings')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-rose-500 transition-all group duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-all">
              <XCircle className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-0.5 group-hover:text-rose-500 font-bold transition-all">
              RE-DESIGN <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 mt-4 leading-none">
            {rejectedCount}
          </p>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
            Revisi Ditolak
          </h3>
        </div>
      </div>

      {/* Main Content (Now Full Width without Notifications Column) */}
      <div className="w-full">
        
        {/* Full-width Monitoring Progress & Status Produksi */}
        <div className="w-full bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-rose-50 pb-3">
            <div>
              <h3 className="font-display font-semibold text-slate-950 text-sm flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-blue-600" />
                <span>Monitoring Progress & Status Produksi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konstruksi Panel: Nama PT ➔ Proyek Pabrik ➔ Rincian Panel ➔ Status Alur Kerja Divisi. {isOperationalDivision && "Menampilkan proyek yang telah disetujui Sales & Customer (ACC) untuk fabrikasi."}
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono bg-indigo-50 border border-indigo-150 text-indigo-700 px-2.5 py-1 rounded font-bold hover:bg-indigo-100 transition-colors">
              Koor. Produksi
            </span>
          </div>

          {drawings.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium text-xs">
              Belum ada data proyek panel listrik terdaftar di sistem.
            </div>
          ) : (
            <div className="space-y-4">
              {drawings.map((drawing) => {
                const totalPanelsCount = drawing.panels?.reduce((sum, p) => sum + p.quantity, 0) || 0;
                
                // Determine valid approved release (if any)
                const validRev = [...drawing.revisions].reverse().find(r => r.status === 'Approved');
                const validReleaseDisplay = validRev 
                  ? `${validRev.revisionCode} (${new Date(validRev.uploadedAt).toLocaleDateString('id-ID')})`
                  : 'Belum Ada Rilis Valid (Dalam Tinjauan)';

                return (
                  <div 
                    key={drawing.id} 
                    onClick={() => onSelectDrawing(drawing)}
                    className="p-4.5 border border-slate-200/80 rounded-xl hover:bg-slate-50/55 hover:border-slate-350 transition-all cursor-pointer space-y-4 group text-left max-w-full overflow-hidden"
                  >
                    {/* Simplified Metadata Grid strictly matching requested parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-150 p-3.5 rounded-lg group-hover:bg-slate-100/40 transition-colors">
                      {/* 1. Nama PT */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-0.5">Nama PT</span>
                        <span className="text-xs font-bold text-slate-900 font-sans block">{drawing.customerName}</span>
                      </div>

                      {/* 2. Project */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-0.5">Project</span>
                        <span className="text-xs font-semibold text-slate-800 block truncate">{drawing.projectName}</span>
                      </div>

                      {/* 3. Dibuat */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-0.5">Dibuat</span>
                        <span className="text-xs text-slate-700 block truncate">
                          {drawing.createdBy} • <span className="font-mono text-[10px] text-slate-400">{new Date(drawing.createdAt).toLocaleDateString('id-ID')}</span>
                        </span>
                      </div>

                      {/* 4. Rilis Valid */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-rose-500 font-bold block mb-0.5">Rilis Valid</span>
                        <span className={`text-[11px] font-bold block font-mono ${validRev ? 'text-emerald-700' : 'text-slate-500 italic'}`}>
                          {validReleaseDisplay}
                        </span>
                      </div>
                    </div>

                    {/* Left padding branch to show list of panels */}
                    <div className="pl-4 border-l-2 border-slate-200 space-y-3">
                      {/* 5. List of Panel Products */}
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-1.5">
                          ✦ List Panel ({totalPanelsCount} Unit)
                        </span>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {drawing.panels && drawing.panels.length > 0 ? (
                            drawing.panels.map((p, idx) => (
                              <span 
                                key={p.id || idx} 
                                className="text-[10px] font-mono bg-white border border-slate-200 hover:border-slate-350 text-slate-800 px-2.5 py-1 rounded shadow-xs flex items-center gap-1 font-bold"
                              >
                                <span className="text-blue-655 font-extrabold">{p.quantity}x</span>
                                <span className="font-sans text-slate-700 font-medium">{p.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Belum ada variasi tipe panel terdaftar.</span>
                          )}
                        </div>
                      </div>

                      {/* 6. Status Proses Produksi */}
                      <div className="pt-1.5 border-t border-slate-100">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-2">
                          ◇ Status Proses Produksi & Alur Lapangan
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {/* We list 5 main active divisions with production tasks */}
                          {['Assembly', 'Produksi', 'Gudang', 'Quality Control', 'Ekspedisi'].map((div) => {
                            const proc = (drawing.divisionProcesses || []).find((p) => p.division === div) || {
                              status: 'Belum Diproses',
                              updatedBy: '-'
                            };

                            const procColors: Record<string, string> = {
                              'Belum Diproses': 'bg-slate-55/75 text-slate-600 border-slate-200',
                              'Sedang Diproses': 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
                              'Selesai Diproses': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                              'Menunggu Revisi': 'bg-rose-50 text-rose-700 border-rose-200',
                              'Dalam Revisi': 'bg-purple-50 text-purple-700 border-purple-200'
                            };

                            const indicatorDot = proc.status === 'Selesai Diproses' ? 'bg-emerald-500' :
                                                 proc.status === 'Sedang Diproses' ? 'bg-blue-550' :
                                                 proc.status === 'Menunggu Revisi' || proc.status === 'Dalam Revisi' ? 'bg-rose-500' :
                                                 'bg-slate-400';

                            return (
                              <div 
                                key={div} 
                                className={`border p-2 rounded-lg text-left shadow-xs hover:bg-slate-50 transition-colors ${procColors[proc.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[9px] font-bold uppercase truncate" title={div}>
                                    {div}
                                  </span>
                                  <span className={`w-1.5 h-1.5 rounded-full ${indicatorDot} shrink-0`}></span>
                                </div>
                                <div className="mt-1 font-mono text-[9px] font-bold truncate opacity-90" title={proc.status}>
                                  {proc.status}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Warnings box */}
          <div className="p-3 bg-amber-55/60 rounded-xl border border-amber-100 flex gap-2.5 mt-2">
            <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-amber-805 leading-tight">
                Peringatan Cetak Biru & Volume Tembaga / Plat Enclosure
              </p>
              <p className="text-[10px] text-amber-700/90 mt-0.5 leading-relaxed">
                Staff perakitan busbar & enclosure wajib mengacu pada estimasi kuantitas panel di atas demi kesesuaian material tembaga & panel enclosure sesuai volumenya. Jangan pernah mengerjakan proses produksi menggunakan rilis diagram lama.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
