// Notification service for handling order status updates and notifications
import { getOrderById } from './orderApi';
import { generateDeliveryEmail } from './emailTemplates';
import { formatDate } from './dateUtils';

// Backend notifications endpoint
const NOTIFICATIONS_ENDPOINT = '/api/notifications';

// Constants for notification types and retry configuration
export const NOTIFICATION_TYPES = {
  ORDER_STATUS: 'ORDER_STATUS',
  DELIVERY_UPDATE: 'DELIVERY_UPDATE',
  GENERAL: 'GENERAL'
};

export const ORDER_STATUSES = {
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERY_ATTEMPTED: 'DELIVERY_ATTEMPTED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Send an email notification with retry mechanism
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body content (HTML supported)
 * @param {number} retries - Number of retries remaining
 * @returns {Promise} - Resolves when email is sent
 */
async function sendEmail({ to, subject, body }, retries = MAX_RETRIES) {
  try {
    const response = await fetch(NOTIFICATIONS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Backend expects { recipient, subject, body }
      body: JSON.stringify({ recipient: to, subject, body }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email notification:', error);
    
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendEmail({ to, subject, body }, retries - 1);
    }
    
    throw error;
  }
}

// Note: Using shared date formatter from './dateUtils'

/**
 * Generate delivery status message
 * @param {Object} order - Order details
 * @returns {string} Formatted delivery status message
 */
function generateDeliveryStatusMessage(order) {
  const {
    estimatedDeliveryDate,
    deliveryAttempts = [],
    currentLocation,
    deliveryInstructions,
  } = order;

  let message = '';

  if (estimatedDeliveryDate) {
    message += `<p>Estimated Delivery: <strong>${formatDate(estimatedDeliveryDate)}</strong></p>`;
  }

  if (currentLocation) {
    message += `<p>Current Location: ${currentLocation}</p>`;
  }

  if (deliveryAttempts && deliveryAttempts.length > 0) {
    message += `<h3>Delivery Attempts:</h3>
    <ul>
      ${deliveryAttempts.map(attempt => `
        <li>
          <strong>${formatDate(attempt.date)}</strong>: ${attempt.status}
          ${attempt.notes ? `<br><em>Note: ${attempt.notes}</em>` : ''}
        </li>
      `).join('')}
    </ul>`;
  }

  if (deliveryInstructions) {
    message += `<p><strong>Delivery Instructions:</strong> ${deliveryInstructions}</p>`;
  }

  return message;
}

/**
 * Generate email content for order status update
 * @param {Object} order - Order details
 * @param {string} status - New order status
 * @returns {Object} - Email subject and body
 */
function generateOrderStatusEmailContent(order, status) {
  const statusMessages = {
    PROCESSING: {
      subject: 'Your Order is Being Processed',
      body: `
        <h2>Your Order #${order.id} is Being Processed</h2>
        <p>We're preparing your items for shipment. We'll notify you once your order is shipped.</p>
        ${order.estimatedDeliveryDate ? `
          <p>Based on your location, estimated delivery by: <strong>${formatDate(order.estimatedDeliveryDate)}</strong></p>
        ` : ''}
      `
    },
    SHIPPED: {
      subject: 'Your Order Has Been Shipped',
      body: `
        <h2>Your Order #${order.id} Has Been Shipped!</h2>
        <p>Your order is on its way to you. We'll update you when it's delivered.</p>
        ${order.trackingNumber ? `<p>Tracking Number: <strong>${order.trackingNumber}</strong></p>` : ''}
        ${generateDeliveryStatusMessage(order)}
      `
    },
    OUT_FOR_DELIVERY: {
      subject: 'Your Order is Out for Delivery',
      body: `
        <h2>Your Order #${order.id} is Out for Delivery!</h2>
        <p>Your order will be delivered today. Please ensure someone is available to receive it.</p>
        ${generateDeliveryStatusMessage(order)}
      `
    },
    DELIVERY_ATTEMPTED: {
      subject: 'Delivery Attempted - Action Required',
      body: `
        <h2>Delivery Attempted for Order #${order.id}</h2>
        <p>We attempted to deliver your order but were unable to complete the delivery.</p>
        ${generateDeliveryStatusMessage(order)}
        <p>Next Steps: ${order.nextDeliveryAttempt ? `We will attempt delivery again on ${formatDate(order.nextDeliveryAttempt)}` : 'Please contact our support team to arrange redelivery.'}</p>
      `
    },
    DELIVERED: {
      subject: 'Your Order Has Been Delivered',
      body: `
        <h2>Your Order #${order.id} Has Been Delivered</h2>
        <p>Your order has been successfully delivered. Thank you for shopping with us!</p>
        ${generateDeliveryStatusMessage(order)}
        ${order.signature ? `<p>Signed for by: ${order.signature}</p>` : ''}
      `
    },
    CANCELLED: {
      subject: 'Your Order Has Been Cancelled',
      body: `
        <h2>Your Order #${order.id} Has Been Cancelled</h2>
        <p>Your order has been cancelled. If you didn't request this cancellation, please contact our support team.</p>
        <p>Reason: ${order.cancellationReason || 'Not specified'}</p>
      `
    }
  };

  return statusMessages[status] || {
    subject: `Order #${order.id} Status Update`,
    body: `<h2>Order #${order.id} Status: ${status}</h2>`
  };
}

/**
 * Calculate next business day
 * @returns {Date} Next business day
 */
function calculateNextBusinessDay() {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Skip weekends
  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
}

/**
 * Calculate estimated delivery date based on shipping method and location
 * @param {Object} order - Order details
 * @returns {Date} Estimated delivery date
 */
function calculateEstimatedDelivery(order) {
  const { shippingMethod, deliveryLocation } = order;
  const now = new Date();
  
  // Default to 3-5 business days
  let daysToAdd = 3;

  // Adjust based on shipping method
  switch (shippingMethod?.toLowerCase()) {
    case 'express':
      daysToAdd = 1;
      break;
    case 'standard':
      daysToAdd = 3;
      break;
    case 'economy':
      daysToAdd = 5;
      break;
  }

  // Add extra days for remote locations (if location info is available)
  if (deliveryLocation?.type === 'remote') {
    daysToAdd += 2;
  }

  const estimatedDate = new Date(now);
  estimatedDate.setDate(now.getDate() + daysToAdd);

  // Adjust for weekends
  while (estimatedDate.getDay() === 0 || estimatedDate.getDay() === 6) {
    estimatedDate.setDate(estimatedDate.getDate() + 1);
  }

  return estimatedDate;
}

/**
 * Send a notification through the notification service
 * @param {Object} notification The notification object to send
 * @param {number} retries Number of retries remaining
 * @returns {Promise<Object>} Result of the send operation
 */
export async function sendNotification(notification, retries = MAX_RETRIES) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, ...result };
  } catch (error) {
    console.error('Error sending notification:', error);

    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendNotification(notification, retries - 1);
    }
    
    throw error;
  }
}

