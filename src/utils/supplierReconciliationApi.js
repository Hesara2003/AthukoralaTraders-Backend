const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const SupplierReconciliationApi = {
  // Get reconciliation dashboard data
  getReconciliationDashboard: async (supplierId, dateRange = {}) => {
    const queryParams = new URLSearchParams();
    if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
    if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);

    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/reconciliation/dashboard?${queryParams.toString()}`,
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

  // Get reconciliation report
  getReconciliationReport: async (supplierId, filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.includeMatched) queryParams.append('includeMatched', filters.includeMatched);

    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/reconciliation/report?${queryParams.toString()}`,
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

  // Get PO vs Delivery comparison
  getPODeliveryComparison: async (poId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/reconciliation/po/${poId}/comparison`,
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

  // Get discrepancy list
  getDiscrepancies: async (supplierId, filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type); // QUANTITY, PRICE, MISSING
    if (filters.severity) queryParams.append('severity', filters.severity);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/reconciliation/discrepancies?${queryParams.toString()}`,
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

  // Resolve discrepancy
  resolveDiscrepancy: async (discrepancyId, resolution) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/reconciliation/discrepancies/${discrepancyId}/resolve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(resolution)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get payment status
  getPaymentStatus: async (supplierId, filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.status) queryParams.append('status', filters.status);

    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/reconciliation/payments?${queryParams.toString()}`,
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

  // Get outstanding balance
  getOutstandingBalance: async (supplierId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/reconciliation/balance`,
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

  // Export reconciliation report
  exportReconciliationReport: async (supplierId, format = 'csv', filters = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/reconciliation/export?${queryParams.toString()}`,
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

    if (format === 'csv') {
      return await response.text();
    }
    
    return await response.blob();
  },

  // Generate reconciliation statement
  generateStatement: async (supplierId, dateRange) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/reconciliation/statement`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(dateRange)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};

export const InvoicePOMatchingApi = {
  // Get unmatched invoices
  getUnmatchedInvoices: async (supplierId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/invoices/unmatched`,
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

  // Get unmatched POs
  getUnmatchedPOs: async (supplierId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/purchase-orders/unmatched`,
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

  // Auto-match invoice to PO
  autoMatchInvoice: async (invoiceId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/invoices/${invoiceId}/auto-match`,
      {
        method: 'POST',
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

  // Manual match invoice to PO
  manualMatchInvoice: async (invoiceId, poId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/invoices/${invoiceId}/match`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ poId })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get match suggestions
  getMatchSuggestions: async (invoiceId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/invoices/${invoiceId}/match-suggestions`,
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

  // Compare invoice with PO
  compareInvoiceWithPO: async (invoiceId, poId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/invoices/${invoiceId}/compare/${poId}`,
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

  // Unmatch invoice from PO
  unmatchInvoice: async (invoiceId, reason) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/invoices/${invoiceId}/unmatch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get matched invoices
  getMatchedInvoices: async (supplierId, filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/invoices/matched?${queryParams.toString()}`,
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

  // Get matching statistics
  getMatchingStats: async (supplierId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/matching/stats`,
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

  // Validate invoice data
  validateInvoice: async (invoiceId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/invoices/${invoiceId}/validate`,
      {
        method: 'POST',
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
  }
};

// Discrepancy types
export const DiscrepancyTypes = {
  QUANTITY_MISMATCH: 'QUANTITY_MISMATCH',
  PRICE_MISMATCH: 'PRICE_MISMATCH',
  MISSING_ITEMS: 'MISSING_ITEMS',
  EXTRA_ITEMS: 'EXTRA_ITEMS',
  DAMAGED_GOODS: 'DAMAGED_GOODS'
};

// Discrepancy severity
export const DiscrepancySeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export default {
  SupplierReconciliationApi,
  InvoicePOMatchingApi,
  DiscrepancyTypes,
  DiscrepancySeverity
};
