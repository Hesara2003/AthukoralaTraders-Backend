import axios from 'axios';

// Use consistent environment variable naming
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const API_BASE_URL = `${API_BASE}/api`;

class ReturnExchangeApi {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('ReturnExchangeApi initialized with baseURL:', this.baseURL);
  }

  // Get auth headers with JWT token
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found');
    }
    
    return headers;
  }

  // ==================== Admin/Staff Endpoints ====================

  /**
   * Fetch all orders eligible for return/exchange (STAFF and ADMIN only)
   * GET /api/admin/returns/eligible-orders
   */
  async getEligibleOrders() {
    try {
      const response = await axios.get(
        `${this.baseURL}/admin/returns/eligible-orders`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching eligible orders:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check eligibility of a specific order (STAFF and ADMIN only)
   * GET /api/admin/returns/eligible-orders/{orderId}
   */
  async checkOrderEligibility(orderId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/admin/returns/eligible-orders/${orderId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error checking order eligibility for ${orderId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all return/exchange requests (STAFF and ADMIN only)
   * GET /api/admin/returns
   */
  async getAllReturnExchanges() {
    try {
      const response = await axios.get(
        `${this.baseURL}/admin/returns`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all return/exchange requests:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get pending return/exchange requests (STAFF and ADMIN only)
   * GET /api/admin/returns/pending
   */
  async getPendingReturnExchanges() {
    try {
      const response = await axios.get(
        `${this.baseURL}/admin/returns/pending`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching pending return/exchange requests:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific return/exchange by ID (STAFF and ADMIN only)
   * GET /api/admin/returns/{id}
   */
  async getReturnExchangeById(id) {
    try {
      const response = await axios.get(
        `${this.baseURL}/admin/returns/${id}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching return/exchange ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Process a return/exchange request (update status) (STAFF and ADMIN only)
   * PUT /api/admin/returns/{id}/process
   */
  async processReturnExchange(id, status, notes = '') {
    try {
      const response = await axios.put(
        `${this.baseURL}/admin/returns/${id}/process`,
        { status, notes },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error processing return/exchange ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // ==================== Customer Endpoints ====================

  /**
   * Fetch eligible orders for the logged-in customer
   * GET /api/customer/returns/my-eligible-orders
   */
  async getMyEligibleOrders() {
    try {
      const response = await axios.get(
        `${this.baseURL}/customer/returns/my-eligible-orders`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching my eligible orders:', error);
      throw this.handleError(error);
    }
  }

  // ==================== Common Endpoints ====================

  /**
   * Create a new return/exchange request (Any authenticated user)
   * POST /api/returns
   */
  async createReturnExchange(returnExchangeData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/returns`,
        returnExchangeData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating return/exchange request:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a return/exchange request
   * DELETE /api/returns/{id}/cancel
   */
  async cancelReturnExchange(id) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/returns/${id}/cancel`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error canceling return/exchange ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    console.error('API Error Details:', {
      baseURL: this.baseURL,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('token'); // Clear invalid token
        return new Error('Authentication required. Please login again.');
      } else if (status === 403) {
        return new Error('Access denied. Insufficient permissions.');
      } else if (status === 404) {
        return new Error(data?.message || 'Resource not found.');
      } else if (status === 400) {
        return new Error(data?.message || 'Invalid request data.');
      } else if (status >= 500) {
        return new Error('Server error. Please try again later.');
      } else {
        return new Error(data?.message || `HTTP ${status}: An error occurred.`);
      }
    } else if (error.request) {
      // Request made but no response - likely network or CORS issue
      return new Error(`Network error: Unable to connect to ${this.baseURL}. Please check your connection or server status.`);
    } else {
      // Error in request setup
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }

  /**
   * Get status badge color
   */
  getStatusColor(status) {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      RECEIVED: 'bg-indigo-100 text-indigo-800',
      INSPECTING: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Format date to readable string
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Calculate total refund amount
   */
  calculateRefundAmount(items) {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }
}

// Export singleton instance
export default new ReturnExchangeApi();
