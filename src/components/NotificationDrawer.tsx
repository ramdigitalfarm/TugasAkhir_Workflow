/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Smartphone, 
  Send, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Clock
} from 'lucide-react';
import { SystemNotification, User, UserDivision } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  currentUser: User;
  onMarkAllRead: () => void;
  onSimulateFCMNotification: (broadcastData: any) => Promise<void>;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onMarkAllRead,
  onSimulateFCMNotification,
}: NotificationDrawerProps) {
  const [fcmTitle, setFcmTitle] = useState('');
  const [fcmMessage, setFcmMessage] = useState('');
  const [fcmType, setFcmType] = useState<'info' | 'success' | 'warning' | 'alert'>('info');
  const [fcmDivision, setFcmDivision] = useState<UserDivision | 'All'>('All');
  const [isSendingFCM, setIsSendingFCM] = useState(false);
  const [showFCMSuccess, setShowFCMSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter notifications relevant to current user:
  // Show it if it affects 'All', or the user's current division, OR user's role allows seeing all.
  const isAllAccess = currentUser.role === 'Administrator' || currentUser.role === 'Engineering';
  const relevantNotifications = notifications.filter(
    (n) => isAllAccess || n.division === 'All' || n.division === currentUser.division
  );

  const DIVISIONS: UserDivision[] = [
    'Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control', 'Ekspedisi'
  ];

  const handleBroadcastFCM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fcmTitle.trim() || !fcmMessage.trim()) return;

    setIsSendingFCM(true);
    await onSimulateFCMNotification({
      title: fcmTitle,
      message: fcmMessage,
      type: fcmType,
      division: fcmDivision,
    });
    
    setIsSendingFCM(false);
    setShowFCMSuccess(true);
    setFcmTitle('');
    setFcmMessage('');
    
    setTimeout(() => {
      setShowFCMSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Absolute Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      {/* Main Drawer Frame Container */}
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 z-10 text-left">
        {/* Header Toolbar */}
        <div className="bg-slate-50 p-4 border-b border-slate-150 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded text-amber-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-950 text-sm">
                Realtime Notifikasi (FCM)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                BROADCAST CHANNELS & AUDIENCE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onMarkAllRead}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition cursor-pointer text-xs font-semibold flex items-center gap-1"
              title="Tandai semua telah dibaca"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark Read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 cursor-pointer text-xs"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notif Body List View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {relevantNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Bell className="h-8 w-8 text-slate-350 mx-auto animate-pulse" />
              <p className="text-xs font-bold text-slate-700">Tidak ada notifikasi aktif</p>
              <p className="text-[11px] max-w-xs mx-auto text-slate-400 font-medium">
                Gunakan panel emulator di bagian bawah untuk menyiarkan pesan peringatan lintas departemen.
              </p>
            </div>
          ) : (
            relevantNotifications.map((notif) => {
              // Icon matching
              const Icon = notif.type === 'success' 
                ? CheckCircle 
                : notif.type === 'warning'
                ? XCircle
                : notif.type === 'alert'
                ? AlertTriangle
                : Info;
              
              const colorClasses = notif.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : notif.type === 'warning'
                ? 'bg-rose-50 text-rose-700 border-rose-150'
                : notif.type === 'alert'
                ? 'bg-amber-50/70 text-amber-700 border-amber-150'
                : 'bg-blue-50 text-blue-700 border-blue-100';

              return (
                <div 
                  key={notif.id}
                  className={`p-3.5 border rounded-xl relative transition-all text-left ${colorClasses} ${
                    notif.isRead ? 'opacity-70 border-dashed' : 'ring-2 ring-blue-500/5 shadow-sm'
                  }`}
                >
                  <div className="flex gap-2.5">
                    <Icon className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div className="space-y-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="text-xs font-bold leading-none">{notif.title}</h4>
                        <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap">
                          {new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed font-medium">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono">
                        <span className="bg-slate-900/10 px-1.5 py-0.5 rounded uppercase font-semibold">
                          Saluran: {notif.division}
                        </span>
                        {!notif.isRead && (
                          <span className="bg-rose-500 text-white font-bold rounded-full w-1.5 h-1.5 inline-block" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Realtime FCM Broadcast Emulator Form for testing */}
        <div className="bg-slate-900 text-slate-100 border-t border-slate-800 p-4 space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] uppercase font-mono text-blue-400 font-bold flex items-center gap-1">
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" /> Firebase Cloud Messaging Emulator
            </span>
            <span className="bg-emerald-950 text-emerald-300 font-mono text-[9px] px-1 rounded-full leading-none py-0.5">
              TEST COMPLIANCE
            </span>
          </div>

          {showFCMSuccess ? (
            <div className="p-2 bg-emerald-950 border border-emerald-900 text-emerald-300 text-[11px] font-semibold rounded text-center">
              [FCM SIMULASI SUCCESS] Notifikasi berhasil dipancarkan ke websocket client!
            </div>
          ) : null}

          <form onSubmit={handleBroadcastFCM} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Saluran Divisi</label>
                <select
                  value={fcmDivision}
                  onChange={(e) => setFcmDivision(e.target.value as UserDivision | 'All')}
                  className="w-full text-[11px] bg-slate-800 text-slate-200 border border-slate-700 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">Semua Divisi (Broadcast)</option>
                  {DIVISIONS.map((div) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Alert Level</label>
                <select
                  value={fcmType}
                  onChange={(e) => setFcmType(e.target.value as any)}
                  className="w-full text-[11px] bg-slate-800 text-slate-200 border border-slate-700 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="info">Info (Biru)</option>
                  <option value="success">Success (Hijau)</option>
                  <option value="warning">Warning (Merah)</option>
                  <option value="alert">Alert (Kuning)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Judul Pesan FCM</label>
              <input
                type="text"
                required
                placeholder="Contoh: Info Urgent Dari Gudang"
                value={fcmTitle}
                onChange={(e) => setFcmTitle(e.target.value)}
                className="w-full text-xs bg-slate-800 text-slate-100 border border-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-400 font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Konten Berita</label>
              <textarea
                rows={1}
                required
                placeholder="Spesifikasi plat grid-12 goyang, dilarang rakit."
                value={fcmMessage}
                onChange={(e) => setFcmMessage(e.target.value)}
                className="w-full text-xs bg-slate-800 text-slate-100 border border-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingFCM}
              className="w-full py-2 cursor-pointer bg-blue-600 hover:bg-blue-500 hover:text-white transition rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow"
            >
              <Send className="h-3 w-3" />
              <span>Kirim Broadcast FCM Realtime</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
