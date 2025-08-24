// Global type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleId: string;
  branchId?: string;
  permissions: Permission[];
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  preferences: UserPreferences;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'en' | 'sw';
  primaryColor: string;
  biometricEnabled: boolean;
  defaultBranch?: string;
  notifications: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  SHOP_OWNER = 'shop_owner',
  EMPLOYEE = 'employee',
  CASHIER = 'cashier',
  ACCOUNTANT = 'accountant'
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  managerId: string;
  isActive: boolean;
  settings: BranchSettings;
  createdAt: string;
  updatedAt: string;
}

export interface BranchSettings {
  currency: string;
  taxRate: number;
  receiptTemplate: string;
  allowNegativeStock: boolean;
  autoBackup: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentBranch: Branch | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  category: string;
  categoryId: string;
  unit: string;
  weight?: number;
  dimensions?: string;
  supplier?: string;
  supplierId?: string;
  branchId: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  type: 'increase' | 'decrease' | 'correction';
  quantity: number;
  reason: string;
  notes?: string;
  branchId: string;
  createdBy: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId: string;
  customer?: Customer;
  products: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'credit';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  amountPaid: number;
  change: number;
  status: 'pending' | 'completed' | 'cancelled';
  type: 'sale' | 'order' | 'proforma';
  notes?: string;
  branchId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Order extends Sale {
  deliveryDate?: string;
  deliveryAddress?: string;
  isConverted: boolean;
  convertedSaleId?: string;
}

export interface ProformaInvoice extends Sale {
  validUntil: string;
  isConfirmed: boolean;
  confirmedAt?: string;
  invoiceId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  customerType: 'regular' | 'vip' | 'wholesale';
  creditLimit: number;
  balance: number;
  totalPurchases: number;
  lastPurchase?: string;
  isActive: boolean;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  paymentTerms: string;
  balance: number;
  isActive: boolean;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplier?: Supplier;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'received' | 'cancelled';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  amountPaid: number;
  notes?: string;
  branchId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  costPrice: number;
  total: number;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  typeId: string;
  type?: ExpenseType;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'bank';
  receipt?: string;
  notes?: string;
  branchId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  categoryId: string;
  isActive: boolean;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  customerId: string;
  customer?: Customer;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue';
  description: string;
  branchId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'bank';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'pos' | 'printer' | 'scanner' | 'scale';
  model: string;
  serialNumber: string;
  status: 'active' | 'inactive' | 'maintenance';
  branchId: string;
  assignedTo?: string;
  lastMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Freight {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  weight: number;
  cost: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  customerId: string;
  customer?: Customer;
  branchId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  recipientId: string;
  senderId: string;
  isRead: boolean;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  code: string;
  balance: number;
  parentId?: string;
  isActive: boolean;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  accountId: string;
  account?: Account;
  referenceType?: 'sale' | 'purchase' | 'expense' | 'payment';
  referenceId?: string;
  branchId: string;
  createdBy: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  method: 'cash' | 'card' | 'mobile' | 'bank' | 'cheque';
  type: 'received' | 'paid';
  description: string;
  referenceType?: 'sale' | 'purchase' | 'debt' | 'expense';
  referenceId?: string;
  customerId?: string;
  supplierId?: string;
  branchId: string;
  createdBy: string;
  createdAt: string;
}

export interface StockRequest {
  id: string;
  requestNumber: string;
  fromBranchId: string;
  toBranchId: string;
  items: StockRequestItem[];
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  notes?: string;
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockRequestItem {
  id: string;
  productId: string;
  product?: Product;
  requestedQuantity: number;
  approvedQuantity?: number;
  fulfilledQuantity?: number;
}

export interface Report {
  id: string;
  name: string;
  type: 'sales' | 'inventory' | 'financial' | 'customer' | 'custom';
  parameters: ReportParameters;
  data: any;
  generatedBy: string;
  branchId: string;
  createdAt: string;
}

export interface ReportParameters {
  dateFrom: string;
  dateTo: string;
  branchId?: string;
  categoryId?: string;
  customerId?: string;
  productId?: string;
  [key: string]: any;
}

export interface DashboardMetrics {
  sales: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    growth: number;
  };
  debtors: {
    total: number;
    overdue: number;
    count: number;
  };
  expenses: {
    today: number;
    thisMonth: number;
    budget: number;
  };
  creditors: {
    total: number;
    overdue: number;
    count: number;
  };
  services: {
    completed: number;
    pending: number;
    revenue: number;
  };
  payments: {
    received: number;
    paid: number;
    pending: number;
  };
}

export interface SyncStatus {
  lastSync: string | null;
  pendingChanges: number;
  isOnline: boolean;
  isSyncing: boolean;
}

export interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: object;
    h2: object;
    h3: object;
    body: object;
    caption: object;
  };
}