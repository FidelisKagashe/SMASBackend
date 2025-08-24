import { User, UserRole, Permission } from '../types';

export const hasPermission = (user: User, requiredPermission: string): boolean => {
  // Super admin has all permissions
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }
  
  // Check if user has the specific permission
  return user.permissions.some(permission => 
    permission.name === requiredPermission || 
    permission.action === 'manage'
  );
};

export const hasModuleAccess = (user: User, module: string): boolean => {
  // Super admin has access to all modules
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }
  
  // Check if user has any permission for the module
  return user.permissions.some(permission => permission.module === module);
};

export const canCreateUsers = (user: User): boolean => {
  return user.role === UserRole.SUPER_ADMIN || 
         user.role === UserRole.ADMIN || 
         user.role === UserRole.SHOP_OWNER;
};

export const canManageBranches = (user: User): boolean => {
  return user.role === UserRole.SUPER_ADMIN || 
         user.role === UserRole.ADMIN;
};

export const canAccessAdminPanel = (user: User): boolean => {
  return user.role === UserRole.SUPER_ADMIN || 
         user.role === UserRole.ADMIN || 
         user.role === UserRole.MANAGER ||
         user.role === UserRole.SHOP_OWNER;
};

export const canManageMultipleShops = (user: User): boolean => {
  return user.role === UserRole.SUPER_ADMIN || 
         user.role === UserRole.SHOP_OWNER;
};

export const getAccessibleModules = (user: User): string[] => {
  const allModules = [
    'dashboard',
    'products',
    'sales',
    'customers',
    'expenses',
    'purchases',
    'freight',
    'devices',
    'services',
    'debts',
    'stores',
    'messages',
    'transactions',
    'payments',
    'reports',
    'stock',
    'admin',
    'settings',
  ];

  // Super admin has access to all modules
  if (user.role === UserRole.SUPER_ADMIN) {
    return allModules;
  }

  // Filter modules based on user permissions
  return allModules.filter(module => hasModuleAccess(user, module));
};

export const getPermissionsByRole = (role: UserRole): Permission[] => {
  const basePermissions: Permission[] = [
    {
      id: 'dashboard-read',
      name: 'dashboard-read',
      module: 'dashboard',
      action: 'read',
      description: 'View dashboard',
    },
    {
      id: 'profile-read',
      name: 'profile-read',
      module: 'profile',
      action: 'read',
      description: 'View own profile',
    },
    {
      id: 'profile-update',
      name: 'profile-update',
      module: 'profile',
      action: 'update',
      description: 'Update own profile',
    },
  ];

  switch (role) {
    case UserRole.SUPER_ADMIN:
      return [
        ...basePermissions,
        {
          id: 'all-manage',
          name: 'all-manage',
          module: 'all',
          action: 'manage',
          description: 'Full system access',
        },
      ];

    case UserRole.ADMIN:
      return [
        ...basePermissions,
        {
          id: 'users-manage',
          name: 'users-manage',
          module: 'users',
          action: 'manage',
          description: 'Manage users',
        },
        {
          id: 'branches-manage',
          name: 'branches-manage',
          module: 'branches',
          action: 'manage',
          description: 'Manage branches',
        },
        {
          id: 'reports-read',
          name: 'reports-read',
          module: 'reports',
          action: 'read',
          description: 'View reports',
        },
      ];

    case UserRole.SHOP_OWNER:
      return [
        ...basePermissions,
        {
          id: 'shop-manage',
          name: 'shop-manage',
          module: 'shop',
          action: 'manage',
          description: 'Manage own shops',
        },
        {
          id: 'shop-users-create',
          name: 'shop-users-create',
          module: 'users',
          action: 'create',
          description: 'Create users for own shops',
        },
      ];

    case UserRole.MANAGER:
      return [
        ...basePermissions,
        {
          id: 'sales-manage',
          name: 'sales-manage',
          module: 'sales',
          action: 'manage',
          description: 'Manage sales',
        },
        {
          id: 'products-manage',
          name: 'products-manage',
          module: 'products',
          action: 'manage',
          description: 'Manage products',
        },
        {
          id: 'customers-manage',
          name: 'customers-manage',
          module: 'customers',
          action: 'manage',
          description: 'Manage customers',
        },
      ];

    case UserRole.EMPLOYEE:
      return [
        ...basePermissions,
        {
          id: 'sales-create',
          name: 'sales-create',
          module: 'sales',
          action: 'create',
          description: 'Create sales',
        },
        {
          id: 'products-read',
          name: 'products-read',
          module: 'products',
          action: 'read',
          description: 'View products',
        },
      ];

    case UserRole.CASHIER:
      return [
        ...basePermissions,
        {
          id: 'sales-create',
          name: 'sales-create',
          module: 'sales',
          action: 'create',
          description: 'Process sales',
        },
      ];

    case UserRole.ACCOUNTANT:
      return [
        ...basePermissions,
        {
          id: 'transactions-manage',
          name: 'transactions-manage',
          module: 'transactions',
          action: 'manage',
          description: 'Manage transactions',
        },
        {
          id: 'reports-read',
          name: 'reports-read',
          module: 'reports',
          action: 'read',
          description: 'View financial reports',
        },
      ];

    default:
      return basePermissions;
  }
};