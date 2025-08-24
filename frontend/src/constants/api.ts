// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:1001', // Backend server URL
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  LOGOUT: '/auth/logout',
  
  // User Management
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  CREATE_USER: '/users',
  UPDATE_USER: (id: string) => `/users/${id}`,
  DELETE_USER: (id: string) => `/users/${id}`,
  
  // Roles & Permissions
  ROLES: '/roles',
  ROLE_BY_ID: (id: string) => `/roles/${id}`,
  CREATE_ROLE: '/roles',
  UPDATE_ROLE: (id: string) => `/roles/${id}`,
  DELETE_ROLE: (id: string) => `/roles/${id}`,
  PERMISSIONS: '/permissions',
  
  // Branches
  BRANCHES: '/branches',
  BRANCH_BY_ID: (id: string) => `/branches/${id}`,
  CREATE_BRANCH: '/branches',
  UPDATE_BRANCH: (id: string) => `/branches/${id}`,
  DELETE_BRANCH: (id: string) => `/branches/${id}`,
  BRANCH_ACTIVITIES: (id: string) => `/branches/${id}/activities`,
  SWITCH_BRANCH: (id: string) => `/branches/${id}/switch`,
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  CREATE_PRODUCT: '/products',
  UPDATE_PRODUCT: (id: string) => `/products/${id}`,
  DELETE_PRODUCT: (id: string) => `/products/${id}`,
  PRODUCT_SEARCH: '/products/search',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
  CREATE_CATEGORY: '/categories',
  UPDATE_CATEGORY: (id: string) => `/categories/${id}`,
  DELETE_CATEGORY: (id: string) => `/categories/${id}`,
  
  // Stock Management
  STOCK_ADJUSTMENTS: '/stock/adjustments',
  CREATE_STOCK_ADJUSTMENT: '/stock/adjustments',
  STOCK_TAKING: '/stock/taking',
  STOCK_REQUESTS: '/stock/requests',
  CREATE_STOCK_REQUEST: '/stock/requests',
  APPROVE_STOCK_REQUEST: (id: string) => `/stock/requests/${id}/approve`,
  FULFILL_STOCK_REQUEST: (id: string) => `/stock/requests/${id}/fulfill`,
  
  // Sales
  SALES: '/sales',
  SALE_BY_ID: (id: string) => `/sales/${id}`,
  CREATE_SALE: '/sales',
  UPDATE_SALE: (id: string) => `/sales/${id}`,
  DELETE_SALE: (id: string) => `/sales/${id}`,
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  CREATE_ORDER: '/orders',
  UPDATE_ORDER: (id: string) => `/orders/${id}`,
  CONVERT_ORDER: (id: string) => `/orders/${id}/convert`,
  
  // Proforma Invoices
  PROFORMA_INVOICES: '/proforma-invoices',
  PROFORMA_BY_ID: (id: string) => `/proforma-invoices/${id}`,
  CREATE_PROFORMA: '/proforma-invoices',
  UPDATE_PROFORMA: (id: string) => `/proforma-invoices/${id}`,
  CONFIRM_PROFORMA: (id: string) => `/proforma-invoices/${id}/confirm`,
  
  // Receipts & Printing
  PRINT_RECEIPT: (id: string) => `/sales/${id}/receipt`,
  PRINT_INVOICE: (id: string) => `/sales/${id}/invoice`,
  
  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,
  CREATE_CUSTOMER: '/customers',
  UPDATE_CUSTOMER: (id: string) => `/customers/${id}`,
  DELETE_CUSTOMER: (id: string) => `/customers/${id}`,
  CUSTOMER_HISTORY: (id: string) => `/customers/${id}/history`,
  
  // Suppliers
  SUPPLIERS: '/suppliers',
  SUPPLIER_BY_ID: (id: string) => `/suppliers/${id}`,
  CREATE_SUPPLIER: '/suppliers',
  UPDATE_SUPPLIER: (id: string) => `/suppliers/${id}`,
  DELETE_SUPPLIER: (id: string) => `/suppliers/${id}`,
  
  // Purchases
  PURCHASES: '/purchases',
  PURCHASE_BY_ID: (id: string) => `/purchases/${id}`,
  CREATE_PURCHASE: '/purchases',
  UPDATE_PURCHASE: (id: string) => `/purchases/${id}`,
  BULK_PURCHASE: '/purchases/bulk',
  
  // Expenses
  EXPENSES: '/expenses',
  EXPENSE_BY_ID: (id: string) => `/expenses/${id}`,
  CREATE_EXPENSE: '/expenses',
  UPDATE_EXPENSE: (id: string) => `/expenses/${id}`,
  DELETE_EXPENSE: (id: string) => `/expenses/${id}`,
  EXPENSE_TYPES: '/expense-types',
  CREATE_EXPENSE_TYPE: '/expense-types',
  
  // Services
  SERVICES: '/services',
  SERVICE_BY_ID: (id: string) => `/services/${id}`,
  CREATE_SERVICE: '/services',
  UPDATE_SERVICE: (id: string) => `/services/${id}`,
  DELETE_SERVICE: (id: string) => `/services/${id}`,
  
  // Debts
  DEBTS: '/debts',
  DEBT_BY_ID: (id: string) => `/debts/${id}`,
  CREATE_DEBT: '/debts',
  UPDATE_DEBT: (id: string) => `/debts/${id}`,
  DEBT_PAYMENTS: '/debt-payments',
  CREATE_DEBT_PAYMENT: '/debt-payments',
  DEBT_HISTORY: (id: string) => `/debts/${id}/history`,
  
  // Devices
  DEVICES: '/devices',
  DEVICE_BY_ID: (id: string) => `/devices/${id}`,
  CREATE_DEVICE: '/devices',
  UPDATE_DEVICE: (id: string) => `/devices/${id}`,
  DELETE_DEVICE: (id: string) => `/devices/${id}`,
  
  // Freight
  FREIGHTS: '/freights',
  FREIGHT_BY_ID: (id: string) => `/freights/${id}`,
  CREATE_FREIGHT: '/freights',
  UPDATE_FREIGHT: (id: string) => `/freights/${id}`,
  DELETE_FREIGHT: (id: string) => `/freights/${id}`,
  
  // Messages
  MESSAGES: '/messages',
  MESSAGE_BY_ID: (id: string) => `/messages/${id}`,
  CREATE_MESSAGE: '/messages',
  MARK_MESSAGE_READ: (id: string) => `/messages/${id}/read`,
  DELETE_MESSAGE: (id: string) => `/messages/${id}`,
  
  // Accounts & Transactions
  ACCOUNTS: '/accounts',
  ACCOUNT_BY_ID: (id: string) => `/accounts/${id}`,
  CREATE_ACCOUNT: '/accounts',
  UPDATE_ACCOUNT: (id: string) => `/accounts/${id}`,
  TRANSACTIONS: '/transactions',
  CREATE_TRANSACTION: '/transactions',
  
  // Payments
  PAYMENTS: '/payments',
  PAYMENT_BY_ID: (id: string) => `/payments/${id}`,
  CREATE_PAYMENT: '/payments',
  UPDATE_PAYMENT: (id: string) => `/payments/${id}`,
  
  // Reports
  REPORTS: '/reports',
  GENERATE_REPORT: '/reports/generate',
  SALES_REPORT: '/reports/sales',
  INVENTORY_REPORT: '/reports/inventory',
  FINANCIAL_REPORT: '/reports/financial',
  INCOME_STATEMENT: '/reports/income-statement',
  DASHBOARD_METRICS: '/reports/dashboard-metrics',
  
  // Sync
  SYNC_DATA: '/sync',
  SYNC_STATUS: '/sync/status',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_PREFERENCES: 'user_preferences',
  OFFLINE_DATA: 'offline_data',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync',
};