/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  Calendar, 
  User as UserIcon, 
  Layers, 
  MessageSquare, 
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldAlert,
  Plus,
  Loader2,
  CheckCircle as CheckCircle2
} from 'lucide-react';
import { Drawing, User, Revision, DrawingStatus } from '../types';

interface DrawingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: Drawing | null;
  currentUser: User;
  onReviewRevision: (drawingId: string, revisionId: string, status: 'Approved' | 'Rejected', comments: string) => Promise<boolean>;
  onTriggerUploadRevision: (drawingId: string) => void;
  onUpdateDivisionProgress?: (drawingId: string, division: string, status: string, notes: string) => Promise<boolean>;
  onAddPanel?: (drawingId: string, name: string, quantity: number, phase: string) => Promise<boolean>;
  onUploadAsbuiltQc?: (drawingId: string, fileName: string, fileSize: string, description: string) => Promise<boolean>;
  onReviewAsbuiltQc?: (drawingId: string, asbuiltId: string, status: 'Approved' | 'Rejected', comments: string) => Promise<boolean>;
}

export default function DrawingDetailModal({
  isOpen,
  onClose,
  drawing,
  currentUser,
  onReviewRevision,
  onTriggerUploadRevision,
  onUpdateDivisionProgress,
  onAddPanel,
  onUploadAsbuiltQc,
  onReviewAsbuiltQc,
}: DrawingDetailModalProps) {
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  // States for adding panel option (re-modeled like standard file/drawing uploader)
  const [newPanelName, setNewPanelName] = useState('');
  const [newPanelQty, setNewPanelQty] = useState(1);
  const [isAddingPanel, setIsAddingPanel] = useState(false);
  const [panelFile, setPanelFile] = useState<File | null>(null);
  const [panelUploadProgress, setPanelUploadProgress] = useState(0);
  const [draggingPanelFile, setDraggingPanelFile] = useState(false);

  const handlePanelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPanelFile(file);
      // Auto fill name if empty or standard
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      setNewPanelName(`Panel ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`);
    }
  };

  const handlePanelDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingPanelFile(true);
  };

  const handlePanelDragLeave = () => {
    setDraggingPanelFile(false);
  };

  const handlePanelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingPanelFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setPanelFile(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      setNewPanelName(`Panel ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`);
    }
  };

  const handleAddPanelUpload = async () => {
    if (!newPanelName.trim() || !onAddPanel || !drawing) return;
    setIsAddingPanel(true);
    setPanelUploadProgress(10);
    
    // Smooth simulated upload progress interval
    const interval = setInterval(() => {
      setPanelUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 100);

    const displayName = panelFile 
      ? `${newPanelName} [Drawing: ${panelFile.name}]`
      : newPanelName;

    const success = await onAddPanel(drawing.id, displayName, newPanelQty, 'Additional');
    
    clearInterval(interval);
    if (success) {
      setPanelUploadProgress(100);
      setTimeout(() => {
        setNewPanelName('');
        setNewPanelQty(1);
        setPanelFile(null);
        setPanelUploadProgress(0);
        setIsAddingPanel(false);
      }, 500);
    } else {
      setPanelUploadProgress(0);
      setIsAddingPanel(false);
    }
  };

  // States for Asbuilt QC Drawing upload
  const [qcFileName, setQcFileName] = useState('');
  const [qcDescription, setQcDescription] = useState('');
  const [isUploadingQc, setIsUploadingQc] = useState(false);
  const [qcReviewComments, setQcReviewComments] = useState('');
  const [qcReviewError, setQcReviewError] = useState('');

  // Local state for Department Progress status update
  const [selectedUpdateDiv, setSelectedUpdateDiv] = useState<string>('');
  const [selectedUpdateStatus, setSelectedUpdateStatus] = useState<string>('Selesai Diproses');
  const [updateNotes, setUpdateNotes] = useState<string>('');

  // Local state to keep track of expanded panel inside the project
  const [expandedPanelId, setExpandedPanelId] = useState<string | null>(null);

  React.useEffect(() => {
    if (drawing) {
      const initialDiv = currentUser.division !== 'All'
        ? currentUser.division
        : drawing.affectedDivisions[0] || '';
      setSelectedUpdateDiv(initialDiv);
      setExpandedPanelId(null); // Close active subpanel when switching drawing
    }
  }, [drawing, currentUser]);

  const handleProgressUpdate = async () => {
    if (!drawing || !onUpdateDivisionProgress || !selectedUpdateDiv) return;
    const success = await onUpdateDivisionProgress(
      drawing.id,
      selectedUpdateDiv as any,
      selectedUpdateStatus as any,
      updateNotes
    );
    if (success) {
      setUpdateNotes('');
    }
  };

  if (!isOpen || !drawing) return null;

  // Find any revision that requires review (Pending Approval)
  const pendingRevision = drawing.revisions.find((r) => r.status === 'Pending Approval');
  
  // Decides if user is authorized to perform approval:
  // Requirements state: hanya kepala bagian (Kepala Divisi) yang bisa approve gambar!
  const canReview = currentUser.role === 'Kepala Divisi' && !!pendingRevision;

  // Reverse revisions list to show latest at top
  const sortedRevisions = [...drawing.revisions].reverse();

  // Handle simulated file download click
  const handleDownloadFile = (revision: Revision) => {
    setDownloadSuccessMessage(`[UNDUH BERHASIL] File "${revision.fileName}" (${revision.fileSize}) sedang diunduh ke direktori komputer lokal Anda.`);
    setTimeout(() => {
      setDownloadSuccessMessage('');
    }, 4000);
  };

  // Handle Approve/Reject Review
  const handleReviewSubmit = async (status: 'Approved' | 'Rejected') => {
    if (!pendingRevision) return;
    setReviewError('');

    if (status === 'Rejected' && !reviewComments.trim()) {
      setReviewError('Harap berikan catatan alasan penolakan revisi gambar.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const success = await onReviewRevision(
        drawing.id, 
        pendingRevision.id, 
        status, 
        reviewComments
      );
      setIsSubmittingReview(false);
      if (success) {
        setReviewComments('');
      } else {
        setReviewError('Gagal mengirimkan keputusan review.');
      }
    } catch (err: any) {
      setIsSubmittingReview(false);
      setReviewError(err.message || 'Error submitting review.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Absolute Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Main card box content */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col justify-between max-h-[90vh]">
        {/* Header toolbar */}
        <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                Code: {drawing.drawingNumber}
              </span>
              <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                drawing.status === 'Approved' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : drawing.status === 'Pending Approval'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {drawing.status}
              </span>
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-base mt-2 truncate" title={drawing.title}>
              Detail Project: {drawing.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer text-xs shrink-0 font-bold"
          >
            <X className="h-4 w-4 inline mr-1" /> Tutup
          </button>
        </div>

        {/* Content detail form */}
        <div className="p-6 overflow-y-auto space-y-6 text-left flex-1 bg-white">
          {downloadSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}

          {/* Top-level Metadata Section strictly showing PT, Project, Breakdown QT, and Last Revision */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* 1. Nama PT */}
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Nama PT</span>
              <span className="text-xs font-bold text-slate-900 block">{drawing.customerName}</span>
            </div>
            
            {/* 2. Breakdown Number (QT) */}
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">No. Breakdown (QT)</span>
              <span className="text-xs font-bold text-indigo-700 block font-mono">
                {drawing.breakdownNumber || 'QT-NOT-DEFINED'}
              </span>
            </div>

            {/* 3. Project */}
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Project</span>
              <span className="text-xs font-semibold text-slate-800 block truncate" title={drawing.projectName}>{drawing.projectName}</span>
            </div>

            {/* 4. Last Revision */}
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Last Revision</span>
              {drawing.revisions && drawing.revisions.length > 0 ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-mono">
                    {drawing.revisions[drawing.revisions.length - 1].revisionCode}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(drawing.revisions[drawing.revisions.length - 1].uploadedAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              ) : (
                <span className="text-xs italic text-slate-400 block">Belum ada</span>
              )}
            </div>
          </div>

          {/* Description summary */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 block">Keterangan / Deskripsi Project</span>
            <p className="text-xs text-slate-600 bg-slate-50/40 p-3 rounded-lg border border-slate-100 italic leading-relaxed">
              "{drawing.description || 'Tidak ada spesifikasi deskripsi khusus untuk rancangan proyek ini.'}"
            </p>
          </div>

          {/* Collapsible List of Panels in Project */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-indigo-650" />
                <span>DAFTAR PRODUK PANEL DI PROJECT ({drawing.panels?.length || 0})</span>
              </h4>
              <span className="text-[9px] font-mono font-semibold bg-slate-150 text-slate-600 px-2 py-0.5 rounded">
                Klik panel untuk input progress & history revisi
              </span>
            </div>

            {/* Collapsible List Container */}
            <div className="space-y-3">
              {drawing.panels && drawing.panels.length > 0 ? (
                drawing.panels.map((panel) => {
                  const isExpanded = expandedPanelId === panel.id;
                  
                  return (
                    <div 
                      key={panel.id} 
                      className={`border rounded-xl transition-all overflow-hidden ${
                        isExpanded 
                          ? 'border-indigo-300 ring-2 ring-indigo-50/50 bg-white' 
                          : 'border-slate-200 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Accordion header trigger */}
                      <button
                        type="button"
                        onClick={() => setExpandedPanelId(isExpanded ? null : panel.id)}
                        className="w-full p-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {panel.quantity}x
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-sm font-bold text-slate-900 truncate">{panel.name}</h5>
                              <span className={`text-[9.5px]/none font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block ${
                                !panel.phase || panel.phase === 'Original'
                                  ? 'bg-slate-100 text-white bg-slate-500'
                                  : 'bg-indigo-600 text-white'
                              }`}>
                                {(!panel.phase || panel.phase === 'Original') ? 'Fase Orisinil' : 'Fase Panel Tambahan / Baru'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">Log kerja panel, monitoring keabsahan gambar, & input progress harian.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md font-mono transition-colors ${
                            isExpanded ? 'bg-indigo-100 text-indigo-750 font-bold' : 'bg-slate-200/85 text-slate-700 hover:bg-slate-250'
                          }`}>
                            {isExpanded ? 'Tutup Detail ▲' : 'Buka Detail ▼'}
                          </span>
                        </div>
                      </button>

                      {/* Collapsible section body */}
                      {isExpanded && (
                        <div className="border-t border-slate-150 bg-white p-5 space-y-6 animate-fade-in text-left">
                          
                          {/* Part 1: Status (Approve, Pending, Ditolak) */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Status Verifikasi Kelayakan Gambar</span>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded border mt-1 uppercase font-mono ${
                                  drawing.status === 'Approved' 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
                                    : drawing.status === 'Pending Approval'
                                    ? 'bg-amber-50 text-amber-800 border-amber-250 animate-pulse'
                                    : 'bg-rose-50 text-rose-805 border-rose-250'
                                }`}>
                                  <span className={`w-2 h-2 rounded-full ${
                                    drawing.status === 'Approved' ? 'bg-emerald-500' :
                                    drawing.status === 'Pending Approval' ? 'bg-amber-500' :
                                    'bg-rose-500'
                                  }`} />
                                  <span>{drawing.status === 'Approved' ? 'APPROVE / SIAP PRODUKSI' : drawing.status === 'Pending Approval' ? 'PENDING / VERIFIKASI' : 'REJECTED / DITOLAK'}</span>
                                </span>
                              </div>
                              
                              <div className="sm:text-right">
                                <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Rilis Rujukan Lapangan</span>
                                <span className="text-xs font-bold text-slate-800 block mt-1">
                                  {drawing.latestApprovedRevisionCode ? (
                                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                                      {drawing.latestApprovedRevisionCode} SILABUS KERJA
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic font-medium">Belum ada rilis disetujui</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Verification form action for Kepala Divisi / Approver */}
                            {canReview ? (
                              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-3 text-left">
                                <div className="flex items-center gap-1.5 text-amber-905 font-extrabold text-[11px] uppercase">
                                  <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                                  <span>Konfirmasi Tinjauan & Penilaian Gambar ({pendingRevision.revisionCode})</span>
                                </div>
                                <p className="text-[11px] text-amber-705 leading-normal">
                                  Anda memiliki akses peninjauan gambar selaku Kepala Divisi. Masukkan instruksi operasional untuk perakitan panel di bawah ini:
                                </p>
                                
                                {reviewError && (
                                  <p className="text-xs text-rose-600 font-bold bg-white p-2 border border-rose-100 rounded">
                                    {reviewError}
                                  </p>
                                )}

                                <div className="space-y-1">
                                  <textarea
                                    rows={2}
                                    placeholder="Tulis instruksi pembesian, plat enclosure, wiring, atau alasan penolakan..."
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    className="w-full text-xs px-3.5 py-2 border bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg text-slate-800 font-medium"
                                  />
                                </div>

                                <div className="flex gap-2.5">
                                  <button
                                    type="button"
                                    disabled={isSubmittingReview}
                                    onClick={() => handleReviewSubmit('Rejected')}
                                    className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer flex-1"
                                  >
                                    TOLAK & AJUKAN EDIT REVISI
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSubmittingReview}
                                    onClick={() => handleReviewSubmit('Approved')}
                                    className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer flex-1"
                                  >
                                    STAMP APPROVE & RILIS LAPANGAN
                                  </button>
                                </div>
                              </div>
                            ) : pendingRevision ? (
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5 text-left">
                                <Clock className="text-amber-600 h-4.5 w-4.5 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-amber-805">
                                    Menunggu Verifikasi & Stamp Disetujui ({pendingRevision.revisionCode})
                                  </p>
                                  <p className="text-[10px] text-amber-700/90 mt-0.5 leading-relaxed">
                                    File gambar revisi terbaru {pendingRevision.revisionCode} telah dikirim oleh {pendingRevision.uploadedBy} dan sedang masuk dalam antrean approval Kepala Bagian. Divisi lapangan harap menunggu rilis disetujui.
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </div>

                          {/* Part 2: Input Progress & Catatan Log */}
                          <div className="space-y-3 pt-4 border-t border-slate-100">
                            <h6 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              MONITORING PROGRESS divisi & CATATAN LOG LAPANGAN
                            </h6>

                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-mono text-[9px] uppercase font-bold">
                                    <th className="p-2.5">Divisi</th>
                                    <th className="p-2.5">Status Alur Kerja</th>
                                    <th className="p-2.5">Penyerah / PIC</th>
                                    <th className="p-2.5">Catatan Log Kerja</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-150 bg-white">
                                  {drawing.affectedDivisions.map((div) => {
                                    const proc = (drawing.divisionProcesses || []).find((p) => p.division === div) || {
                                      division: div,
                                      status: 'Belum Diproses' as const,
                                      updatedBy: '-',
                                      updatedAt: '-',
                                      notes: '-'
                                    };

                                    const statusColors: Record<string, string> = {
                                      'Belum Diproses': 'bg-slate-100 text-slate-600 border-slate-200',
                                      'Sedang Diproses': 'bg-blue-550/10 text-blue-700 border-blue-200',
                                      'Antisipasi Revisi': 'bg-amber-50 text-amber-805 border-amber-200',
                                      'Selesai Diproses': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                      'Menunggu Revisi': 'bg-rose-50 text-rose-700 border-rose-200',
                                      'Dalam Revisi': 'bg-purple-50 text-purple-700 border-purple-200'
                                    };

                                    return (
                                      <tr key={div} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-2.5 font-extrabold uppercase text-slate-800 text-[11px]">
                                          <span>{div}</span>
                                          {currentUser.division === div && (
                                            <span className="ml-1.5 px-1.5 bg-indigo-100 text-indigo-750 text-[8px] font-bold rounded">
                                              Anda
                                            </span>
                                          )}
                                        </td>
                                        <td className="p-2.5">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[proc.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {proc.status}
                                          </span>
                                        </td>
                                        <td className="p-2.5 font-semibold text-slate-700 text-[11px]">{proc.updatedBy}</td>
                                        <td className="p-2.5 text-slate-600 whitespace-normal leading-relaxed text-[11px] font-medium max-w-[250px]">
                                          {proc.notes || '-'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Update log/progress values if qualified role */}
                            {onUpdateDivisionProgress && (currentUser.role === 'Kepala Divisi' || currentUser.role === 'Engineering') && (
                              <div className="bg-indigo-50/45 border border-indigo-150 p-4 rounded-xl space-y-3 mt-1 text-left">
                                <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs uppercase">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                                  <span>INPUT PROGRESS KERJA LAPANGAN & CATATAN LOG</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {/* Division targeted selector */}
                                  <div>
                                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Target Divisi Anda</label>
                                    <select
                                      value={selectedUpdateDiv}
                                      onChange={(e) => setSelectedUpdateDiv(e.target.value)}
                                      disabled={currentUser.division !== 'All'}
                                      className="w-full text-xs px-2.5 py-1.5 border rounded-lg bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                                    >
                                      {currentUser.division !== 'All' ? (
                                        <option value={currentUser.division}>{currentUser.division}</option>
                                      ) : (
                                        drawing.affectedDivisions.map((div) => (
                                          <option key={div} value={div}>{div}</option>
                                        ))
                                      )}
                                    </select>
                                  </div>

                                  {/* Select workflow status */}
                                  <div>
                                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Status Alur Kerja Lapangan</label>
                                    <select
                                      value={selectedUpdateStatus}
                                      onChange={(e) => setSelectedUpdateStatus(e.target.value)}
                                      className="w-full text-xs px-2.5 py-1.5 border rounded-lg bg-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      <option value="Belum Diproses">Belum Diproses</option>
                                      <option value="Sedang Diproses">Sedang Diproses</option>
                                      <option value="Selesai Diproses">Selesai Diproses</option>
                                      <option value="Antisipasi Revisi">Antisipasi Revisi</option>
                                      <option value="Menunggu Revisi">Menunggu Revisi</option>
                                      <option value="Dalam Revisi">Dalam Revisi</option>
                                    </select>
                                  </div>

                                  <div className="flex items-end">
                                    <button
                                      type="button"
                                      onClick={handleProgressUpdate}
                                      className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center gap-1 h-[34px]"
                                    >
                                      <span>Simpan Progress</span>
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Catatan Log Kerja Lapangan</label>
                                  <input
                                    type="text"
                                    placeholder="Contoh: MDP unit wiring busbar sudah 100% lulus, siap diuji kubikel..."
                                    value={updateNotes}
                                    onChange={(e) => setUpdateNotes(e.target.value)}
                                    className="w-full text-xs px-3 py-1.5 border rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Part 3: History & Unduh PDF */}
                          <div className="space-y-3.5 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <span>HISTORI FILE REVISI & UNDUH PDF ({drawing.revisions.length} VERSI)</span>
                              </span>
                              {currentUser.role === 'Engineering' && !pendingRevision && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onTriggerUploadRevision(drawing.id);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-50/50 hover:bg-blue-100 text-blue-600 border border-blue-150 rounded-md text-[10px] font-extrabold cursor-pointer transition-all"
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                  <span>KIRIM REVISI BARU</span>
                                </button>
                              )}
                            </div>

                            <div className="space-y-3 relative border-l border-slate-150 pl-3.5 ml-2.5 pt-1 text-left">
                              {sortedRevisions.map((rev, idx) => {
                                const isLatest = idx === 0;
                                return (
                                  <div key={rev.id} className="relative space-y-1.5">
                                    <span className={`absolute -left-[19.5px] top-1.5 w-2 h-2 rounded-full border border-white ${
                                      rev.status === 'Approved' ? 'bg-emerald-500' :
                                      rev.status === 'Pending Approval' ? 'bg-amber-500' :
                                      'bg-rose-500'
                                    }`} />

                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                          {rev.revisionCode}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          {new Date(rev.uploadedAt).toLocaleString('id-ID')}
                                        </span>
                                        {isLatest && (
                                          <span className="text-[8px] font-extrabold bg-blue-500 text-white px-1 leading-none py-0.5 rounded uppercase">
                                            AKTIF
                                          </span>
                                        )}
                                      </div>

                                      <span className={`text-[9.5px] font-mono font-bold uppercase px-1.5 rounded leading-none py-0.5 ${
                                        rev.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                                        rev.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                                        'bg-rose-50 text-rose-700 border border-rose-150'
                                      }`}>
                                        {rev.status}
                                      </span>
                                    </div>

                                    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-150 space-y-1.5 text-xs">
                                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                        <span className="text-slate-600 block text-[11px] font-mono truncate">
                                          File: <strong className="underline text-slate-800 font-mono">{rev.fileName}</strong> ({rev.fileSize})
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleDownloadFile(rev)}
                                          className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer text-[10px] font-extrabold text-slate-600 shadow-xs"
                                        >
                                          <Download className="h-3.5 w-3.5 text-slate-400" /> 
                                          <span>Unduh PDF</span>
                                        </button>
                                      </div>

                                      <p className="text-[11px] text-slate-600 leading-relaxed italic bg-white/60 p-2 border border-slate-100 rounded">
                                        "{rev.description || 'Tidak ada catatan revisi.'}"
                                      </p>

                                      {rev.comments && (
                                        <div className="mt-1 bg-slate-100/60 p-2 rounded-lg text-[10.5px] leading-normal text-slate-705 border-l-2 border-slate-300 text-left">
                                          <strong className="block text-[9px] uppercase tracking-wider text-slate-400">Catatan Reviewer:</strong>
                                          <span>{rev.comments}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-450 italic text-xs">
                  Belum ada variasi produk panel terdaftar.
                </div>
              )}
            </div>

            {/* Opsi Tambah Panel (Jika proyek ada panel tambahan) - Berbentuk seperti upload gambar panel */}
            <div className="bg-gradient-to-br from-indigo-50/40 to-slate-50 border border-indigo-200 rounded-xl p-5 mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                  <Upload className="h-4.5 w-4.5 text-indigo-600 animate-bounce" />
                  <span>Registrasi & Upload Gambar Panel Tambahan Proyek</span>
                </div>
                <span className="text-[9.5px]/none font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded uppercase">
                  Fase Tambahan
                </span>
              </div>

              {/* Interactive simulated file uploader component dropzone */}
              <div 
                onDragOver={handlePanelDragOver}
                onDragLeave={handlePanelDragLeave}
                onDrop={handlePanelDrop}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 relative ${
                  draggingPanelFile 
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
                    : panelFile 
                    ? 'border-emerald-300 bg-emerald-50/10' 
                    : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50'
                }`}
              >
                {isAddingPanel ? (
                  <div className="py-2 space-y-3">
                    <Loader2 className="h-7 w-7 text-indigo-600 animate-spin mx-auto" />
                    <div className="max-w-xs mx-auto">
                      <div className="flex justify-between text-[11px] text-indigo-750 font-mono font-bold mb-1">
                        <span>Mengirim file gambar panel...</span>
                        <span>{panelUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-150"
                          style={{ width: `${panelUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : panelFile ? (
                  <div className="flex items-center justify-between bg-emerald-50/30 p-3 rounded-lg border border-emerald-100 animate-fade-in">
                    <div className="flex items-center gap-2.5 text-left min-w-0">
                      <FileText className="h-8 w-8 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{panelFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{(panelFile.size / (1024 * 1024)).toFixed(2)} MB • PDF/DWG Layout Terpilih</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPanelFile(null);
                        setNewPanelName('');
                      }}
                      className="text-[10.5px] text-rose-600 hover:underline px-2.5 py-1 bg-white border border-rose-100 rounded-lg lg hover:bg-rose-50 font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Upload className="h-7 w-7 text-indigo-400 mx-auto" />
                    <div className="text-xs text-slate-600">
                      <label className="text-indigo-600 font-semibold hover:underline cursor-pointer flex justify-center items-center gap-1">
                         Klik di sini untuk memilih file gambar panel
                        <input
                          type="file"
                          accept=".pdf,.dwg,.dxf"
                          onChange={handlePanelFileChange}
                          className="hidden"
                        />
                      </label>
                      <span> atau seret & jatuhkan file gambar teknik ke area ini.</span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-mono">
                      Format file didukung: PDF, DWG, DXF (Max 25MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Panel Details block */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-3">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Nama / Deskripsi Unit Panel Tambahan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Panel SDP 250A Grounding Tambahan"
                    value={newPanelName}
                    onChange={(e) => setNewPanelName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>
                
                <div className="sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1 text-center">
                    Jumlah Unit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newPanelQty}
                    onChange={(e) => setNewPanelQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center font-bold font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={!newPanelName.trim() || isAddingPanel}
                  onClick={handleAddPanelUpload}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-all disabled:opacity-55 flex items-center gap-1.5 shadow-sm"
                >
                  {isAddingPanel ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Proses Tambah & Upload Panel</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * Panel tambahan beserta file gambar kustom akan terdaftar resmi di bawah list panel proyek ini dan dipisahkan sebagai **"Fase Panel Tambahan / Baru"**.
              </p>
            </div>
          </div>

          {/* AS-BUILT DRAWINGS QC (TIM QC REVISION & APPROVAL) */}
          <div className="space-y-4 pt-5 border-t border-slate-150">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-rose-600" />
                <span>DAFTAR GAMBAR ASBUILT DRAWINGS QC ({drawing.asbuiltQcDrawings?.length || 0})</span>
              </h4>
              <span className="text-[9.5px]/none font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded">
                QC REVIEW & APPROVAL NEEDED
              </span>
            </div>

            {/* List of uploaded Asbuilt Drawings QC */}
            <div className="space-y-3">
              {drawing.asbuiltQcDrawings && drawing.asbuiltQcDrawings.length > 0 ? (
                drawing.asbuiltQcDrawings.map((asbuilt) => (
                  <div key={asbuilt.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 font-mono text-[11px] underline">
                          {asbuilt.fileName}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          ({asbuilt.fileSize})
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded border ${
                          asbuilt.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          asbuilt.status === 'Pending Approval' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' :
                          'bg-rose-50 text-rose-800 border-rose-205'
                        }`}>
                          {asbuilt.status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-slate-100 text-xs">
                      <span className="font-bold text-slate-700 block text-[9.5px] uppercase mb-1">Keterangan Revisi Tim QC:</span>
                      <p className="italic text-slate-650 font-medium">"{asbuilt.description || 'Tidak ada deskripsi.'}"</p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Oleh: <strong className="text-slate-650">{asbuilt.uploadedBy}</strong></span>
                        <span>•</span>
                        <span>Tanggal: {new Date(asbuilt.uploadedAt).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {asbuilt.comments && (
                      <div className="bg-slate-100 p-2.5 rounded border-l-2 border-slate-400 text-xs text-slate-700">
                        <span className="font-bold text-[9.5px] uppercase block mb-0.5">Catatan Peninjau / Persetujuan QC:</span>
                        <p className="font-medium text-slate-800">"{asbuilt.comments}"</p>
                        <div className="mt-1 text-[9px] text-slate-400 font-medium">
                          Oleh: {asbuilt.reviewedBy || '-'} ({asbuilt.reviewedAt ? new Date(asbuilt.reviewedAt).toLocaleDateString('id-ID') : '-'})
                        </div>
                      </div>
                    )}

                    {/* Review actions if Authorized: QC Div member or Kepala Divisi to approve */}
                    {asbuilt.status === 'Pending Approval' && (currentUser.division === 'Quality Control' || currentUser.role === 'Kepala Divisi') && (
                      <div className="bg-rose-50/50 p-3.5 rounded-lg border border-rose-150 space-y-3.5 text-left">
                        <label className="block text-[10.5px] font-bold uppercase text-rose-850">Evaluasi & Keputusan Persetujuan Asbuilt QC:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Tulis alasan penolakan atau instruksi persetujuan asbuilt..."
                            id={`qc-comments-${asbuilt.id}`}
                            className="bg-white text-xs px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 font-semibold flex-1"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const inputEl = document.getElementById(`qc-comments-${asbuilt.id}`) as HTMLInputElement;
                              const comm = inputEl ? inputEl.value : '';
                              if (onReviewAsbuiltQc) {
                                await onReviewAsbuiltQc(drawing.id, asbuilt.id, 'Rejected', comm);
                              }
                            }}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                          >
                            Tolak
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const inputEl = document.getElementById(`qc-comments-${asbuilt.id}`) as HTMLInputElement;
                              const comm = inputEl ? inputEl.value : '';
                              if (onReviewAsbuiltQc) {
                                await onReviewAsbuiltQc(drawing.id, asbuilt.id, 'Approved', comm);
                              }
                            }}
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs cursor-pointer"
                          >
                            Setujui
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed">
                  Belum ada dokumen gambar Asbuilt QC yang diunggah oleh Quality Control.
                </p>
              )}
            </div>

            {/* Upload form for QC staff */}
            {(currentUser.division === 'Quality Control' || currentUser.division === 'All') && (
              <div className="bg-rose-50/20 border border-rose-200/50 rounded-xl p-4 space-y-3 text-left">
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wide flex items-center gap-1">
                  <span>✦ Unggah Rilis/Revisi Asbuilt QC (Khusus Tim QC)</span>
                </span>
                
                {qcReviewError && (
                  <p className="text-rose-600 text-xs font-semibold bg-white p-2 rounded border border-rose-100">{qcReviewError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama File Hasil Revisi QC</label>
                    <input
                      type="text"
                      placeholder="Contoh: Krakatau_Asbuilt_QC_R1.pdf"
                      value={qcFileName}
                      onChange={(e) => setQcFileName(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catatan Komparasi Hasil Lapangan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Revisi posisi plat isolator tembaga agar tidak mepet pintu..."
                      value={qcDescription}
                      onChange={(e) => setQcDescription(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isUploadingQc || !qcFileName.trim()}
                    onClick={async () => {
                      setIsUploadingQc(true);
                      setQcReviewError('');
                      if (onUploadAsbuiltQc) {
                        const success = await onUploadAsbuiltQc(drawing.id, qcFileName, '3.8 MB', qcDescription);
                        if (success) {
                          setQcFileName('');
                          setQcDescription('');
                        } else {
                          setQcReviewError('Gagal melakukan pendaftaran asbuilt QC.');
                        }
                      }
                      setIsUploadingQc(false);
                    }}
                    className="px-5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5 h-[32px]"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Kirim Hasil Revisi Asbuilt QC</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
