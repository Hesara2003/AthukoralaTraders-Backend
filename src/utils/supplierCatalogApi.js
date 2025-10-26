const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const SupplierCatalogApi = {
  // Upload catalog file (CSV/Excel)
  uploadCatalog: async (file, supplierId, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('supplierId', supplierId);
    if (options.replaceExisting) {
      formData.append('replaceExisting', 'true');
    }
    if (options.autoApprove) {
      formData.append('autoApprove', 'true');
    }

    const response = await fetch(`${API_BASE}/api/suppliers/catalog/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get catalog import history
  getImportHistory: async (supplierId, page = 1, limit = 20) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/catalog/history?page=${page}&limit=${limit}`,
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

  // Get import details by ID
  getImportDetails: async (importId) => {
    const response = await fetch(`${API_BASE}/api/suppliers/catalog/imports/${importId}`, {
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

  // Sync catalog with system
  syncCatalog: async (supplierId, syncOptions = {}) => {
    const response = await fetch(`${API_BASE}/api/suppliers/${supplierId}/catalog/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(syncOptions)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get sync status
  getSyncStatus: async (supplierId) => {
    const response = await fetch(`${API_BASE}/api/suppliers/${supplierId}/catalog/sync/status`, {
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

  // Get supplier products
  getSupplierProducts: async (supplierId, filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/products?${queryParams.toString()}`,
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

  // Add product to catalog
  addProduct: async (supplierId, productData) => {
    const response = await fetch(`${API_BASE}/api/suppliers/${supplierId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Update product in catalog
  updateProduct: async (supplierId, productId, productData) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/products/${productId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Delete product from catalog
  deleteProduct: async (supplierId, productId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/products/${productId}`,
      {
        method: 'DELETE',
        headers: {
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

  // Bulk update prices
  bulkUpdatePrices: async (supplierId, priceUpdates) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/products/bulk-update-prices`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ updates: priceUpdates })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Bulk update stock
  bulkUpdateStock: async (supplierId, stockUpdates) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/products/bulk-update-stock`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ updates: stockUpdates })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Download catalog template
  downloadTemplate: async (format = 'csv') => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/catalog/template?format=${format}`,
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

  // Export current catalog
  exportCatalog: async (supplierId, format = 'csv') => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/catalog/export?format=${format}`,
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

  // Validate catalog file before import
  validateCatalog: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/suppliers/catalog/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get catalog statistics
  getCatalogStats: async (supplierId) => {
    const response = await fetch(`${API_BASE}/api/suppliers/${supplierId}/catalog/stats`, {
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

  // Get price history
  getPriceHistory: async (supplierId, productId) => {
    const response = await fetch(
      `${API_BASE}/api/suppliers/${supplierId}/products/${productId}/price-history`,
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
  }
};

export default SupplierCatalogApi;
