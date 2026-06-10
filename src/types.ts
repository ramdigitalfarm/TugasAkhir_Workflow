/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Administrator' | 'Engineering' | 'Kepala Divisi' | 'Divisi Operasional';

export type UserDivision =
  | 'Sales'
  | 'Estimator'
  | 'Engineering'
  | 'Purchasing'
  | 'Gudang'
  | 'Assembly'
  | 'Produksi'
  | 'Quality Control'
  | 'Ekspedisi'
  | 'All';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  division: UserDivision;
  email: string;
}

export type DrawingStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

export type ProcessStatusType = 'Belum Diproses' | 'Sedang Diproses' | 'Selesai Diproses' | 'Menunggu Revisi' | 'Dalam Revisi';

export interface DivisionProcess {
  division: UserDivision;
  status: ProcessStatusType;
  updatedBy: string; // FullName of division head
  updatedAt: string; // ISO date timestamp
  notes?: string;
}

export interface PanelItem {
  id: string;
  name: string; // e.g. "Panel LVMDP 2500A", "Panel SDP Grounding"
  quantity: number;
  phase?: string; // e.g., "Original Version", "Additional Phase / New Panel"
}

export interface Revision {
  id: string;
  revisionCode: string; // e.g., 'R0', 'R1', 'R2'
  fileName: string;
  fileSize: string;
  description: string;
  status: DrawingStatus;
  uploadedBy: string; // User fullName
  uploadedAt: string; // ISO timestamp
  reviewedBy: string | null;
  reviewedAt: string | null;
  comments: string | null;
}

export interface AsbuiltQcDrawing {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  description?: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  comments: string | null;
}

export interface Drawing {
  id: string;
  drawingNumber: string; // e.g., 'SD-2026-ENG-001'
  title: string;
  projectName: string;
  customerName: string; // PT or CV e.g. "PT. PLN (Persero)"
  panels: PanelItem[]; // varied panels in this project
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  status: DrawingStatus;
  latestApprovedRevisionCode: string | null;
  revisions: Revision[];
  affectedDivisions: UserDivision[];
  divisionProcesses: DivisionProcess[]; // track status of processing production or revisions
  breakdownNumber?: string; // Number Breakdown (QT)
  asbuiltQcDrawings?: AsbuiltQcDrawing[]; // Asbuilt drawings from QC
  estimatorBreakdown?: {
    id: string;
    fileName: string;
    fileSize: string;
    uploadedBy: string;
    uploadedAt: string;
    status: 'Pending Approval' | 'Approved' | 'Rejected';
    comments: string | null;
  } | null;
  customerAccStatus?: 'Pending Approval' | 'Approved' | 'Rejected' | null;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  drawingId?: string;
  revisionCode?: string;
  division?: UserDivision;
  isRead: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userRole: UserRole;
  userDivision: UserDivision;
  action: string; // e.g., 'UPLOAD_DRAWING', 'APPROVE_REVISION', 'ADD_USER'
  details: string;
  isKepalaBagian: boolean; // Flag to indicate if this belongs to a department head / approval action
}

