/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  FileText, 
  Download, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Drawing, User, UserDivision, DrawingStatus } from '../types';

interface DrawingListProps {
  drawings: Drawing[];
  currentUser: User;
  onSelectDrawing: (drawing: Drawing) => void;
  onOpenUpload: () => void;
}

export default function DrawingList({
  drawings,
  currentUser,
  onSelectDrawing,
  onOpenUpload,
}: DrawingListProps) {
  // Client state for filtering/searching
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<UserDivision | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<DrawingStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const divisionsList: (UserDivision | 'All')[] = [
    'All', 'Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control', 'Ekspedisi'
  ];

  const statusesList: (DrawingStatus | 'All')[] = [
    'All', 'Approved', 'Pending Approval', 'Rejected'
  ];

  // Filtering Logic
  const isOperationalDivision = currentUser && 
    currentUser.role !== 'Administrator' &&
    currentUser.division !== 'All' && 
    currentUser.division !== 'Sales' && 
    currentUser.division !== 'Estimator' && 
    currentUser.division !== 'Engineering';

  const visibleDrawings = isOperationalDivision
    ? drawings.filter((d) => d.status === 'Approved')
    : drawings;

  const filteredDrawings = visibleDrawings.filter((drawing) => {
    // Search filter
    const searchTarget = `${drawing.drawingNumber} ${drawing.title} ${drawing.projectName} ${drawing.description} ${drawing.customerName}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

    // Division filter (check if drawing affects selected division, or and 'All')
    const matchesDivision =
      selectedDivision === 'All' ||
      drawing.affectedDivisions.includes(selectedDivision) ||
      drawing.affectedDivisions.includes('All');

    // Status filter
    const matchesStatus =
      selectedStatus === 'All' || drawing.status === selectedStatus;

    return matchesSearch && matchesDivision && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header and Context Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900">
            Daftar Shop Drawing & Kontrol Revisi
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Grup Konstruksi: <span className="bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold font-mono text-[10px]">NAMA PT</span> ➔ <span className="text-indigo-850 font-semibold font-mono">PROYEK</span> ➔ <span className="text-blue-805 font-semibold font-mono">LIST PANEL</span> ➔ <span className="text-rose-805 font-semibold font-mono">REVISI DETAIL</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'Engineering' && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Registrasi Drawing Baru</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tabel
            </button>
          </div>
        </div>
      </div>

      {/* Warning Alert for Operational Users about REVISION CONTROL */}
      {isOperationalDivision && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-left">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-800">
              Validasi Gambar yang Disetujui (Latest Approved Drawing)
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              Sebagai staff divisi operasional <strong className="uppercase">{currentUser.division}</strong>, Anda hanya diperbolehkan mengakses proyek yang telah disetujui Sales & Customer (<span className="bg-emerald-605 text-white font-mono px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Approved ACC</span>). Hubungi Sales atau Kabag jika proyek Anda belum tercantum.
            </p>
          </div>
        </div>
      )}

      {/* Search & Advance Filters Row */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari perusahaan PT/CV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Division Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0 font-medium">Divisi Terkait:</span>
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

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0 font-medium">Status Approval:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DrawingStatus | 'All')}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {statusesList.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'Semua Status' : st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Listing Viewport */}
      {filteredDrawings.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Layers className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="font-display font-bold text-slate-800 text-sm">Tidak Ada Gambar Perusahaan Ditemukan</h3>
          <p className="text-xs max-w-md mx-auto">
            Gunakan filter di atas untuk menampilkan status pengerjaan gambar proyek panel berdasarkan PT terkait.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW LAYOUT (Showing Nama PT & Status Approval Only) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {filteredDrawings.map((drawing) => {
            return (
              <div 
                key={drawing.id}
                onClick={() => onSelectDrawing(drawing)}
                className="bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 rounded-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Header card border color depending on status */}
                <div className={`h-1.5 w-full ${
                  drawing.status === 'Approved' 
                    ? 'bg-emerald-500' 
                    : drawing.status === 'Pending Approval' 
                    ? 'bg-amber-500' 
                    : 'bg-rose-500'
                }`} />

                <div className="p-5 flex flex-col items-center justify-center space-y-4 text-center min-h-[140px]">
                  <div className="space-y-1 w-full">
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase block">NAMA PT / PERUSAHAAN</span>
                    <h3 className="font-display font-extrabold text-slate-900 text-base leading-snug truncate" title={drawing.customerName}>
                      {drawing.customerName}
                    </h3>
                  </div>

                  <div className="flex justify-center items-center gap-1.5">
                    <span className={`text-[11px] font-mono font-bold uppercase rounded-full px-3 py-1.5 flex items-center gap-1 ${
                      drawing.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                        : drawing.status === 'Pending Approval'
                        ? 'bg-amber-50 text-amber-700 border border-amber-150'
                        : 'bg-rose-50 text-rose-700 border border-rose-150'
                    }`}>
                      {drawing.status === 'Approved' ? <CheckCircle className="h-3 w-3" /> : drawing.status === 'Pending Approval' ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {drawing.status === 'Approved' ? 'SIAP PRODUKSI (CUSTOMER ACC)' : drawing.status}
                    </span>
                  </div>
                </div>

                {/* Simplified interactive footer */}
                <div className="bg-slate-50 border-t border-slate-100 p-3 text-center text-xs text-blue-600 font-bold hover:bg-slate-100/50 transition-colors">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-blue-500" />
                    <span>Buka Detail Project & Panel</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW LAYOUT */
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-semibold">Nama PT / Perusahaan</th>
                  <th className="p-4 font-semibold text-center">Status Approval</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrawings.map((drawing) => {
                  return (
                    <tr key={drawing.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-800 font-sans">
                          {drawing.customerName}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded px-2.5 py-1 text-[9px] ${
                          drawing.status === 'Approved'
                            ? 'bg-emerald-55 text-emerald-700'
                            : drawing.status === 'Pending Approval'
                            ? 'bg-amber-55 text-amber-700'
                            : 'bg-rose-55 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            drawing.status === 'Approved' ? 'bg-emerald-500' : drawing.status === 'Pending Approval' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          {drawing.status === 'Approved' ? 'PROYEK DIMULAI (ACC)' : drawing.status}
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onSelectDrawing(drawing)}
                          className="p-1.5 px-3 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold text-slate-705 transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Detail Project</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
