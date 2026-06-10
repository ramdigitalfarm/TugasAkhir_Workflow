/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  User as UserIcon, 
  ShieldAlert, 
  Layers, 
  Laptop, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { User, Drawing, SystemNotification, AuditLog } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DrawingList from './components/DrawingList';
import UploadModal from './components/UploadModal';
import DrawingDetailModal from './components/DrawingDetailModal';
import NotificationDrawer from './components/NotificationDrawer';
import AuditLogView from './components/AuditLogView';
import UserManagement from './components/UserManagement';

export default function App() {
  // Application tabs & overlay states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetDrawingId, setUploadTargetDrawingId] = useState<string | undefined>(undefined);
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // In-memory data states fetched from the Express API Server
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Success Banner states
  const [bannerAlert, setBannerAlert] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Fetch all initial records on mount
  const fetchAllData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [usersRes, drawingsRes, notificationsRes, auditLogsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/drawings'),
        fetch('/api/notifications'),
        fetch('/api/audit-logs'),
      ]);

      const usersData = await usersRes.json();
      const drawingsData = await drawingsRes.json();
      const notificationsData = await notificationsRes.json();
      const auditLogsData = await auditLogsRes.json();

      setUsers(usersData);
      setDrawings(drawingsData);
      setNotifications(notificationsData);
      setAuditLogs(auditLogsData);

      // Set logged-in user if we haven't already
      if (usersData.length > 0 && !currentUser) {
        // Default to budi.eng for exciting primary engineering view initially, or the admin!
        const defaultUser = usersData.find((u: User) => u.username === 'budi.eng') || usersData[0];
        setCurrentUser(defaultUser);
      }

      // If a drawing is currently open in detail modal, refresh its content from the new list of drawings
      if (selectedDrawing) {
        const updated = drawingsData.find((d: Drawing) => d.id === selectedDrawing.id);
        if (updated) setSelectedDrawing(updated);
      }
    } catch (err) {
      console.error('Failure fetching data from fullstack API server:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Setup progressive polling interval (every 4.5 seconds) to simulate realtime FCM notification updates seamlessly!
    const timer = setInterval(() => {
      fetchAllData(true);
    }, 4500);

    return () => clearInterval(timer);
  }, [currentUser]);

  // Helper inside client to trigger temporary top-bar actions notification banner
  const triggerBanner = (message: string, type: 'success' | 'info' = 'success') => {
    setBannerAlert({ message, type });
    setTimeout(() => {
      setBannerAlert(null);
    }, 4000);
  };

  // Handler: Change simulated active user / role switcher
  const handleSwitchUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      triggerBanner(`Demo Mode: Berhasil beralih hak akses sebagai ${targetUser.fullName} (${targetUser.role})`, 'info');
      // If we switched away from Administrator while on Administrator tab, redirect to dashboard
      if (targetUser.role !== 'Administrator' && activeTab === 'users') {
        setActiveTab('dashboard');
      }
    }
  };

  // Handler: Add drawing from Engineering (UploadModal)
  const handleAddDrawing = async (drawingData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/drawings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drawingData),
      });

      if (res.ok) {
        await fetchAllData(true);
        triggerBanner('Shop Drawing baru berhasil diunggah & dimasukkan ke antrian review.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding drawing:', err);
      return false;
    }
  };

  // Handler: Add revision to existing drawing
  const handleAddRevision = async (drawingId: string, revisionData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/drawings/${drawingId}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revisionData),
      });

      if (res.ok) {
        await fetchAllData(true);
        triggerBanner('Revisi dokumen baru berhasil ditambahkan.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding revision:', err);
      return false;
    }
  };

  // Handler: Review revision (Approve / Reject)
  const handleReviewRevision = async (
    drawingId: string,
    revisionId: string,
    status: 'Approved' | 'Rejected',
    comments: string
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/drawings/${drawingId}/revisions/${revisionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewedBy: currentUser.fullName,
          comments,
          userId: currentUser.id,
        }),
      });

      if (res.ok) {
        await fetchAllData(true);
        triggerBanner(
          status === 'Approved'
            ? 'Persetujuan rilis gambar telah ditandatangani. Rilis divalidasi ke semua departemen!'
            : 'Revisi gambar telah ditolak dengan catatan feedback.'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error reviewing drawing:', err);
      return false;
    }
  };

  // Handler: Update division manufacturing or revision process
  const handleUpdateDivisionProgress = async (
    drawingId: string,
    division: string,
    status: string,
    notes: string
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/drawings/${drawingId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          division,
          status,
          updatedBy: currentUser.fullName,
          notes,
          userId: currentUser.id,
        }),
      });

      if (res.ok) {
        await fetchAllData(true);
        triggerBanner(`Proses divis ${division} berhasil diperbarui menjadi ${status}!`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating division progress:', err);
      return false;
    }
  };

  // Handler: Add panel to project
  const handleAddPanel = async (drawingId: string, name: string, quantity: number, phase: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/drawings/${drawingId}/add-panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity, phase }),
      });
      if (res.ok) {
        await fetchAllData(true);
        triggerBanner('Panel tambahan baru / fase tambahan berhasil ditambahkan.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding panel:', err);
      return false;
    }
  };

  // Handler: Upload asbuilt drawing from QC
  const handleUploadAsbuiltQc = async (drawingId: string, fileName: string, fileSize: string, description: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/drawings/${drawingId}/asbuilt-qc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileSize,
          description,
          uploadedBy: currentUser?.fullName || 'Quality Control Staff',
          userId: currentUser?.id,
        }),
      });
      if (res.ok) {
        await fetchAllData(true);
        triggerBanner('Gambar revisi / asbuilt QC berhasil diundgah.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error uploading asbuilt QC:', err);
      return false;
    }
  };

  // Handler: Review/Approve Asbuilt QC drawing
  const handleReviewAsbuiltQc = async (drawingId: string, asbuiltId: string, status: 'Approved' | 'Rejected', comments: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/drawings/${drawingId}/asbuilt-qc/${asbuiltId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          comments,
          reviewedBy: currentUser?.fullName || 'Quality Control Supervisor',
          userId: currentUser?.id,
        }),
      });
      if (res.ok) {
        await fetchAllData(true);
        triggerBanner(status === 'Approved' ? 'Asbuilt QC disetujui. Proses dilanjutkan!' : 'Asbuilt QC ditolak dengan catatan.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error reviewing asbuilt QC:', err);
      return false;
    }
  };

  // Handler: Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      if (res.ok) {
        await fetchAllData(true);
        triggerBanner('Semuan notifikasi ditandai telah dibaca.', 'info');
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  // Handler: Simulate dynamic FCM Push Notifications broadcast
  const handleSimulateFCMNotification = async (broadcastData: any) => {
    try {
      const res = await fetch('/api/mock-fcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastData),
      });
      if (res.ok) {
        await fetchAllData(true);
      }
    } catch (err) {
      console.error('Error simulating FCM notification:', err);
    }
  };

  // Handler: Add single user account (Administrator)
  const handleAddUser = async (userData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        await fetchAllData(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error registering new user:', err);
      return false;
    }
  };

  // Handler: Delete staff account (Administrator)
  const handleDeleteUser = async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/users/${userId}?adminUserId=${currentUser?.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchAllData(true);
        triggerBanner('Akun staff berhasil dihapus dari sistem.', 'info');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting user:', err);
      return false;
    }
  };

  // Trigger from drawing modal timeline to open revision subform
  const triggerRevisionUpload = (drawingId: string) => {
    setUploadTargetDrawingId(drawingId);
    setIsUploadOpen(true);
  };

  // Open clean new drawing upload form (resets target id so it is in new-mode)
  const triggerNewDrawingUpload = () => {
    setUploadTargetDrawingId(undefined);
    setIsUploadOpen(true);
  };

  // Aggregate unread notifications list
  const filterAccess = currentUser?.role === 'Administrator' || currentUser?.role === 'Engineering';
  const filteredNotifications = notifications.filter(
    (n) => filterAccess || n.division === 'All' || n.division === currentUser?.division
  );
  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  // Render Spinner
  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
          LOADING METADATA ENGINE...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      
      {/* 1. SIDE NAVIGATION BAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* 2. MAIN COCKPIT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* UPPER STATUS BAR */}
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-150 rounded px-2 py-0.5 uppercase tracking-wider font-mono">
              Workspace Mode
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Active Server Connection • Local State Sync
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Realtime Action Toast Banner if exists */}
            {bannerAlert && (
              <div className={`p-2 px-4 rounded-lg shadow-sm text-xs font-semibold flex items-center gap-1.5 border animate-fade-in ${
                bannerAlert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-150' : 'bg-blue-50 text-blue-800 border-blue-150'
              }`}>
                {bannerAlert.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-blue-650" />}
                <span>{bannerAlert.message}</span>
              </div>
            )}

            {/* Simulated Live status badge */}
            <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1 font-medium select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live: ISO-Revision Control
            </span>

            {/* Topbar Notification icon */}
            <button
              id="topbar-bell-notification"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition shrink-0 cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 w-2.5 h-2.5 rounded-full border border-white animate-bounce" />
              )}
            </button>
          </div>
        </header>

        {/* PAGE BODY VIEW SWITCHER */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                drawings={drawings}
                currentUser={currentUser}
                onNavigateToTab={setActiveTab}
                onOpenUpload={triggerNewDrawingUpload}
                onSelectDrawing={(drw) => {
                  setSelectedDrawing(drw);
                  setIsDetailOpen(true);
                }}
                unreadNotificationsCount={unreadCount}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                notifications={filteredNotifications}
              />
            )}

            {activeTab === 'drawings' && (
              <DrawingList
                drawings={drawings}
                currentUser={currentUser}
                onSelectDrawing={(drw) => {
                  setSelectedDrawing(drw);
                  setIsDetailOpen(true);
                }}
                onOpenUpload={triggerNewDrawingUpload}
              />
            )}

            {activeTab === 'audit-logs' && (
              <AuditLogView auditLogs={auditLogs} />
            )}

            {activeTab === 'users' && currentUser.role === 'Administrator' && (
              <UserManagement
                users={users}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </div>
        </div>
      </main>

      {/* 3. OVERLAY: SHOP DRAWING / REVISION FILE UPLOAD MODAL */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        onAddDrawing={handleAddDrawing}
        onAddRevision={handleAddRevision}
        existingDrawings={drawings}
        uploadTargetDrawingId={uploadTargetDrawingId}
      />

      {/* 4. OVERLAY: PRIMARY SHOP DRAWING DETAIL CRAD MODAL */}
      <DrawingDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        drawing={selectedDrawing}
        currentUser={currentUser}
        onReviewRevision={handleReviewRevision}
        onTriggerUploadRevision={triggerRevisionUpload}
        onUpdateDivisionProgress={handleUpdateDivisionProgress}
        onAddPanel={handleAddPanel}
        onUploadAsbuiltQc={handleUploadAsbuiltQc}
        onReviewAsbuiltQc={handleReviewAsbuiltQc}
      />

      {/* 5. OVERLAY: REAL-TIME NOTIFICATIONS SIDE DRAWER */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        currentUser={currentUser}
        onMarkAllRead={handleMarkAllRead}
        onSimulateFCMNotification={handleSimulateFCMNotification}
      />
    </div>
  );
}
