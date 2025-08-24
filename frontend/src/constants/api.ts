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
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCT_SEARCH: '/products/search',
  PRODUCT_CATEGORIES: '/products/categories',
  
  // Sales
  SALES: '/sales',
  SALE_BY_ID: (id: string) => `/sales/${id}`,
  CREATE_SALE: '/sales',
  UPDATE_SALE: (id: string) => `/sales/${id}`,
  
  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,
  CREATE_CUSTOMER: '/customers',
  UPDATE_CUSTOMER: (id: string) => `/customers/${id}`,
  
  // Purchases
  PURCHASES: '/purchases',
  PURCHASE_BY_ID: (id: string) => `/purchases/${id}`,
  CREATE_PURCHASE: '/purchases',
  
  // Reports
  SALES_REPORT: '/reports/sales',
  INVENTORY_REPORT: '/reports/inventory',
  FINANCIAL_REPORT: '/reports/financial',
  
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