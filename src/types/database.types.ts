// User & Auth Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'auditor' | 'vendor';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  lastActive: string;
}

// Warehouse & Location Types
export interface Warehouse {
  id: string;
  name: string;
  address: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  warehouseId: string;
  code: string;
  type: 'standard' | 'cold_storage' | 'hazardous' | 'quarantine';
  capacity: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Product & Inventory Types
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  description: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  unit: string;
  reorderPoint: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Barcode {
  id: string;
  productId: string;
  barcode: string;
  type: 'ean13' | 'upc' | 'qr' | 'custom';
  createdAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  createdAt: string;
}

export interface Inventory {
  id: string;
  productId: string;
  locationId: string;
  batchId?: string;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

// Operations Types
export interface StockMovement {
  id: string;
  productId: string;
  fromLocationId?: string;
  toLocationId?: string;
  batchId?: string;
  quantity: number;
  type: 'receive' | 'ship' | 'transfer' | 'adjust';
  referenceId?: string;
  userId: string;
  notes?: string;
  createdAt: string;
}

export interface TransferRequest {
  id: string;
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'executed';
  requestedBy: string;
  reviewedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Adjustment {
  id: string;
  productId: string;
  locationId: string;
  batchId?: string;
  quantityChange: number;
  reasonCode: 'loss' | 'theft' | 'expiry' | 'cycle_count' | 'damage' | 'other';
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// System Types
export interface AuditLog {
  id: string;
  tableName: string;
  recordId: string;
  action: 'create' | 'update' | 'delete';
  userId: string;
  oldData?: Record<string, any>;
  newData: Record<string, any>;
  reason?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'low_stock' | 'expiring_batch' | 'approval_needed' | 'transfer_status';
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileAttachment {
  id: string;
  entityType: string;
  entityId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

// Analytics Types
export interface KPIData {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockItems: number;
  expiringBatches: number;
  pendingTransfers: number;
  todayMovements: number;
  turnoverRatio: number;
  fillRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'movement' | 'transfer' | 'adjustment' | 'task';
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
