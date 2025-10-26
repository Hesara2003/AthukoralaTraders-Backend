// Simple Orders API client
import { handleOrderStatusChange } from './notificationService';

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

export async function getOrdersByUsername(username) {
  if (!username) throw new Error('Username is required');
  const url = `${API_BASE}/api/customer/orders/by-username?username=${encodeURIComponent(username)}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    },
    credentials: 'include'
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to load orders (${res.status}): ${text}`);
  }
  return res.json();
}

export async function getOrdersByCustomerId(customerId) {
  if (!customerId) throw new Error('customerId is required');
  const url = `${API_BASE}/api/customer/orders?customerId=${encodeURIComponent(customerId)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load orders by customerId (${res.status})`);
  return res.json();
}

export async function getOrderById(orderId) {
  if (!orderId) throw new Error('orderId is required');
  const url = `${API_BASE}/api/customer/orders/${encodeURIComponent(orderId)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load order (${res.status})`);
  return res.json();
}

/**
 * Update order status and trigger notifications
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status of the order
 * @param {Object} options - Additional options (e.g., tracking number)
 * @returns {Promise<Object>} Updated order data
 */
export async function updateOrderStatus(orderId, newStatus, options = {}) {
  if (!orderId) throw new Error('orderId is required');
  if (!newStatus) throw new Error('newStatus is required');

  // Update order status in the backend
  const url = `${API_BASE}/api/customer/orders/${encodeURIComponent(orderId)}/status`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ status: newStatus, ...options })
  });

  if (!res.ok) {
    throw new Error(`Failed to update order status (${res.status})`);
  }

  // Get updated order data
  const updatedOrder = await res.json();

  // Trigger notifications
  try {
    await handleOrderStatusChange(orderId, newStatus, options);
  } catch (error) {
    console.error('Failed to send notifications:', error);
    // Don't throw here - we don't want to roll back the status update if notifications fail
  }

  return updatedOrder;
}

/**
 * Place a new order and send confirmation
 * @param {Object} orderData - Order data including items, shipping details, etc.
 * @returns {Promise<Object>} Created order data
 */
export async function createOrder(orderData) {
  const url = `${API_BASE}/api/customer/orders`;
  
  console.log('[orderApi] Creating order at:', url);
  console.log('[orderApi] Order payload:', orderData);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(orderData)
  });

  if (!res.ok) {
    let errorMessage = `Failed to create order (${res.status})`;
    let errorDetails = null;
    
    try {
      const errorData = await res.text();
      console.error('[orderApi] Error response:', errorData);
      errorDetails = errorData;
      
      // Try to parse as JSON for more details
      try {
        const jsonError = JSON.parse(errorData);
        errorMessage = jsonError.message || jsonError.error || errorMessage;
      } catch (e) {
        // Not JSON, use text
        if (errorData) errorMessage = errorData;
      }
    } catch (e) {
      console.error('[orderApi] Could not read error response:', e);
    }
    
    const error = new Error(errorMessage);
    error.response = { data: errorDetails, status: res.status };
    throw error;
  }

  const newOrder = await res.json();
  console.log('[orderApi] Order created successfully:', newOrder);

  // Send order confirmation notification
  try {
    await handleOrderStatusChange(newOrder.id, 'PROCESSING', {
      isNewOrder: true,
      ...newOrder
    });
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
    // Don't throw here - we don't want to roll back the order if notification fails
  }

  return newOrder;
}