/**
 * Create a notification template based on the notification type and data
 * @param {Object} data Notification data
 * @param {string} type Notification type
 * @returns {Object} Notification template
 */
export function createNotificationTemplate(data, type) {
  switch (type) {
    case ORDER_STATUSES.PROCESSING:
      return {
        type: NOTIFICATION_TYPES.ORDER_STATUS,
        recipient: data.customerEmail,
        subject: `Order #${data.id} is Being Processed`,
        body: generateOrderStatusEmailContent(data, type).body
      };
      
    case ORDER_STATUSES.SHIPPED:
      return {
        type: NOTIFICATION_TYPES.ORDER_STATUS,
        recipient: data.customerEmail,
        subject: `Order #${data.id} Has Been Shipped`,
        body: generateOrderStatusEmailContent(data, type).body
      };
      
    case ORDER_STATUSES.DELIVERY_ATTEMPTED:
      return {
        type: NOTIFICATION_TYPES.DELIVERY_UPDATE,
        recipient: data.customerEmail,
        subject: `Action Required: Delivery Attempt for Order #${data.id}`,
        body: generateOrderStatusEmailContent(data, type).body
      };
      
    case ORDER_STATUSES.DELIVERED:
      return {
        type: NOTIFICATION_TYPES.ORDER_STATUS,
        recipient: data.customerEmail,
        subject: `Order #${data.id} Has Been Delivered`,
        body: generateOrderStatusEmailContent(data, type).body
      };
      
    default:
      return {
        type: NOTIFICATION_TYPES.GENERAL,
        recipient: data.customerEmail,
        subject: `Order #${data.id} Update`,
        body: generateOrderStatusEmailContent(data, type).body
      };
  }
}

/**
 * Handle order status change and send appropriate notifications
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New order status
 * @param {Object} options - Additional options (e.g., tracking number, location update)
 * @returns {Promise} - Resolves when notifications are sent
 */
export async function handleOrderStatusChange(orderId, newStatus, options = {}) {
  try {
    // Get order details
    const order = await getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Early return if no customer email
    if (!order.customerEmail) {
      return { 
        success: true, 
        message: 'No customer email provided',
        order 
      };
    }

    // Update order with any additional information
    const updatedOrder = {
      ...order,
      ...options
    };

    // Calculate estimated delivery date if not set and status is changing to PROCESSING or SHIPPED
    if (!updatedOrder.estimatedDeliveryDate && [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.SHIPPED].includes(newStatus)) {
      updatedOrder.estimatedDeliveryDate = calculateEstimatedDelivery(updatedOrder);
    }

    // Handle delivery attempts
    if (newStatus === ORDER_STATUSES.DELIVERY_ATTEMPTED) {
      const attempt = {
        date: new Date(),
        status: options.attemptStatus || 'Failed delivery attempt',
        notes: options.attemptNotes,
      };

      updatedOrder.deliveryAttempts = [
        ...(updatedOrder.deliveryAttempts || []),
        attempt
      ];

      // Schedule next attempt (default to next business day)
      if (!updatedOrder.nextDeliveryAttempt) {
        updatedOrder.nextDeliveryAttempt = calculateNextBusinessDay();
      }
    }

    // Generate email content based on status
    const emailContent = [
      ORDER_STATUSES.OUT_FOR_DELIVERY, 
      ORDER_STATUSES.DELIVERY_ATTEMPTED, 
      ORDER_STATUSES.DELIVERED
    ].includes(newStatus)
      ? generateDeliveryEmail(updatedOrder, newStatus)
      : generateOrderStatusEmailContent(updatedOrder, newStatus);

    // Send email notification with retry mechanism
    const emailResult = await sendEmail({
      to: order.customerEmail,
      ...emailContent
    }, MAX_RETRIES);

    // Return the notification result
    return {
      success: true,
      message: `Notifications sent for order ${orderId} status change to ${newStatus}`,
      order: updatedOrder,
      notificationId: emailResult.id
    };
  } catch (error) {
    console.error('Error handling order status change:', error);
    throw new Error(`Failed to send notification: ${error.message}`);
  }
}