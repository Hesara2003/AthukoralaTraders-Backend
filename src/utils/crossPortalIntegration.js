const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

// Inventory Synchronization Service
export const InventorySyncService = {
  // Update inventory when PO is received
  updateInventoryFromPO: async (poId, grnData) => {
    const response = await fetch(`${API_BASE}/api/inventory/sync/po-received`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ poId, grnData })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Update inventory when order is fulfilled
  updateInventoryFromOrder: async (orderId, fulfillmentData) => {
    const response = await fetch(`${API_BASE}/api/inventory/sync/order-fulfilled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ orderId, fulfillmentData })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Update inventory when return is processed
  updateInventoryFromReturn: async (returnId, returnData) => {
    const response = await fetch(`${API_BASE}/api/inventory/sync/return-processed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ returnId, returnData })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Manual inventory adjustment
  adjustInventory: async (adjustmentData) => {
    const response = await fetch(`${API_BASE}/api/inventory/sync/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(adjustmentData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get inventory sync log
  getSyncLog: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.productId) queryParams.append('productId', filters.productId);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.syncType) queryParams.append('syncType', filters.syncType);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const response = await fetch(
      `${API_BASE}/api/inventory/sync/log?${queryParams.toString()}`,
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

  // Trigger full inventory sync
  triggerFullSync: async () => {
    const response = await fetch(`${API_BASE}/api/inventory/sync/full`, {
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

  // Get sync status
  getSyncStatus: async () => {
    const response = await fetch(`${API_BASE}/api/inventory/sync/status`, {
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

  // Resolve sync conflicts
  resolveSyncConflict: async (conflictId, resolution) => {
    const response = await fetch(`${API_BASE}/api/inventory/sync/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(resolution)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};

// Real-time Stock Service (WebSocket or Polling)
export class RealTimeStockService {
  constructor() {
    this.subscribers = new Map();
    this.pollingInterval = null;
    this.pollingFrequency = 5000; // 5 seconds
    this.isActive = false;
  }

  // Subscribe to product stock updates
  subscribe(productId, callback) {
    if (!this.subscribers.has(productId)) {
      this.subscribers.set(productId, new Set());
    }
    this.subscribers.get(productId).add(callback);

    // Start polling if not already active
    if (!this.isActive) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => this.unsubscribe(productId, callback);
  }

  // Unsubscribe from updates
  unsubscribe(productId, callback) {
    if (this.subscribers.has(productId)) {
      this.subscribers.get(productId).delete(callback);
      if (this.subscribers.get(productId).size === 0) {
        this.subscribers.delete(productId);
      }
    }

    // Stop polling if no more subscribers
    if (this.subscribers.size === 0) {
      this.stopPolling();
    }
  }

  // Start polling for updates
  startPolling() {
    if (this.isActive) return;

    this.isActive = true;
    this.pollingInterval = setInterval(() => {
      this.fetchUpdates();
    }, this.pollingFrequency);

    console.log('📡 Real-time stock monitoring started');
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isActive = false;
    console.log('📡 Real-time stock monitoring stopped');
  }

  // Fetch updates for subscribed products
  async fetchUpdates() {
    if (this.subscribers.size === 0) return;

    const productIds = Array.from(this.subscribers.keys());

    try {
      const response = await fetch(`${API_BASE}/api/inventory/stock/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ productIds })
      });

      if (response.ok) {
        const stockData = await response.json();
        this.notifySubscribers(stockData);
      }
    } catch (error) {
      console.error('Error fetching stock updates:', error);
    }
  }

  // Notify all subscribers of updates
  notifySubscribers(stockData) {
    if (!stockData || !stockData.products) return;

    stockData.products.forEach(product => {
      const callbacks = this.subscribers.get(product.id);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(product);
          } catch (error) {
            console.error('Error in stock update callback:', error);
          }
        });
      }
    });
  }

  // Get current stock for a product
  async getCurrentStock(productId) {
    const response = await fetch(`${API_BASE}/api/inventory/stock/${productId}`, {
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
  }

  // Set polling frequency
  setPollingFrequency(milliseconds) {
    this.pollingFrequency = Math.max(1000, milliseconds); // Min 1 second
    
    if (this.isActive) {
      this.stopPolling();
      this.startPolling();
    }
  }

  // Clean up
  destroy() {
    this.stopPolling();
    this.subscribers.clear();
  }
}

// Price Update Service (from promotions)
export const PriceUpdateService = {
  // Apply active promotions to products
  applyPromotionPrices: async () => {
    const response = await fetch(`${API_BASE}/api/prices/apply-promotions`, {
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

  // Get effective price for product
  getEffectivePrice: async (productId, quantity = 1) => {
    const response = await fetch(
      `${API_BASE}/api/prices/effective/${productId}?quantity=${quantity}`,
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

  // Get bulk effective prices
  getBulkEffectivePrices: async (products) => {
    const response = await fetch(`${API_BASE}/api/prices/effective/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ products })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get active promotions for product
  getActivePromotions: async (productId) => {
    const response = await fetch(`${API_BASE}/api/prices/promotions/${productId}`, {
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

  // Schedule promotion activation
  schedulePromotionActivation: async (promotionId) => {
    const response = await fetch(`${API_BASE}/api/prices/promotions/${promotionId}/schedule`, {
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

  // Get price history
  getPriceHistory: async (productId, startDate, endDate) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(
      `${API_BASE}/api/prices/history/${productId}?${queryParams.toString()}`,
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

// Singleton instance for real-time stock service
const realTimeStockService = new RealTimeStockService();

export default {
  InventorySyncService,
  RealTimeStockService: realTimeStockService,
  PriceUpdateService
};
