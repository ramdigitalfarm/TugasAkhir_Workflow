import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Users, 
  Bell, 
  User as UserIcon, 
  ShieldAlert, 
  Layers,
  Smartphone,
  Laptop,
  X
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSwitchUser,
  unreadCount,
  onOpenNotifications,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Monitor Dashboard', icon: LayoutDashboard },
    { id: 'drawings', label: 'Shop Drawings (Panel)', icon: FileText },
    { id: 'audit-logs', label: 'Audit Trail Kepala', icon: History },
    ...(currentUser.role === 'Administrator' ? [{ id: 'users', label: 'Kelola Staff & Akun', icon: Users }] : []),
  ];

  return (
    <>
      {/* Mobile Back-drop overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden" 
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 transition-transform duration-300 md:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950 shadow-md">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-sm leading-tight tracking-tight text-white">
                Sistem Panel Listrik
              </h1>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase mt-0.5">
                • ISO-Revision Control •
              </p>
            </div>
          </div>
          {isOpenMobile && onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-white md:hidden hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Demo Switcher Quick Bar - Extremely useful in the workspace */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-amber-500 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> AKUN SIMULATOR
            </span>
            <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
              Ganti Akses
            </span>
          </div>
          <select
            value={currentUser.id}
            onChange={(e) => {
              onSwitchUser(e.target.value);
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-md py-1.5 px-2 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.role === 'Kepala Divisi' ? `KABAG ${u.division}` : u.role})
              </option>
            ))}
          </select>
          <p className="text-[9px] text-slate-400 mt-1 pl-0.5 italic">
            Sesuaikan user simulasi untuk approval, input, atau update progress.
          </p>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Real-time notification Bell shortcut in side rail */}
          <button
            onClick={() => {
              onOpenNotifications();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 shrink-0 text-amber-500" />
              <span>Notifikasi Realtime</span>
            </div>
            {unreadCount > 0 ? (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                {unreadCount}
              </span>
            ) : (
              <span className="text-xs text-slate-500">0</span>
            )}
          </button>
        </div>

        {/* Current Logged User Summary Card */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg border border-slate-800">
            <div className="p-2 bg-slate-800 rounded text-amber-500 shrink-0">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-none">
                {currentUser.fullName}
              </p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate uppercase">
                {currentUser.role === 'Kepala Divisi' ? `Kepala Bagian` : currentUser.role}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[9px] font-semibold bg-slate-800 text-amber-400 px-1 py-0.5 rounded leading-none border border-slate-700">
                  Div: {currentUser.division}
                </span>
              </div>
            </div>
          </div>

          {/* Micro PWA installation & status tags */}
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ISO-9001 Panel
            </span>
            <span className="flex items-center gap-0.5">
              <Smartphone className="h-3 w-3 inline" /> LAYOUT HP OK
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
