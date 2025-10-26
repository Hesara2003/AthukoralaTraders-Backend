const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const FulfillmentApi = {
  // Get all orders ready for fulfillment
  getOrdersForFulfillment: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.search) queryParams.append('search', filters.search);

    const response = await fetch(
      `${API_BASE}/api/fulfillment/orders?${queryParams.toString()}`,
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

  // Get order details for fulfillment
  getOrderFulfillmentDetails: async (orderId) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}`, {
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

  // Start picking process
  startPicking: async (orderId, staffId) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/pick/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ staffId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Update pick status for items
  updatePickStatus: async (orderId, itemId, status, quantity) => {
    const response = await fetch(
      `${API_BASE}/api/fulfillment/orders/${orderId}/pick/items/${itemId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ status, quantity })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Complete picking
  completePicking: async (orderId) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/pick/complete`, {
      method: 'POST',
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

  // Start packing process
  startPacking: async (orderId, staffId) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/pack/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ staffId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Update packing details
  updatePackingDetails: async (orderId, packingData) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/pack`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(packingData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Complete packing
  completePacking: async (orderId, packingDetails) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/pack/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(packingDetails)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Schedule delivery
  scheduleDelivery: async (orderId, deliveryData) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/delivery/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(deliveryData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Assign delivery driver
  assignDriver: async (orderId, driverId) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/delivery/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ driverId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Update delivery status
  updateDeliveryStatus: async (orderId, status, location, notes) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/delivery/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ status, location, notes })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Complete delivery
  completeDelivery: async (orderId, deliveryProof) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/delivery/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(deliveryProof)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get fulfillment statistics
  getFulfillmentStats: async (dateRange = {}) => {
    const queryParams = new URLSearchParams();
    if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
    if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);

    const response = await fetch(
      `${API_BASE}/api/fulfillment/stats?${queryParams.toString()}`,
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

  // Get picking list
  getPickingList: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.staffId) queryParams.append('staffId', filters.staffId);

    const response = await fetch(
      `${API_BASE}/api/fulfillment/picking-list?${queryParams.toString()}`,
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

  // Get packing queue
  getPackingQueue: async () => {
    const response = await fetch(`${API_BASE}/api/fulfillment/packing-queue`, {
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

  // Get delivery routes
  getDeliveryRoutes: async (date) => {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);

    const response = await fetch(
      `${API_BASE}/api/fulfillment/delivery-routes?${queryParams.toString()}`,
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

  // Print packing slip
  printPackingSlip: async (orderId) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/packing-slip`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  },

  // Print shipping label
  printShippingLabel: async (orderId) => {
    const response = await fetch(`${API_BASE}/api/fulfillment/orders/${orderId}/shipping-label`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }
};

// Fulfillment status constants
export const FulfillmentStatus = {
  PENDING: 'PENDING',
  PICKING: 'PICKING',
  PICKED: 'PICKED',
  PACKING: 'PACKING',
  PACKED: 'PACKED',
  READY_FOR_DELIVERY: 'READY_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

// Priority levels
export const Priority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};
