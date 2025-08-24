export const APP_CONFIG = {
  NAME: 'SMAS App',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  DESCRIPTION: 'Smart Management and Sales Application',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_PREFERENCES: 'user_preferences',
  OFFLINE_DATA: 'offline_data',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  PHONE_MIN_LENGTH: 10,
  EMAIL_MAX_LENGTH: 100,
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm',
};

export const CURRENCY_CONFIG = {
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_LOCALE: 'en-US',
  DECIMAL_PLACES: 2,
};

export const CHART_COLORS = [
  '#3182CE',
  '#38A169',
  '#805AD5',
  '#E53E3E',
  '#DD6B20',
  '#D69E2E',
  '#38B2AC',
  '#ED64A6',
];

export const BUSINESS_MODULES = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  SALES: 'sales',
  CUSTOMERS: 'customers',
  EXPENSES: 'expenses',
  PURCHASES: 'purchases',
  FREIGHT: 'freight',
  DEVICES: 'devices',
  SERVICES: 'services',
  DEBTS: 'debts',
  STORES: 'stores',
  MESSAGES: 'messages',
  TRANSACTIONS: 'transactions',
  PAYMENTS: 'payments',
  REPORTS: 'reports',
  STOCK: 'stock',
  ADMIN: 'admin',
  SETTINGS: 'settings',
};

export const SYNC_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // milliseconds
  BATCH_SIZE: 50,
  SYNC_INTERVAL: 300000, // 5 minutes
};

export const OFFLINE_CONFIG = {
  MAX_CACHE_SIZE: 100, // MB
  CACHE_EXPIRY: 86400000, // 24 hours in milliseconds
  CRITICAL_OPERATIONS: [
    'sales',
    'products',
    'customers',
    'stock_adjustments',
  ],
};