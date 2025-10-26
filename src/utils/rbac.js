// Role-Based Access Control (RBAC) Configuration

export const Roles = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  FINANCE: 'FINANCE',
  SUPPLIER: 'SUPPLIER',
  CUSTOMER: 'CUSTOMER'
};

export const Permissions = {
  // Product Management
  PRODUCT_VIEW: 'PRODUCT_VIEW',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  
  // Order Management
  ORDER_VIEW: 'ORDER_VIEW',
  ORDER_CREATE: 'ORDER_CREATE',
  ORDER_UPDATE: 'ORDER_UPDATE',
  ORDER_CANCEL: 'ORDER_CANCEL',
  ORDER_FULFILL: 'ORDER_FULFILL',
  
  // Purchase Orders
  PO_VIEW: 'PO_VIEW',
  PO_CREATE: 'PO_CREATE',
  PO_UPDATE: 'PO_UPDATE',
  PO_APPROVE: 'PO_APPROVE',
  PO_RECEIVE: 'PO_RECEIVE',
  
  // Inventory Management
  INVENTORY_VIEW: 'INVENTORY_VIEW',
  INVENTORY_UPDATE: 'INVENTORY_UPDATE',
  INVENTORY_AUDIT: 'INVENTORY_AUDIT',
  
  // User Management
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  
  // Financial
  FINANCE_VIEW: 'FINANCE_VIEW',
  FINANCE_APPROVE: 'FINANCE_APPROVE',
  INVOICE_CREATE: 'INVOICE_CREATE',
  INVOICE_UPDATE: 'INVOICE_UPDATE',
  PAYMENT_PROCESS: 'PAYMENT_PROCESS',
  
  // Reports & Analytics
  REPORT_VIEW: 'REPORT_VIEW',
  REPORT_EXPORT: 'REPORT_EXPORT',
  AUDIT_LOG_VIEW: 'AUDIT_LOG_VIEW',
  
  // Promotions
  PROMOTION_VIEW: 'PROMOTION_VIEW',
  PROMOTION_CREATE: 'PROMOTION_CREATE',
  PROMOTION_UPDATE: 'PROMOTION_UPDATE',
  PROMOTION_DELETE: 'PROMOTION_DELETE',
  
  // Returns & Exchanges
  RETURN_VIEW: 'RETURN_VIEW',
  RETURN_PROCESS: 'RETURN_PROCESS',
  
  // Supplier Management
  SUPPLIER_VIEW: 'SUPPLIER_VIEW',
  SUPPLIER_UPDATE: 'SUPPLIER_UPDATE',
  
  // System Settings
  SETTINGS_VIEW: 'SETTINGS_VIEW',
  SETTINGS_UPDATE: 'SETTINGS_UPDATE'
};

// Role-Permission Mapping
export const RolePermissions = {
  [Roles.ADMIN]: [
    // Full access to everything
    ...Object.values(Permissions)
  ],
  
  [Roles.STAFF]: [
    // Product Management
    Permissions.PRODUCT_VIEW,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_UPDATE,
    
    // Order Management
    Permissions.ORDER_VIEW,
    Permissions.ORDER_CREATE,
    Permissions.ORDER_UPDATE,
    Permissions.ORDER_FULFILL,
    
    // Purchase Orders
    Permissions.PO_VIEW,
    Permissions.PO_CREATE,
    Permissions.PO_RECEIVE,
    
    // Inventory
    Permissions.INVENTORY_VIEW,
    Permissions.INVENTORY_UPDATE,
    
    // Returns
    Permissions.RETURN_VIEW,
    Permissions.RETURN_PROCESS,
    
    // Basic Reports
    Permissions.REPORT_VIEW
  ],
  
  [Roles.FINANCE]: [
    // Financial Operations
    Permissions.FINANCE_VIEW,
    Permissions.FINANCE_APPROVE,
    Permissions.INVOICE_CREATE,
    Permissions.INVOICE_UPDATE,
    Permissions.PAYMENT_PROCESS,
    
    // Purchase Orders (approval)
    Permissions.PO_VIEW,
    Permissions.PO_APPROVE,
    
    // Reports
    Permissions.REPORT_VIEW,
    Permissions.REPORT_EXPORT,
    Permissions.AUDIT_LOG_VIEW,
    
    // View-only access
    Permissions.PRODUCT_VIEW,
    Permissions.ORDER_VIEW,
    Permissions.INVENTORY_VIEW,
    Permissions.USER_VIEW
  ],
  
  [Roles.SUPPLIER]: [
    // Supplier-specific permissions
    Permissions.SUPPLIER_VIEW,
    Permissions.SUPPLIER_UPDATE,
    Permissions.PO_VIEW,
    Permissions.PRODUCT_VIEW,
    Permissions.INVOICE_CREATE,
    Permissions.REPORT_VIEW
  ],
  
  [Roles.CUSTOMER]: [
    // Customer-facing permissions
    Permissions.PRODUCT_VIEW,
    Permissions.ORDER_VIEW,
    Permissions.ORDER_CREATE,
    Permissions.ORDER_CANCEL,
    Permissions.RETURN_VIEW
  ]
};

