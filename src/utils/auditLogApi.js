const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const AuditLogApi = {
  // Get all audit logs with optional filters
  getAuditLogs: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.userId) queryParams.append('userId', filters.userId);
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.resource) queryParams.append('resource', filters.resource);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const response = await fetch(
      `${API_BASE}/api/audit-logs?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get audit log by ID
  getAuditLogById: async (logId) => {
    const response = await fetch(`${API_BASE}/api/audit-logs/${logId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Log an admin action
  logAction: async (actionData) => {
    const response = await fetch(`${API_BASE}/api/audit-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(actionData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get audit logs for a specific user
  getUserAuditLogs: async (userId, page = 1, limit = 50) => {
    const response = await fetch(
      `${API_BASE}/api/audit-logs/user/${userId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get audit logs for a specific resource
  getResourceAuditLogs: async (resourceType, resourceId, page = 1, limit = 50) => {
    const response = await fetch(
      `${API_BASE}/api/audit-logs/resource/${resourceType}/${resourceId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get audit log statistics
  getAuditLogStats: async (startDate, endDate) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(
      `${API_BASE}/api/audit-logs/stats?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Export audit logs to CSV
  exportToCSV: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.userId) queryParams.append('userId', filters.userId);
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.resource) queryParams.append('resource', filters.resource);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const response = await fetch(
      `${API_BASE}/api/audit-logs/export/csv?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  },

  // Export audit logs to PDF
  exportToPDF: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.userId) queryParams.append('userId', filters.userId);
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.resource) queryParams.append('resource', filters.resource);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const response = await fetch(
      `${API_BASE}/api/audit-logs/export/pdf?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }
};

// Action types constants
export const AuditActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  EXPORT: 'EXPORT',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  PROCESS: 'PROCESS',
  CANCEL: 'CANCEL'
};

// Resource types constants
export const AuditResources = {
  PRODUCT: 'PRODUCT',
  ORDER: 'ORDER',
  USER: 'USER',
  PURCHASE_ORDER: 'PURCHASE_ORDER',
  INVOICE: 'INVOICE',
  PROMOTION: 'PROMOTION',
  GRN: 'GRN',
  RETURN: 'RETURN',
  REPORT: 'REPORT',
  SETTINGS: 'SETTINGS'
};
