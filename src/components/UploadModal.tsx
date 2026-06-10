/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  AlertTriangle, 
  Plus, 
  Loader2, 
  CheckSquare, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { User, UserDivision, Drawing } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAddDrawing: (drawingData: any) => Promise<boolean>;
  onAddRevision: (drawingId: string, revisionData: any) => Promise<boolean>;
  existingDrawings: Drawing[];
  uploadTargetDrawingId?: string; // If present, uploading a REVISION. Else, a NEW DRAWING.
}

export default function UploadModal({
  isOpen,
  onClose,
  currentUser,
  onAddDrawing,
  onAddRevision,
  existingDrawings,
  uploadTargetDrawingId,
}: UploadModalProps) {
  // Mode detection
  const isRevisionMode = !!uploadTargetDrawingId;
  const targetDrawing = existingDrawings.find((d) => d.id === uploadTargetDrawingId);

  // Form states
  const [breakdownNumber, setBreakdownNumber] = useState('');
  const [projectName, setProjectName] = useState(targetDrawing?.projectName || 'Cikarang Warehouse Extension - Phase 2');
  const [description, setDescription] = useState('');
  
  // Custom states for Electrical Panel Distribusi
  const [customerPrefix, setCustomerPrefix] = useState<'PT' | 'CV'>('PT');
  const [customerBaseName, setCustomerBaseName] = useState('');
  const [panels, setPanels] = useState<{ id: string; name: string; quantity: number }[]>([
    { id: 'p-1', name: 'Unit Panel', quantity: 1 }
  ]);

  // Simulated File upload states
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const ALL_DIVISIONS: UserDivision[] = [
    'Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control', 'Ekspedisi'
  ];

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      });
    }
  };

  const addPanel = () => {
    setPanels([...panels, { id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: '', quantity: 1 }]);
  };

  const removePanel = (id: string) => {
    if (panels.length > 1) {
      setPanels(panels.filter((p) => p.id !== id));
    }
  };

  const updatePanel = (id: string, name: string, quantity: number) => {
    setPanels(
      panels.map((p) => (p.id === id ? { ...p, name, quantity } : p))
    );
  };

  // Submit Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedFile) {
      setErrorMessage('Harap unggah atau pilih minimal 1 file gambar PDF/CAD.');
      return;
    }

    if (!isRevisionMode) {
      if (!breakdownNumber.trim()) {
        setErrorMessage('Nomor breakdown (QT) tidak boleh kosong.');
        return;
      }
      if (!customerBaseName.trim()) {
        setErrorMessage('Nama customer (PT atau CV) harus diisi.');
        return;
      }
    }

    // Trigger visual progress loading bar to look 100% immersive
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        setUploadProgress(100);
        clearInterval(interval);
        
        // Finalize state submission
        submitData();
      } else {
        setUploadProgress(progress);
      }
    }, 150);

    const submitData = async () => {
      try {
        let success = false;
        
        if (isRevisionMode && targetDrawing) {
          success = await onAddRevision(targetDrawing.id, {
            description,
            uploadedBy: currentUser.fullName,
            userId: currentUser.id,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
          });
        } else {
          const autoDrawingNumber = `SD-${breakdownNumber.trim().toUpperCase()}`;
          const autoTitle = selectedFile.name.replace(/\.[^/.]+$/, ""); // Use uploaded filename as the title representation

          const defaultDivisions: UserDivision[] = [
            'Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control', 'Ekspedisi'
          ];

          success = await onAddDrawing({
            drawingNumber: autoDrawingNumber,
            title: autoTitle,
            projectName,
            breakdownNumber: breakdownNumber.trim().toUpperCase(),
            customerName: `${customerPrefix}. ${customerBaseName.trim()}`,
            panels: panels.map((p) => ({
              id: p.id,
              name: p.name || 'Unit Panel',
              quantity: p.quantity,
              phase: 'Original'
            })),
            description,
            affectedDivisions: defaultDivisions,
            uploadedBy: currentUser.fullName,
            userId: currentUser.id,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
          });
        }

        setIsUploading(false);
        if (success) {
          setIsSuccess(true);
        } else {
          setErrorMessage('Terjadi kesalahan pengunggahan. Kode drawing kemungkinan sudah terdaftar.');
        }
      } catch (err: any) {
        setIsUploading(false);
        setErrorMessage(err.message || 'Failed to submit form data.');
      }
    };
  };

  const resetAndClose = () => {
    setBreakdownNumber('');
    setCustomerBaseName('');
    setPanels([{ id: 'p-1', name: 'Unit Panel', quantity: 1 }]);
    setDescription('');
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsSuccess(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Absolute Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={resetAndClose} />

      {/* Main Form container */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col justify-between max-h-[90vh]">
        {/* Header line */}
        <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center text-left">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-blue-600 font-bold">
              Engineering Workspace
            </span>
            <h3 className="font-display font-semibold text-slate-900 text-base mt-0.5">
              {isRevisionMode 
                ? `Upload Revisi Terbaru untuk ${targetDrawing?.drawingNumber}`
                : 'Registrasi & Distribusi Gambar Baru'
              }
            </h3>
          </div>
          <button 
            onClick={resetAndClose}
            className="p-1 px-2.5 bg-slate-100 rounded hover:bg-slate-200 transition text-slate-500 hover:text-slate-800 cursor-pointer text-xs"
          >
            <X className="h-4 w-4 inline mr-1" /> Close
          </button>
        </div>

        {isSuccess ? (
          /* SUCCESS FEEDBACK LAYOUT */
          <div className="p-8 text-center space-y-4 my-auto flex flex-col justify-center items-center">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h4 className="font-display font-bold text-slate-800 text-base">
              Rilis Drawing Berhasil Dipublikasikan!
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {isRevisionMode
                ? `Pembaruan revisi untuk gambar ${targetDrawing?.drawingNumber} telah dimasukkan ke daftar tinjauan approval. Seluruh kepala divisi terkait akan menerima notifikasi pendaftaran ini.`
                : 'Pendaftaran shop drawing konstruksi Anda berhasil diproses. Gambar awal memasuki antrian approval terpusat untuk divalidasi oleh Kepala Divisi.'
              }
            </p>
            <button
              onClick={resetAndClose}
              className="mt-4 px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Kembali ke Panel Gambar
            </button>
          </div>
        ) : (
          /* EDITING / INPUT FORM */
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-left flex-1">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex gap-2 text-rose-800 text-xs font-semibold">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Simulated Drag & Drop File Upload field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                1. Dokumen Drawing File (PDF / CAD Model) *
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                  isDragOver 
                    ? 'border-blue-600 bg-blue-50/20' 
                    : selectedFile 
                    ? 'border-emerald-300 bg-emerald-50/10' 
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
                }`}
              >
                {isUploading ? (
                  <div className="py-2 space-y-3">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                    <div className="max-w-xs mx-auto">
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono mb-1">
                        <span>Uploading drawing file...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border">
                    <div className="flex items-center gap-2.5 text-left min-w-0">
                      <FileText className="h-8 w-8 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{selectedFile.size} • PDF Drawing format</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-xs text-rose-500 hover:underline px-2.5 py-1 bg-white border border-rose-100 rounded hover:bg-rose-50"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                    <div className="text-xs text-slate-500">
                      <label className="text-blue-600 font-semibold hover:underline cursor-pointer">
                        Klik disini untuk memilih file
                        <input
                          type="file"
                          accept=".pdf,.dwg,.dxf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      <span> atau seret & jatuhkan file PDF konstruksi Anda di area ini.</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Maksimal ukuran file: 25MB (PDF/DWG disetujui)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawing Metadata fields: Breakdown Number (QT) (Only for completely new files) */}
            {!isRevisionMode ? (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                  2. Nomor Breakdown (QT) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: QT-2026-0043"
                  value={breakdownNumber}
                  onChange={(e) => setBreakdownNumber(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono uppercase font-bold text-slate-800"
                />
              </div>
            ) : null}

            {/* General Description notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                  {isRevisionMode ? '2. Proyek' : '3. Nama Proyek *'}
                </label>
                <input
                  type="text"
                  required
                  disabled={isRevisionMode}
                  placeholder="Nama Project konstruksi asal"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border rounded-lg disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                  {isRevisionMode ? '3. Pengunggah (Uploader)' : '4. Engineer Pengirim'}
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.fullName} (${currentUser.role})`}
                  className="w-full text-slate-400 text-xs px-3.5 py-2 border rounded-lg bg-slate-100"
                />
              </div>
            </div>

            {/* Custom fields for electrical distribution panel business (only on new drawing registration) */}
            {!isRevisionMode ? (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                  Customer & Variasi Panel Distribusi *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* PT or CV dropdown */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[11px] text-slate-500 font-medium">Bentuk Badan Usaha</label>
                    <select
                      value={customerPrefix}
                      onChange={(e) => setCustomerPrefix(e.target.value as 'PT' | 'CV')}
                      className="w-full text-xs px-3.5 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="PT">PT (Perseroan Terbatas)</option>
                      <option value="CV">CV (Commanditaire Vennootschap)</option>
                    </select>
                  </div>
                  {/* Customer Corporate Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] text-slate-500 font-medium">Nama Perusahaan Customer *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Krakatau Steel Tbk"
                      value={customerBaseName}
                      onChange={(e) => setCustomerBaseName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Micro Panels array builder showing simple Quantity without complex specifications */}
                <div className="space-y-3 bg-slate-50 p-4.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                      <span>✦ Kuantitas Unit Panel</span>
                    </span>
                    <button
                      type="button"
                      onClick={addPanel}
                      className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Unit
                    </button>
                  </div>

                  <div className="space-y-2">
                    {panels.map((p, index) => (
                      <div key={p.id} className="flex gap-2.5 items-center bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-700">Unit Panel {index + 1}</span>
                        </div>
                        <div className="w-32 flex items-center gap-2">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Jumlah:</label>
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="Jumlah"
                            value={p.quantity}
                            onChange={(e) => updatePanel(p.id, p.name || 'Unit Panel', parseInt(e.target.value, 10) || 1)}
                            className="w-full text-xs px-3 py-1.5 border rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-mono font-bold"
                          />
                        </div>
                        {panels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePanel(p.id)}
                            className="p-1 px-2 text-rose-500 hover:text-white rounded-lg hover:bg-rose-500 border border-slate-200 hover:border-rose-500 cursor-pointer transition-all"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    * Spesifikasi tipe/spek panel dapat ditulis langsung pada catatan deskripsi s/d catatan riwayat revisi.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Description Text Box notes field */}
            <div className="space-y-1.5 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                {isRevisionMode ? '4. Catatan Riwayat Revisi *' : '5. Catatan Deskripsi Proyek & Spesifikasi *'}
              </label>
              <textarea
                rows={3}
                required
                placeholder={isRevisionMode 
                  ? 'Contoh: Perubahan ketebalan gully plate penampung limpahan air hujan setinggi 12cm berdasar as Built lapangan...'
                  : 'Sebutkan detail isi rancangan dasar, bagian konstruksi terkait, detail sambungan khusus, serta spesifikasi panel unit jika ada...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3.5 py-2 border bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg text-slate-800"
              />
            </div>

            {/* Footer buttons row */}
            <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4.5 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 transition cursor-pointer"
              >
                Publikasikan Sekarang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