// Permission Checker Class
export class PermissionChecker {
  constructor(userRole, customPermissions = []) {
    this.userRole = userRole;
    this.permissions = new Set([
      ...(RolePermissions[userRole] || []),
      ...customPermissions
    ]);
  }

  hasPermission(permission) {
    return this.permissions.has(permission);
  }

  hasAnyPermission(permissions) {
    return permissions.some(permission => this.permissions.has(permission));
  }

  hasAllPermissions(permissions) {
    return permissions.every(permission => this.permissions.has(permission));
  }

  isAdmin() {
    return this.userRole === Roles.ADMIN;
  }

  isStaff() {
    return this.userRole === Roles.STAFF;
  }

  isFinance() {
    return this.userRole === Roles.FINANCE;
  }

  isSupplier() {
    return this.userRole === Roles.SUPPLIER;
  }

  isCustomer() {
    return this.userRole === Roles.CUSTOMER;
  }
}

// Helper function to create permission checker
export const createPermissionChecker = (user) => {
  if (!user || !user.role) {
    return new PermissionChecker(Roles.CUSTOMER, []);
  }
  
  return new PermissionChecker(
    user.role,
    user.customPermissions || []
  );
};

// React Hook for permissions
export const usePermissions = (user) => {
  const checker = createPermissionChecker(user);
  
  return {
    hasPermission: (permission) => checker.hasPermission(permission),
    hasAnyPermission: (permissions) => checker.hasAnyPermission(permissions),
    hasAllPermissions: (permissions) => checker.hasAllPermissions(permissions),
    isAdmin: () => checker.isAdmin(),
    isStaff: () => checker.isStaff(),
    isFinance: () => checker.isFinance(),
    isSupplier: () => checker.isSupplier(),
    isCustomer: () => checker.isCustomer(),
    can: (permission) => checker.hasPermission(permission)
  };
};

// Route-Permission Mapping for Protected Routes
export const RoutePermissions = {
  // Admin Routes
  '/admin': [Permissions.REPORT_VIEW],
  '/admin/products': [Permissions.PRODUCT_VIEW],
  '/admin/products/new': [Permissions.PRODUCT_CREATE],
  '/admin/products/:id/edit': [Permissions.PRODUCT_UPDATE],
  '/admin/orders': [Permissions.ORDER_VIEW],
  '/admin/users': [Permissions.USER_VIEW],
  '/admin/reports': [Permissions.REPORT_VIEW],
  '/admin/audit-logs': [Permissions.AUDIT_LOG_VIEW],
  '/admin/promotions': [Permissions.PROMOTION_VIEW],
  '/admin/purchase-orders': [Permissions.PO_VIEW],
  '/admin/grn': [Permissions.PO_RECEIVE],
  '/admin/invoices': [Permissions.FINANCE_VIEW],
  
  // Staff Routes
  '/staff': [Permissions.ORDER_VIEW],
  '/staff/pos': [Permissions.ORDER_CREATE],
  '/staff/returns': [Permissions.RETURN_PROCESS],
  '/staff/fulfillment': [Permissions.ORDER_FULFILL],
  '/staff/delivery': [Permissions.ORDER_FULFILL],
  
  // Finance Routes
  '/finance': [Permissions.FINANCE_VIEW],
  '/finance/invoices': [Permissions.INVOICE_CREATE],
  '/finance/payments': [Permissions.PAYMENT_PROCESS],
  '/finance/reports': [Permissions.REPORT_VIEW],
  
  // Supplier Routes
  '/supplier': [Permissions.SUPPLIER_VIEW],
  '/supplier/products': [Permissions.PRODUCT_VIEW],
  '/supplier/orders': [Permissions.PO_VIEW],
  '/supplier/invoices': [Permissions.INVOICE_CREATE]
};

export default {
  Roles,
  Permissions,
  RolePermissions,
  PermissionChecker,
  createPermissionChecker,
  usePermissions,
  RoutePermissions
};
