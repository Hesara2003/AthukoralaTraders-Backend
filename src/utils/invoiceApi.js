const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const API_BASE_URL = `${API_BASE}/api/staff`;

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token' for consistency
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const invoiceApi = {
  // Get all invoices
  getAllInvoices: async () => {
    const response = await fetch(`${API_BASE_URL}/invoices/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Get invoice by ID
  getInvoiceById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Create new invoice (manual entry)
  createInvoice: async (invoiceData) => {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...invoiceData,
        source: 'manual',
        createdAt: new Date().toISOString()
      })
    });
    return handleApiResponse(response);
  },

  // Update existing invoice
  updateInvoice: async (id, invoiceData) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...invoiceData,
        updatedAt: new Date().toISOString()
      })
    });
    return handleApiResponse(response);
  },

  // Delete invoice
  deleteInvoice: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Upload and parse invoice file
  uploadInvoiceFile: async (file, metadata = {}, poId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata && Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify({
        ...metadata,
        source: 'parsed',
        uploadedAt: new Date().toISOString()
      }));
    }

    const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
    const url = new URL(`${API_BASE_URL}/invoices/upload`);
    if (poId) url.searchParams.append('poId', poId);
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    return handleApiResponse(response);
  },

  // Parse uploaded file (if separate from upload)
  parseInvoiceFile: async (fileId) => {
    const response = await fetch(`${API_BASE_URL}/invoices/parse/${fileId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Get invoice file/download original
  downloadInvoiceFile: async (id) => {
    const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/file`, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }
    
    return response.blob();
  },

  // Update invoice status
  updateInvoiceStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, updatedAt: new Date().toISOString() })
    });
    return handleApiResponse(response);
  },

  // Link invoice to purchase order
  linkToPurchaseOrder: async (invoiceId, poId) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/link-po`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ poId, updatedAt: new Date().toISOString() })
    });
    return handleApiResponse(response);
  },

  // Search invoices with filters
  searchInvoices: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}/invoices/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Get invoice statistics/summary
  getInvoiceStats: async (period = 'month') => {
    const response = await fetch(`${API_BASE_URL}/invoices/stats?period=${period}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Validate invoice data
  validateInvoiceData: async (invoiceData) => {
    const response = await fetch(`${API_BASE_URL}/invoices/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(invoiceData)
    });
    return handleApiResponse(response);
  },

  // Get invoice approval workflow
  getApprovalWorkflow: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/approval`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response);
  },

  // Submit invoice for approval
  submitForApproval: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ submittedAt: new Date().toISOString() })
    });
    return handleApiResponse(response);
  },

  // Approve invoice
  approveInvoice: async (id, comments = '') => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        comments,
        approvedAt: new Date().toISOString()
      })
    });
    return handleApiResponse(response);
  },

  // Reject invoice
  rejectInvoice: async (id, reason = '') => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        reason,
        rejectedAt: new Date().toISOString()
      })
    });
    return handleApiResponse(response);
  }
};

export default invoiceApi;