/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Drawing, User, SystemNotification, AuditLog, Revision, UserDivision, DivisionProcess } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // IN-MEMORY DATABASE STATE (Holds state across client requests)
  let users: User[] = [
    {
      id: 'USR-001',
      username: 'admin',
      fullName: 'Administrator Utama',
      role: 'Administrator',
      division: 'All',
      email: 'admin@panelindo.com',
    },
    {
      id: 'USR-002',
      username: 'budi.eng',
      fullName: 'Budi Hartono (Eng)',
      role: 'Engineering',
      division: 'Engineering',
      email: 'budi.hartono@panelindo.com',
    },
    {
      id: 'USR-003',
      username: 'hendra.kepala',
      fullName: 'Hendra Wijaya (Kepala Engineering)',
      role: 'Kepala Divisi',
      division: 'Engineering',
      email: 'hendra.wijaya@panelindo.com',
    },
    {
      id: 'USR-004',
      username: 'anto.sales',
      fullName: 'Anton Setiawan (Kepala Sales)',
      role: 'Kepala Divisi',
      division: 'Sales',
      email: 'anton.sales@panelindo.com',
    },
    {
      id: 'USR-005',
      username: 'taufik.estimator',
      fullName: 'Taufik Hidayat (Kepala Estimator)',
      role: 'Kepala Divisi',
      division: 'Estimator',
      email: 'taufik.estimator@panelindo.com',
    },
    {
      id: 'USR-006',
      username: 'sugeng.purchasing',
      fullName: 'Sugeng Riyadi (Kepala Purchasing)',
      role: 'Kepala Divisi',
      division: 'Purchasing',
      email: 'sugeng.purchasing@panelindo.com',
    },
    {
      id: 'USR-007',
      username: 'joko.gudang',
      fullName: 'Joko Susilo (Kepala Gudang)',
      role: 'Kepala Divisi',
      division: 'Gudang',
      email: 'joko.gudang@panelindo.com',
    },
    {
      id: 'USR-008',
      username: 'agus.assembly',
      fullName: 'Agus Budiman (Kepala Assembly)',
      role: 'Kepala Divisi',
      division: 'Assembly',
      email: 'agus.assembly@panelindo.com',
    },
    {
      id: 'USR-009',
      username: 'andi.prod',
      fullName: 'Andi Rustandi (Kepala Produksi)',
      role: 'Kepala Divisi',
      division: 'Produksi',
      email: 'andi.produksi@panelindo.com',
    },
    {
      id: 'USR-010',
      username: 'bambang.qc',
      fullName: 'Bambang Irawan (Kepala QC)',
      role: 'Kepala Divisi',
      division: 'Quality Control',
      email: 'bambang.qc@panelindo.com',
    },
    {
      id: 'USR-011',
      username: 'eko.ekspedisi',
      fullName: 'Eko Prasetyo (Kepala Ekspedisi)',
      role: 'Kepala Divisi',
      division: 'Ekspedisi',
      email: 'eko.ekspedisi@panelindo.com',
    },
  ];

  let drawings: Drawing[] = [
    {
      id: 'DRW-001',
      drawingNumber: 'SD-PANEL-PLN-001',
      title: 'Wiring Diagram Panel LVMDP 3200A & Cap Bank 400kVAR',
      projectName: 'Gardu Hubung Utama - Krakatau Steel Phase 2',
      customerName: 'PT. Krakatau Steel (Persero) Tbk',
      breakdownNumber: 'QT-2026-0043',
      asbuiltQcDrawings: [],
      createdBy: 'Budi Hartono (Eng)',
      createdAt: '2026-05-15T08:30:00Z',
      updatedAt: '2026-05-30T10:15:00Z',
      description: 'Detail interlock motorized ACB, metering digital, dan konfigurasi auto-switching step capacitor bank.',
      status: 'Approved',
      latestApprovedRevisionCode: 'R1',
      affectedDivisions: ['Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control', 'Ekspedisi'],
      panels: [
        { id: 'PANEL-1', name: 'Panel LVMDP Motorized 3200A', quantity: 1 },
        { id: 'PANEL-2', name: 'Panel Capacitor Bank 400kVAR', quantity: 2 },
        { id: 'PANEL-3', name: 'Panel SDP Pompa Utama', quantity: 3 }
      ],
      divisionProcesses: [
        { division: 'Sales', status: 'Selesai Diproses', updatedBy: 'Anton Setiawan (Kepala Sales)', updatedAt: '2026-05-15T10:00:00Z' },
        { division: 'Estimator', status: 'Selesai Diproses', updatedBy: 'Taufik Hidayat (Kepala Estimator)', updatedAt: '2026-05-16T11:30:00Z' },
        { division: 'Engineering', status: 'Selesai Diproses', updatedBy: 'Hendra Wijaya (Kepala Engineering)', updatedAt: '2026-05-17T09:00:00Z' },
        { division: 'Purchasing', status: 'Selesai Diproses', updatedBy: 'Sugeng Riyadi (Kepala Purchasing)', updatedAt: '2026-05-20T14:00:00Z' },
        { division: 'Gudang', status: 'Selesai Diproses', updatedBy: 'Joko Susilo (Kepala Gudang)', updatedAt: '2026-05-22T15:30:00Z' },
        { division: 'Assembly', status: 'Sedang Diproses', updatedBy: 'Agus Budiman (Kepala Assembly)', updatedAt: '2026-05-29T10:00:00Z', notes: 'Pemasangan busbar tembaga utama sedang berlangsung sesuai wiring diagram R1.' },
        { division: 'Produksi', status: 'Sedang Diproses', updatedBy: 'Andi Rustandi (Kepala Produksi)', updatedAt: '2026-05-30T10:20:00Z', notes: 'Fabrikasi boks panel enclosure free-standing selesai, lanjut ke mounting komponen.' },
        { division: 'Quality Control', status: 'Belum Diproses', updatedBy: '-', updatedAt: '2026-05-15T08:30:00Z' },
        { division: 'Ekspedisi', status: 'Belum Diproses', updatedBy: '-', updatedAt: '2026-05-15T08:30:00Z' }
      ],
      revisions: [
        {
          id: 'REV-001-A',
          revisionCode: 'R0',
          fileName: 'SD-PANEL-PLN-001_R0_Main_Wiring.pdf',
          fileSize: '6.4 MB',
          description: 'Initial schematic release for client approval.',
          status: 'Approved',
          uploadedBy: 'Budi Hartono (Eng)',
          uploadedAt: '2026-05-15T08:30:00Z',
          reviewedBy: 'Hendra Wijaya (Kepala Engineering)',
          reviewedAt: '2026-05-16T10:00:00Z',
          comments: 'Approved untuk review internal dan fabrikasi struktur awal.',
        },
        {
          id: 'REV-001-B',
          revisionCode: 'R1',
          fileName: 'SD-PANEL-PLN-001_R1_Busbar_Motorized_ACB.pdf',
          fileSize: '7.1 MB',
          description: 'Upgrade busbar utama penyaluran tembaga murni tebal 10mm untuk menangani inrush current motorized ACB.',
          status: 'Approved',
          uploadedBy: 'Budi Hartono (Eng)',
          uploadedAt: '2026-05-30T09:00:00Z',
          reviewedBy: 'Hendra Wijaya (Kepala Engineering)',
          reviewedAt: '2026-05-30T10:15:00Z',
          comments: 'Approved. Segera informasikan ke bagian Purchasing agar memesan spesifikasi tembaga tempaan sesuai revisi R1.',
        },
      ],
      estimatorBreakdown: {
        id: 'est-001',
        fileName: 'Breakdown_Krakatau_Steel_R1.xlsx',
        fileSize: '1.2 MB',
        uploadedBy: 'Taufik Hidayat (Kepala Estimator)',
        uploadedAt: '2026-05-16T11:30:00Z',
        status: 'Approved',
        comments: 'Estimasi harga material dan tembaga disetujui sales & customer'
      },
      customerAccStatus: 'Approved'
    },
    {
      id: 'DRW-002',
      drawingNumber: 'SD-PANEL-AGR-002',
      title: 'Desain Panel Kontrol Inverter PLC Siemens Racks',
      projectName: 'Rice Mill Automation Station 3',
      customerName: 'CV. Agro Prima Mandiri',
      breakdownNumber: 'QT-2026-0152',
      asbuiltQcDrawings: [],
      createdBy: 'Budi Hartono (Eng)',
      createdAt: '2026-06-01T09:00:00Z',
      updatedAt: '2026-06-01T09:00:00Z',
      description: 'Tata letak mounting PLC S7-1200, modul expansi analog, dan terminal blok inverter Danfoss VSD 45kW.',
      status: 'Pending Approval',
      latestApprovedRevisionCode: null,
      affectedDivisions: ['Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control'],
      panels: [
        { id: 'PANEL-4', name: 'Panel Kontrol PLC S7-1200', quantity: 1 },
        { id: 'PANEL-5', name: 'Panel VSD Danfoss 45kW Dual-Starter', quantity: 2 }
      ],
      divisionProcesses: [
        { division: 'Sales', status: 'Selesai Diproses', updatedBy: 'Anton Setiawan (Kepala Sales)', updatedAt: '2026-06-01T09:30:00Z' },
        { division: 'Estimator', status: 'Sedang Diproses', updatedBy: 'Taufik Hidayat (Kepala Estimator)', updatedAt: '2026-06-01T10:00:00Z' },
        { division: 'Engineering', status: 'Belum Diproses', updatedBy: '-', updatedAt: '2026-06-01T09:00:00Z' },
        { division: 'Purchasing', status: 'Belum Diproses', updatedBy: '-', updatedAt: '2026-06-01T09:00:00Z' },
        { division: 'Gudang', status: 'Belum Diproses', updatedBy: '-', updatedAt: '2026-06-01T09:00:00Z' },
        { division: 'Assembly', status: 'Belum Diproses', updatedBy: '-', updatedAt: '2026-06-01T09:00:00Z' },
        { division: 'Produksi', status: 'Belum Diproses', updatedBy: '-', updatedAt: '2026-06-01T09:00:00Z' },
        { division: 'Quality Control', status: 'Belum Diproses', updatedBy: '-', updatedAt: '2026-06-01T09:00:00Z' }
      ],
      revisions: [
        {
          id: 'REV-002-A',
          revisionCode: 'R0',
          fileName: 'SD-PANEL-AGR-002_R0_Layout_PLC.pdf',
          fileSize: '5.8 MB',
          description: 'Initial release. Laying out power supplies and protection fuses for PLC input channels.',
          status: 'Pending Approval',
          uploadedBy: 'Budi Hartono (Eng)',
          uploadedAt: '2026-06-01T09:00:00Z',
          reviewedBy: null,
          reviewedAt: null,
          comments: null,
        },
      ],
      estimatorBreakdown: {
        id: 'est-002',
        fileName: 'Breakdown_Siemens_Racks.xlsx',
        fileSize: '850 KB',
        uploadedBy: 'Taufik Hidayat (Kepala Estimator)',
        uploadedAt: '2026-06-01T10:00:00Z',
        status: 'Approved',
        comments: 'Estimasi panel siap'
      },
      customerAccStatus: 'Pending Approval'
    },
    {
      id: 'DRW-003',
      drawingNumber: 'SD-PANEL-ASP-003',
      title: 'Panel MDP & ATS-AMF 1250kVA Spec',
      projectName: 'Pabrik Pengalengan Ikan Bali',
      customerName: 'PT. Asparagus Laut Nusantara',
      breakdownNumber: 'QT-2026-0096',
      asbuiltQcDrawings: [],
      createdBy: 'Budi Hartono (Eng)',
      createdAt: '2026-05-20T14:45:00Z',
      updatedAt: '2026-06-02T16:00:00Z',
      description: 'Panel automatic transfer switch AMF Genset backup dual mains dengan breaker MCCB motorized.',
      status: 'Rejected',
      latestApprovedRevisionCode: 'R0',
      affectedDivisions: ['Sales', 'Estimator', 'Gudang', 'Purchasing', 'Produksi'],
      panels: [
        { id: 'PANEL-6', name: 'Panel MDP LVMDP 2500A Key-Interlock', quantity: 1 },
        { id: 'PANEL-7', name: 'Panel ATS-AMF Motorized MCCB 1250kVA', quantity: 1 }
      ],
      divisionProcesses: [
        { division: 'Sales', status: 'Selesai Diproses', updatedBy: 'Anton Setiawan (Kepala Sales)', updatedAt: '2026-05-20T15:00:00Z' },
        { division: 'Estimator', status: 'Selesai Diproses', updatedBy: 'Taufik Hidayat (Kepala Estimator)', updatedAt: '2026-05-21T09:30:00Z' },
        { division: 'Gudang', status: 'Belum Diproses', updatedBy: '-', updatedAt: '2026-05-20T14:45:00Z' },
        { division: 'Purchasing', status: 'Dalam Revisi', updatedBy: 'Sugeng Riyadi (Kepala Purchasing)', updatedAt: '2026-06-02T16:05:00Z', notes: 'Menunggu revisi layout tembaga R2 karena panel dibatalkan sementara.' },
        { division: 'Produksi', status: 'Menunggu Revisi', updatedBy: 'Andi Rustandi (Kepala Produksi)', updatedAt: '2026-06-02T16:10:00Z', notes: 'Fabrikasi rangka dihentikan untuk menunggu perbaikan spek MCCB.' }
      ],
      revisions: [
        {
          id: 'REV-003-A',
          revisionCode: 'R0',
          fileName: 'SD-PANEL-ASP-003_R0_Mains_AMF.pdf',
          fileSize: '5.1 MB',
          description: 'Initial release. Spek panel standard 100mm PU.',
          status: 'Approved',
          uploadedBy: 'Budi Hartono (Eng)',
          uploadedAt: '2026-05-20T14:45:00Z',
          reviewedBy: 'Hendra Wijaya (Kepala Engineering)',
          reviewedAt: '2026-05-21T09:00:00Z',
          comments: 'Approved untuk kebutuhan estimasi awal.',
        },
        {
          id: 'REV-003-B',
          revisionCode: 'R1',
          fileName: 'SD-PANEL-ASP-003_R1_Mains_MCCB_Upgrade.pdf',
          fileSize: '5.3 MB',
          description: 'Revisi spesifikasi ketebalan jembatan busbar tembaga agar muat di enclosure sempit.',
          status: 'Rejected',
          uploadedBy: 'Budi Hartono (Eng)',
          uploadedAt: '2026-06-02T15:30:00Z',
          reviewedBy: 'Hendra Wijaya (Kepala Engineering)',
          reviewedAt: '2026-06-02T16:00:00Z',
          comments: 'Rejected. Anggaran pengerjaan busbar tembaga gilingan melebihi plafon Sales. Re-design agar meliuk dengan hemat tembaga.',
        },
      ],
      estimatorBreakdown: {
        id: 'est-003',
        fileName: 'Breakdown_ATS_AMF_Genset.xlsx',
        fileSize: '2.1 MB',
        uploadedBy: 'Taufik Hidayat (Kepala Estimator)',
        uploadedAt: '2026-05-21T09:30:00Z',
        status: 'Approved',
        comments: 'Harga pas batas'
      },
      customerAccStatus: 'Rejected'
    },
  ];

  let notifications: SystemNotification[] = [
    {
      id: 'NTF-001',
      title: 'Revisi Approved',
      message: 'Revisi R1 pada gambar SD-2026-ENG-001: Pondasi Base Plate telah disetujui oleh Hendra Wijaya.',
      timestamp: '2026-05-30T10:15:00Z',
      type: 'success',
      drawingId: 'DRW-001',
      revisionCode: 'R1',
      division: 'Produksi',
      isRead: false,
    },
    {
      id: 'NTF-002',
      title: 'Revisi Rejected',
      message: 'Revisi R1 pada gambar SD-24-FAC-102: Facade Cladding ditolak oleh Hendra Wijaya karena budget membengkak.',
      timestamp: '2026-06-02T16:00:00Z',
      type: 'warning',
      drawingId: 'DRW-003',
      revisionCode: 'R1',
      division: 'All',
      isRead: false,
    },
    {
      id: 'NTF-003',
      title: 'Menunggu Approval',
      message: 'Budi Hartono mengunggah SD-2026-ENG-002 R0: Rafter Frame. Menunggu approval dari Kepala Divisi.',
      timestamp: '2026-06-01T09:00:00Z',
      type: 'alert',
      drawingId: 'DRW-002',
      revisionCode: 'R0',
      division: 'Engineering',
      isRead: false,
    },
  ];

  let auditLogs: AuditLog[] = [
    {
      id: 'LOG-001',
      timestamp: '2026-05-15T08:30:00Z',
      userId: 'USR-002',
      username: 'budi.eng',
      userRole: 'Engineering',
      userDivision: 'Engineering',
      action: 'UPLOAD_DRAWING',
      details: 'Mengunggah drawing awal SD-2026-ENG-001 R0 (Pondasi Base Plate)',
      isKepalaBagian: false,
    },
    {
      id: 'LOG-002',
      timestamp: '2026-05-16T10:00:00Z',
      userId: 'USR-003',
      username: 'hendra.kepala',
      userRole: 'Kepala Divisi',
      userDivision: 'Engineering',
      action: 'APPROVE_REVISION',
      details: 'Menyetujui revisi R0 untuk gambar SD-2026-ENG-001',
      isKepalaBagian: true,
    },
    {
      id: 'LOG-003',
      timestamp: '2026-05-20T14:45:00Z',
      userId: 'USR-002',
      username: 'budi.eng',
      userRole: 'Engineering',
      userDivision: 'Engineering',
      action: 'UPLOAD_DRAWING',
      details: 'Mengunggah drawing awal SD-24-FAC-102 R0 (Facade Cladding)',
      isKepalaBagian: false,
    },
    {
      id: 'LOG-004',
      timestamp: '2026-05-21T09:00:00Z',
      userId: 'USR-003',
      username: 'hendra.kepala',
      userRole: 'Kepala Divisi',
      userDivision: 'Engineering',
      action: 'APPROVE_REVISION',
      details: 'Menyetujui revisi R0 untuk gambar SD-24-FAC-102',
      isKepalaBagian: true,
    },
    {
      id: 'LOG-005',
      timestamp: '2026-05-30T09:00:00Z',
      userId: 'USR-002',
      username: 'budi.eng',
      userRole: 'Engineering',
      userDivision: 'Engineering',
      action: 'UPLOAD_REVISION',
      details: 'Mengunggah revisi R1 untuk gambar SD-2026-ENG-001 (M27 Anchor upgrade)',
      isKepalaBagian: false,
    },
    {
      id: 'LOG-006',
      timestamp: '2026-05-30T10:15:00Z',
      userId: 'USR-003',
      username: 'hendra.kepala',
      userRole: 'Kepala Divisi',
      userDivision: 'Engineering',
      action: 'APPROVE_REVISION',
      details: 'Menyetujui revisi R1 untuk gambar SD-2026-ENG-001',
      isKepalaBagian: true,
    },
    {
      id: 'LOG-007',
      timestamp: '2026-06-01T09:00:00Z',
      userId: 'USR-002',
      username: 'budi.eng',
      userRole: 'Engineering',
      userDivision: 'Engineering',
      action: 'UPLOAD_DRAWING',
      details: 'Mengunggah drawing awal SD-2026-ENG-002 R0 (Rafter Frame)',
      isKepalaBagian: false,
    },
    {
      id: 'LOG-008',
      timestamp: '2026-06-02T15:30:00Z',
      userId: 'USR-002',
      username: 'budi.eng',
      userRole: 'Engineering',
      userDivision: 'Engineering',
      action: 'UPLOAD_REVISION',
      details: 'Mengunggah revisi R1 untuk gambar SD-24-FAC-102 (panel PU 120mm)',
      isKepalaBagian: false,
    },
    {
      id: 'LOG-009',
      timestamp: '2026-06-02T16:00:00Z',
      userId: 'USR-003',
      username: 'hendra.kepala',
      userRole: 'Kepala Divisi',
      userDivision: 'Engineering',
      action: 'REJECT_REVISION',
      details: 'Menolak revisi R1 untuk gambar SD-24-FAC-102 (panel PU 120mm - melampaui budget)',
      isKepalaBagian: true,
    },
  ];

  // Helper function to log audit
  function addAuditLog(userId: string, action: string, details: string) {
    const user = users.find((u) => u.id === userId) || {
      username: 'system',
      role: 'Administrator' as const,
      division: 'All' as const,
    };
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      username: user.username,
      userRole: user.role,
      userDivision: user.division,
      action,
      details,
      isKepalaBagian: user.role === 'Kepala Divisi' || user.role === 'Engineering' || user.role === 'Administrator',
    };
    auditLogs.unshift(newLog);
  }

  // Helper function to send notification
  function addNotification(
    title: string,
    message: string,
    type: SystemNotification['type'],
    drawingId?: string,
    revisionCode?: string,
    division?: UserDivision
  ) {
    const newNtf: SystemNotification = {
      id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      drawingId,
      revisionCode,
      division: division || 'All',
      isRead: false,
    };
    notifications.unshift(newNtf);
  }

  // API ROUTES

  // 1. GET Users
  app.get('/api/users', (req, res) => {
    res.json(users);
  });

  // 2. POST User (Admin only)
  app.post('/api/users', (req, res) => {
    const { username, fullName, role, division, email, adminUserId } = req.body;
    if (!username || !fullName || !role || !division || !email) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const newUser: User = {
      id: `USR-${Date.now()}`,
      username: username.toLowerCase().replace(/\s+/g, '.'),
      fullName,
      role,
      division,
      email,
    };

    users.push(newUser);
    addAuditLog(adminUserId || 'USR-001', 'ADD_USER', `Menambahkan user baru: ${fullName} (${role} - ${division})`);
    res.status(210).json(newUser);
  });

  // 3. DELETE User (Admin only)
  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const adminUserId = req.query.adminUserId as string;
    const userToDelete = users.find((u) => u.id === id);

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    users = users.filter((u) => u.id !== id);
    addAuditLog(adminUserId || 'USR-001', 'DELETE_USER', `Menghapus user: ${userToDelete.fullName} (${userToDelete.role})`);
    res.json({ success: true, deletedId: id });
  });

  // 4. GET Drawings
  app.get('/api/drawings', (req, res) => {
    res.json(drawings);
  });

  // 5. GET Drawing Details
  app.get('/api/drawings/:id', (req, res) => {
    const drawing = drawings.find((d) => d.id === req.params.id);
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing not found' });
    }
    res.json(drawing);
  });

  // 6. POST Drawing (Engineering)
  app.post('/api/drawings', (req, res) => {
    const { drawingNumber, title, projectName, customerName, panels, description, affectedDivisions, uploadedBy, userId, fileName, fileSize, breakdownNumber } = req.body;
    if (!drawingNumber || !title || !projectName || !customerName || !uploadedBy || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check duplicate drawing number
    if (drawings.some((d) => d.drawingNumber.toUpperCase() === drawingNumber.toUpperCase())) {
      return res.status(400).json({ error: `Drawing number ${drawingNumber} already exists.` });
    }

    const newDrawingId = `DRW-${Date.now()}`;
    const initialRevCode = 'R0';
    const finalFileName = fileName || `${drawingNumber}_${initialRevCode}_Draft.pdf`;
    const finalFileSize = fileSize || '3.5 MB';

    const initialRevision: Revision = {
      id: `REV-${Date.now()}-A`,
      revisionCode: initialRevCode,
      fileName: finalFileName,
      fileSize: finalFileSize,
      description: description || 'Initial Release',
      status: 'Pending Approval',
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      comments: null,
    };

    const targetDivs: UserDivision[] = affectedDivisions || ['Sales', 'Estimator', 'Engineering', 'Purchasing', 'Gudang', 'Assembly', 'Produksi', 'Quality Control', 'Ekspedisi'];
    
    // Initialize division progress trackers
    const divisionProcesses: DivisionProcess[] = targetDivs.map((div) => ({
      division: div,
      status: 'Belum Diproses' as const,
      updatedBy: '-',
      updatedAt: new Date().toISOString(),
    }));

    const newDrawing: Drawing = {
      id: newDrawingId,
      drawingNumber: drawingNumber.toUpperCase(),
      title,
      projectName,
      customerName,
      breakdownNumber: breakdownNumber || 'QT-2026-X001',
      asbuiltQcDrawings: [],
      panels: panels || [],
      createdBy: uploadedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: description || '',
      status: 'Pending Approval',
      latestApprovedRevisionCode: null,
      affectedDivisions: targetDivs,
      revisions: [initialRevision],
      divisionProcesses,
    };

    drawings.unshift(newDrawing);
    addAuditLog(userId, 'UPLOAD_DRAWING', `Mengunggah Shop Drawing Panel Baru: ${drawingNumber} - Customer: ${customerName}, Proyek: ${projectName} (${initialRevCode})`);
    addNotification(
      'Drawing Panel Baru Diunggah',
      `Sistem mengunggah gambar baru ${drawingNumber} (${title}) untuk customer ${customerName} oleh ${uploadedBy}. Menunggu approval.`,
      'alert',
      newDrawingId,
      initialRevCode,
      'Engineering'
    );

    res.status(201).json(newDrawing);
  });

  // 7. POST New Revision for Existing Drawing
  app.post('/api/drawings/:id/revisions', (req, res) => {
    const { id } = req.params;
    const { description, uploadedBy, userId, fileName, fileSize } = req.body;

    const drawingIndex = drawings.findIndex((d) => d.id === id);
    if (drawingIndex === -1) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const drawing = drawings[drawingIndex];

    // Determine latest revision order
    const nextRevNum = drawing.revisions.length;
    const nextRevCode = `R${nextRevNum}`;
    const finalFileName = fileName || `${drawing.drawingNumber}_${nextRevCode}_Revision.pdf`;
    const finalFileSize = fileSize || '4.2 MB';

    const newRevision: Revision = {
      id: `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      revisionCode: nextRevCode,
      fileName: finalFileName,
      fileSize: finalFileSize,
      description: description || `Revisi ke-${nextRevNum}`,
      status: 'Pending Approval',
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      comments: null,
    };

    drawing.revisions.push(newRevision);
    drawing.status = 'Pending Approval';
    drawing.updatedAt = new Date().toISOString();

    addAuditLog(userId, 'UPLOAD_REVISION', `Mengunggah revisi baru ${nextRevCode} untuk ${drawing.drawingNumber}`);
    addNotification(
      'Revisi Baru Ditambahkan',
      `Sistem menerima revisi terbaru ${nextRevCode} untuk gambar ${drawing.drawingNumber} dari ${uploadedBy}.`,
      'alert',
      drawing.id,
      nextRevCode,
      'Engineering'
    );

    res.json(drawing);
  });

  // 8. PUT / POST Review Revision (Approve / Reject)
  app.post('/api/drawings/:id/revisions/:revisionId/review', (req, res) => {
    const { id, revisionId } = req.params;
    const { status, reviewedBy, comments, userId } = req.body; // status 'Approved' or 'Rejected'

    if (!status || !reviewedBy || !userId) {
      return res.status(400).json({ error: 'Missing review params: status, reviewedBy, userId' });
    }

    const user = users.find((u) => u.id === userId);
    if (!user || user.role !== 'Kepala Divisi') {
      return res.status(403).json({ error: 'Hanya Kepala Bagian (Kepala Divisi) yang mempunyai kewenangan menyetujui atau menolak gambar.' });
    }

    const drawingIndex = drawings.findIndex((d) => d.id === id);
    if (drawingIndex === -1) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const drawing = drawings[drawingIndex];
    const revision = drawing.revisions.find((r) => r.id === revisionId);

    if (!revision) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    if (revision.status !== 'Pending Approval') {
      return res.status(400).json({ error: 'Revision is already reviewed' });
    }

    // Apply Review status
    revision.status = status;
    revision.reviewedBy = reviewedBy;
    revision.reviewedAt = new Date().toISOString();
    revision.comments = comments || null;

    drawing.updatedAt = new Date().toISOString();

    if (status === 'Approved') {
      drawing.status = 'Approved';
      drawing.latestApprovedRevisionCode = revision.revisionCode;

      // Update intermediate pre-approved status of earlier items if any to avoid confusion
      // Usually, when R1 is approved, we know R1 is the latest, and R0 was already approved.
      // Set drawing header status as Approved
      addAuditLog(userId, 'APPROVE_REVISION', `Menyetujui revisi ${revision.revisionCode} untuk ${drawing.drawingNumber}`);
      
      // Notify all affected divisions!
      drawing.affectedDivisions.forEach((div) => {
        addNotification(
          'Drawing Approved & Rilis',
          `Kabar Gembira! Gambar ${drawing.drawingNumber} (${drawing.title}) Revisi ${revision.revisionCode} telah SIAP/APPROVED untuk divisi ${div}. Silahkan gunakan file terbaru ini!`,
          'success',
          drawing.id,
          revision.revisionCode,
          div
        );
      });
    } else {
      drawing.status = 'Rejected';
      addAuditLog(userId, 'REJECT_REVISION', `Menolak revisi ${revision.revisionCode} untuk ${drawing.drawingNumber}. Alasan: ${comments}`);
      addNotification(
        'Revision Rejected',
        `Revisi ${revision.revisionCode} untuk gambar ${drawing.drawingNumber} DITOLAK karena: ${comments || 'No comment'}`,
        'warning',
        drawing.id,
        revision.revisionCode,
        'Engineering'
      );
    }

    res.json(drawing);
  });

  // 8.5 POST Update Progress Status (Division Heads)
  app.post('/api/drawings/:id/progress', (req, res) => {
    const { id } = req.params;
    const { division, status, updatedBy, notes, userId } = req.body;

    if (!division || !status || !updatedBy) {
      return res.status(400).json({ error: 'Missing parameters: division, status, or updatedBy are required' });
    }

    // Verify division update restriction
    const user = users.find((u) => u.id === userId);
    if (user && user.division !== 'All' && user.division !== division) {
      return res.status(403).json({ error: `Hanya bisa update progress divisi masing-masing (${user.division}). Tidak diperkenankan update untuk divisi ${division}.` });
    }

    const drawingIndex = drawings.findIndex((d) => d.id === id);
    if (drawingIndex === -1) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const drawing = drawings[drawingIndex];
    if (!drawing.divisionProcesses) {
      drawing.divisionProcesses = [];
    }

    let proc = drawing.divisionProcesses.find((p) => p.division === division);
    if (!proc) {
      proc = {
        division,
        status: status,
        updatedBy: updatedBy,
        updatedAt: new Date().toISOString()
      };
      drawing.divisionProcesses.push(proc);
    } else {
      proc.status = status;
      proc.updatedBy = updatedBy;
      proc.updatedAt = new Date().toISOString();
    }
    
    if (notes !== undefined) {
      proc.notes = notes;
    }

    drawing.updatedAt = new Date().toISOString();

    addAuditLog(userId || 'USR-001', 'PROCESS_UPDATE', `Kepala Divisi ${division} (${updatedBy}) menandai progress: ${status}.${notes ? ' Catatan: ' + notes : ''}`);
    
    addNotification(
      `Pembaruan Progress ${division}`,
      `Kepala Bagian ${division} (${updatedBy}) telah merubah status pengerjaan produk/revisi menjadi "${status}".`,
      'info',
      drawing.id,
      drawing.latestApprovedRevisionCode || undefined,
      'All'
    );

    res.json(drawing);
  });

  // 8.51 POST Add Panel Option (Additional panels with appropriate phase separation)
  app.post('/api/drawings/:id/add-panel', (req, res) => {
    const { id } = req.params;
    const { name, quantity, phase } = req.body;

    const drawingIndex = drawings.findIndex((d) => d.id === id);
    if (drawingIndex === -1) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const drawing = drawings[drawingIndex];
    if (!drawing.panels) {
      drawing.panels = [];
    }

    const newPanel = {
      id: `PANEL-ADD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name || 'Unit Panel Tambahan',
      quantity: quantity || 1,
      phase: phase || 'Additional'
    };

    drawing.panels.push(newPanel);
    drawing.updatedAt = new Date().toISOString();

    addAuditLog('USR-001', 'ADD_PANEL', `Menambahkan panel tambahan baru ke proyek ${drawing.drawingNumber}: ${newPanel.name} (Qty: ${newPanel.quantity})`);
    addNotification(
      'Panel Tambahan Ditambahkan',
      `Panel tambahan baru "${newPanel.name}" sejumlah ${newPanel.quantity} unit berhasil ditambahkan ke proyek ${drawing.drawingNumber}.`,
      'info',
      drawing.id,
      drawing.latestApprovedRevisionCode || undefined,
      'All'
    );

    res.json(drawing);
  });

  // 8.52 POST Register Asbuilt QC Drawing
  app.post('/api/drawings/:id/asbuilt-qc', (req, res) => {
    const { id } = req.params;
    const { fileName, fileSize, description, uploadedBy, userId } = req.body;

    const drawingIndex = drawings.findIndex((d) => d.id === id);
    if (drawingIndex === -1) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const drawing = drawings[drawingIndex];
    if (!drawing.asbuiltQcDrawings) {
      drawing.asbuiltQcDrawings = [];
    }

    const newAsbuilt = {
      id: `ASB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fileName: fileName || `${drawing.drawingNumber}_QC_Asbuilt.pdf`,
      fileSize: fileSize || '3.5 MB',
      uploadedBy: uploadedBy || 'QC Staff',
      uploadedAt: new Date().toISOString(),
      status: 'Pending Approval' as const,
      comments: null,
      description: description || 'Asbuilt Drawing release by Quality Control'
    };

    drawing.asbuiltQcDrawings.push(newAsbuilt);
    drawing.updatedAt = new Date().toISOString();

    addAuditLog(userId || 'USR-010', 'UPLOAD_ASBUILT_QC', `Mengunggah Gambar Asbuilt QC: ${newAsbuilt.fileName} untuk ${drawing.drawingNumber}. Menunggu approval internal.`);
    addNotification(
      'Gambar Asbuilt QC Baru Diunggah',
      `Sistem menerima gambar laporan perbaikan asbuilt QC baru: ${newAsbuilt.fileName} dari ${uploadedBy}.`,
      'alert',
      drawing.id,
      drawing.latestApprovedRevisionCode || undefined,
      'Quality Control'
    );

    res.json(drawing);
  });

  // 8.53 POST Review/Approve Asbuilt QC Drawing
  app.post('/api/drawings/:id/asbuilt-qc/:asbuiltId/review', (req, res) => {
    const { id, asbuiltId } = req.params;
    const { status, comments, reviewedBy, userId } = req.body;

    const drawingIndex = drawings.findIndex((d) => d.id === id);
    if (drawingIndex === -1) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const drawing = drawings[drawingIndex];
    if (!drawing.asbuiltQcDrawings) {
      return res.status(404).json({ error: 'Asbuilt QC drawing list is empty' });
    }

    const asbuilt = drawing.asbuiltQcDrawings.find((a) => a.id === asbuiltId);
    if (!asbuilt) {
      return res.status(404).json({ error: 'Asbuilt QC drawing not found' });
    }

    asbuilt.status = status;
    asbuilt.reviewedBy = reviewedBy;
    asbuilt.reviewedAt = new Date().toISOString();
    asbuilt.comments = comments || null;

    drawing.updatedAt = new Date().toISOString();

    addAuditLog(userId || 'USR-010', 'REVIEW_ASBUILT_QC', `QC Reviewer ${reviewedBy} menandai Asbuilt QC ${asbuilt.fileName} sebagai ${status}`);
    addNotification(
      `Asbuilt QC ${status}`,
      `Kepala Bagian Quality Control (${reviewedBy}) telah menyetujui rilis gambar asbuilt QC: ${asbuilt.fileName}. Status saat ini: "${status}".`,
      status === 'Approved' ? 'success' : 'warning',
      drawing.id,
      drawing.latestApprovedRevisionCode || undefined,
      'All'
    );

    res.json(drawing);
  });

  // 8.6 POST Estimator Breakdown Upload
  app.post('/api/drawings/:id/breakdown', (req, res) => {
    const { id } = req.params;
    const { uploadedBy, userId, fileName, fileSize, comments } = req.body;

    const drawing = drawings.find((d) => d.id === id);
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing/Project not found' });
    }

    drawing.estimatorBreakdown = {
      id: `est-${Date.now()}`,
      fileName: fileName || 'breakdown_file.xlsx',
      fileSize: fileSize || '1.5 MB',
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      status: 'Pending Approval',
      comments: comments || null,
    };
    drawing.updatedAt = new Date().toISOString();

    addAuditLog(userId, 'UPLOAD_BREAKDOWN', `Estimator mengunggah breakdown file: ${fileName} untuk ${drawing.drawingNumber}`);
    addNotification(
      'Estimator Breakdown Diunggah',
      `${uploadedBy} mengunggah breakdown file untuk ${drawing.customerName}. Menunggu approval Sales.`,
      'alert',
      drawing.id,
      undefined,
      'Sales'
    );

    res.json(drawing);
  });

  // 8.7 POST Estimator Breakdown Review
  app.post('/api/drawings/:id/breakdown/review', (req, res) => {
    const { id } = req.params;
    const { status, reviewedBy, comments, userId } = req.body;

    const drawing = drawings.find((d) => d.id === id);
    if (!drawing || !drawing.estimatorBreakdown) {
      return res.status(404).json({ error: 'Drawing or breakdown not found' });
    }

    drawing.estimatorBreakdown.status = status; // 'Approved' | 'Rejected'
    drawing.estimatorBreakdown.comments = comments || null;
    drawing.updatedAt = new Date().toISOString();

    addAuditLog(userId, status === 'Approved' ? 'APPROVE_BREAKDOWN' : 'REJECT_BREAKDOWN', `Evaluasi breakdown file: ${status} oleh ${reviewedBy}`);
    addNotification(
      `Breakdown Evaluated: ${status}`,
      `Breakdown harga dari estimator ditandai ${status} oleh ${reviewedBy}.`,
      status === 'Approved' ? 'success' : 'warning',
      drawing.id,
      undefined,
      'Estimator'
    );

    res.json(drawing);
  });

  // 8.8 POST Customer ACC (Sales Approved)
  app.post('/api/drawings/:id/customer-acc', (req, res) => {
    const { id } = req.params;
    const { status, reviewedBy, comments, userId } = req.body; // status 'Approved' or 'Rejected'

    const drawing = drawings.find((d) => d.id === id);
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing/Project not found' });
    }

    drawing.customerAccStatus = status;
    drawing.updatedAt = new Date().toISOString();

    if (status === 'Approved') {
      drawing.status = 'Approved';
      addAuditLog(userId, 'CUSTOMER_ACC_APPROVED', `Sales menandatangani Customer ACC untuk proyek ${drawing.customerName}. Proyek resmi dimulai!`);
      addNotification(
        'PROYEK RESMI DIMULAI',
        `Customer ACC disetujui! Proyek ${drawing.customerName} - ${drawing.projectName} resmi dimulai & didistribusikan ke seluruh divisi!`,
        'success',
        drawing.id,
        undefined,
        'All'
      );
    } else {
      drawing.status = 'Rejected';
      addAuditLog(userId, 'CUSTOMER_ACC_REJECTED', `Sales menolak Customer ACC (butuh revisi). Catatan: ${comments}`);
      addNotification(
        'Customer ACC Rejected',
        `Customer ACC ditolak/perlu revisi oleh Sales: ${comments}`,
        'warning',
        drawing.id,
        undefined,
        'Engineering'
      );
    }

    res.json(drawing);
  });

  // 9. GET Notifications
  app.get('/api/notifications', (req, res) => {
    res.json(notifications);
  });

  // 10. POST Notifications Mark Read
  app.post('/api/notifications/mark-all-read', (req, res) => {
    notifications.forEach((n) => (n.isRead = true));
    res.json({ success: true });
  });

  // 11. GET Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(auditLogs);
  });

  // 12. Simulate FCM Push Notification from client side
  app.post('/api/mock-fcm', (req, res) => {
    const { title, message, type, division } = req.body;
    addNotification(
      title || 'Pengumuman Sistem',
      message || 'Terdapat pembaruan workflow umum',
      type || 'info',
      undefined,
      undefined,
      division || 'All'
    );
    res.json({ success: true });
  });

  // Vite development server / production compile build system setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Single page application fallback rewrite
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Workflow Control Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
