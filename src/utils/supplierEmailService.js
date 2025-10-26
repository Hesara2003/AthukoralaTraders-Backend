const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const SupplierEmailService = {
  // Send PO created notification
  sendPOCreatedNotification: async (poId, supplierId) => {
    const response = await fetch(`${API_BASE}/api/notifications/supplier/po-created`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ poId, supplierId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Send PO approved notification
  sendPOApprovedNotification: async (poId, supplierId) => {
    const response = await fetch(`${API_BASE}/api/notifications/supplier/po-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ poId, supplierId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Send PO cancelled notification
  sendPOCancelledNotification: async (poId, supplierId, reason) => {
    const response = await fetch(`${API_BASE}/api/notifications/supplier/po-cancelled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ poId, supplierId, reason })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Send PO modified notification
  sendPOModifiedNotification: async (poId, supplierId, changes) => {
    const response = await fetch(`${API_BASE}/api/notifications/supplier/po-modified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ poId, supplierId, changes })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Send payment received notification
  sendPaymentReceivedNotification: async (invoiceId, supplierId, amount) => {
    const response = await fetch(`${API_BASE}/api/notifications/supplier/payment-received`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ invoiceId, supplierId, amount })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Send delivery reminder
  sendDeliveryReminder: async (poId, supplierId, dueDate) => {
    const response = await fetch(`${API_BASE}/api/notifications/supplier/delivery-reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ poId, supplierId, dueDate })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Send quality issue notification
  sendQualityIssueNotification: async (grnId, supplierId, issueDetails) => {
    const response = await fetch(`${API_BASE}/api/notifications/supplier/quality-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ grnId, supplierId, issueDetails })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Send custom email to supplier
  sendCustomEmail: async (supplierId, emailData) => {
    const response = await fetch(`${API_BASE}/api/notifications/supplier/custom-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ supplierId, ...emailData })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get email notification history
  getNotificationHistory: async (supplierId, filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const response = await fetch(
      `${API_BASE}/api/notifications/supplier/${supplierId}/history?${queryParams.toString()}`,
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

  // Get notification preferences
  getNotificationPreferences: async (supplierId) => {
    const response = await fetch(
      `${API_BASE}/api/notifications/supplier/${supplierId}/preferences`,
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

  // Update notification preferences
  updateNotificationPreferences: async (supplierId, preferences) => {
    const response = await fetch(
      `${API_BASE}/api/notifications/supplier/${supplierId}/preferences`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(preferences)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Test email configuration
  sendTestEmail: async (supplierId, emailAddress) => {
    const response = await fetch(`${API_BASE}/api/notifications/supplier/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ supplierId, emailAddress })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};

// Email notification types
export const NotificationTypes = {
  PO_CREATED: 'PO_CREATED',
  PO_APPROVED: 'PO_APPROVED',
  PO_CANCELLED: 'PO_CANCELLED',
  PO_MODIFIED: 'PO_MODIFIED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  DELIVERY_REMINDER: 'DELIVERY_REMINDER',
  QUALITY_ISSUE: 'QUALITY_ISSUE',
  CUSTOM: 'CUSTOM'
};

export default SupplierEmailService;
