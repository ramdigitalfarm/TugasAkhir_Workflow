/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle,
  ShieldAlert,
  Sliders,
  Mail
} from 'lucide-react';
import { User, UserRole, UserDivision } from '../types';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (userData: any) => Promise<boolean>;
  onDeleteUser: (userId: string) => Promise<boolean>;
}

export default function UserManagement({
  users,
  currentUser,
  onAddUser,
  onDeleteUser,
}: UserManagementProps) {
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Divisi Operasional');
  const [division, setDivision] = useState<UserDivision>('Produksi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const DIVISIONS: UserDivision[] = [
    'Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control', 'Ekspedisi', 'All'
  ];

  const ROLES: UserRole[] = [
    'Administrator', 'Engineering', 'Kepala Divisi', 'Divisi Operasional'
  ];

  // Submit User
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Harap lengkapi seluruh isian nama dan alamat email.');
      return;
    }

    setIsSubmitting(true);
    const mockUsername = fullName.toLowerCase().trim().replace(/\s+/g, '.');

    try {
      const success = await onAddUser({
        username: mockUsername,
        fullName: fullName.trim(),
        role,
        division,
        email: email.trim(),
        adminUserId: currentUser.id,
      });

      setIsSubmitting(false);
      if (success) {
        setSuccessMsg(`User baru "${fullName}" dengan role ${role} berhasil terdaftar.`);
        setFullName('');
        setEmail('');
        setRole('Divisi Operasional');
        setDivision('Produksi');
      } else {
        setErrorMsg('Gagal menambahkan user baru. Kemungkinan username sudah didaftarkan.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error occurred.');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Administrator Anda sendiri yang sedang aktif.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus hak akses pengguna: ${userName}? \nAktivitas audit trail lama akan tetap dipertahankan.`)) {
      await onDeleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="border-b border-slate-200 pb-4 text-left">
        <h2 className="text-xl font-display font-semibold text-slate-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" /> Pengelolaan User & Kontrol Role Hak Akses
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Sebagai Administrator Utama, Anda berwenang meregistrasikan staff baru, mengubah pembagian divisi kerja, serta mengendalikan hierarki otorisasi workflow gambar konstruksi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Left column - Add New Staff User Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-display font-semibold text-slate-950 text-sm flex items-center gap-1.5">
            <UserPlus className="h-4.5 w-4.5 text-blue-600" /> Daftarkan Staff Baru *
          </h3>
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-start gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-start gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-700">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase">Nama Lengkap Staff *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Hartono"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 border bg-slate-50 border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase">Alamat Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
                <input
                  type="email"
                  required
                  placeholder="budi@system-coordination.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border bg-slate-50 border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase">Hak Akses Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase">Asal Divisi *</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value as UserDivision)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10.5px] text-slate-500 space-y-1">
              <span className="font-semibold block text-slate-600">INFORMASI USERNAME MOCK GENERATOR:</span>
              <p>Username otomatis: <strong className="font-mono text-blue-600">{fullName ? fullName.toLowerCase().trim().replace(/\s+/g, '.') : 'nama.staff'}</strong></p>
              <p>Password default: <strong className="font-mono bg-slate-200 px-1 rounded">Pass123!</strong></p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 transition cursor-pointer flex justify-center items-center shadow"
            >
              <span>Daftarkan Staff Baru</span>
            </button>
          </form>
        </div>

        {/* Right column - Registered Users list table  & Permission MATRIX */}
        <div className="lg:col-span-2 space-y-5">
          {/* User Directory Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">Daftar Aktif Pengguna Sistem ({users.length} Akun)</span>
              <span className="text-[10px] font-mono text-slate-400">DATABASE ACTIVE DIRECTORY</span>
            </div>

            <div className="overflow-x-auto max-h-[35vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider border-b">
                    <th className="p-3">Staff / Email</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Divisi</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-slate-800">{u.fullName}</p>
                          <p className="text-slate-400 text-[11px] font-mono">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-medium text-slate-600">
                        @{u.username}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 font-bold uppercase rounded text-[9px] ${
                          u.role === 'Administrator'
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : u.role === 'Engineering'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : u.role === 'Kepala Divisi'
                            ? 'bg-amber-50 text-amber-800 border border-amber-105'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-semibold text-slate-700">
                        {u.division}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(u.id, u.fullName)}
                          disabled={u.id === currentUser.id}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded disabled:opacity-30 cursor-pointer"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matrix of capabilities boundary */}
          <div className="bg-amber-50/20 border border-amber-200/50 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-blue-500" /> Matriks Aksesibilitas Proteksi Data
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px] leading-relaxed">
              <div className="bg-white p-2.5 rounded border">
                <strong className="text-purple-700 font-bold block uppercase mb-1">Administrator</strong>
                • Kelola data Staff Akun<br />
                • Monitoring logs ISO<br />
                • Reset/Setup database
              </div>
              <div className="bg-white p-2.5 rounded border">
                <strong className="text-blue-700 font-bold block uppercase mb-1">Engineering</strong>
                • Upload Shop Drawing<br />
                • Rilis Revisi R0/R1/R2<br />
                • Persetujuan Berkas
              </div>
              <div className="bg-white p-2.5 rounded border">
                <strong className="text-amber-805 font-bold block uppercase mb-1">Kepala Divisi</strong>
                • Monitor Workflow<br />
                • Tinjau Timeline Revisi<br />
                • Tanda Tangan Approval
              </div>
              <div className="bg-white p-2.5 rounded border">
                <strong className="text-slate-600 font-bold block uppercase mb-1">Operasional</strong>
                • Rilis Valid Checker<br />
                • Unduh file Approved<br />
                • Live Notifikasi FCM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
