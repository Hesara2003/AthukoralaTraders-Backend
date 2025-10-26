const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const ReportsApi = {
  // Sales Reports
  getSalesReport: async (startDate, endDate) => {
    const response = await fetch(
      `${API_BASE}/api/reports/sales?startDate=${startDate}&endDate=${endDate}`,
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
      console.error('Sales Report Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getWeeklySalesReport: async () => {
    const response = await fetch(`${API_BASE}/api/reports/sales/weekly`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Weekly Sales Report Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getMonthlySalesReport: async () => {
    const response = await fetch(`${API_BASE}/api/reports/sales/monthly`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Monthly Sales Report Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getYearlySalesReport: async () => {
    const response = await fetch(`${API_BASE}/api/reports/sales/yearly`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Yearly Sales Report Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Inventory Reports
  getInventoryReport: async () => {
    const response = await fetch(`${API_BASE}/api/reports/inventory`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Inventory Report Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getLowStockReport: async () => {
    const response = await fetch(`${API_BASE}/api/reports/inventory/low-stock`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Low Stock Report Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getOutOfStockReport: async () => {
    const response = await fetch(`${API_BASE}/api/reports/inventory/out-of-stock`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Out of Stock Report Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Combined Summary
  getReportsSummary: async () => {
    const response = await fetch(`${API_BASE}/api/reports/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Reports Summary Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // =============== EXPORT FUNCTIONS ===============
  
  // Sales Report Exports
  exportSalesReportToCsv: async (startDate, endDate) => {
    const response = await fetch(
      `${API_BASE}/api/reports/sales/export/csv?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      console.error('Export Sales CSV Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  },

  exportSalesReportToPdf: async (startDate, endDate) => {
    const response = await fetch(
      `${API_BASE}/api/reports/sales/export/pdf?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      }
    );

    if (!response.ok) {
      console.error('Export Sales PDF Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  },

  exportWeeklySalesReportToCsv: async () => {
    const response = await fetch(`${API_BASE}/api/reports/sales/weekly/export/csv`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Export Weekly Sales CSV Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  },

  exportWeeklySalesReportToPdf: async () => {
    const response = await fetch(`${API_BASE}/api/reports/sales/weekly/export/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Export Weekly Sales PDF Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  },

  exportMonthlySalesReportToCsv: async () => {
    const response = await fetch(`${API_BASE}/api/reports/sales/monthly/export/csv`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Export Monthly Sales CSV Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  },

  exportMonthlySalesReportToPdf: async () => {
    const response = await fetch(`${API_BASE}/api/reports/sales/monthly/export/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Export Monthly Sales PDF Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  },

  exportYearlySalesReportToCsv: async () => {
    const response = await fetch(`${API_BASE}/api/reports/sales/yearly/export/csv`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Export Yearly Sales CSV Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  },

  exportYearlySalesReportToPdf: async () => {
    const response = await fetch(`${API_BASE}/api/reports/sales/yearly/export/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Export Yearly Sales PDF Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  },

  // Inventory Report Exports
  exportInventoryReportToCsv: async () => {
    const response = await fetch(`${API_BASE}/api/reports/inventory/export/csv`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Export Inventory CSV Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  },

  exportInventoryReportToPdf: async () => {
    const response = await fetch(`${API_BASE}/api/reports/inventory/export/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Export Inventory PDF Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }
};
