// Test utilities and common mocks
import { ORDER_STATUS, NOTIFICATION_PRIORITY, EMAIL_TEMPLATE_TYPES } from '../constants';

/**
 * Create a mock order with all required fields
 * @param {Object} overrides - Fields to override in the mock order
 * @returns {Object} Mock order object
 */
export const createMockOrder = (overrides = {}) => ({
  id: 'order123',
  customerEmail: 'customer@example.com',
  status: 'PROCESSING',
  items: [
    {
      id: 'item1',
      name: 'Test Product',
      quantity: 2,
      price: 29.99
    }
  ],
  totalAmount: 59.98,
  placedAt: new Date().toISOString(),
  estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  trackingNumber: 'TRACK123456',
  shippingMethod: 'standard',
  deliveryLocation: {
    address: '123 Test St',
    city: 'Test City',
    postalCode: '12345',
    country: 'Sri Lanka',
    type: 'residential'
  },
  deliveryInstructions: 'Leave at front door',
  deliveryAttempts: [],
  ...overrides
});

/**
 * Create a mock delivery attempt
 * @param {Object} overrides - Fields to override in the mock attempt
 * @returns {Object} Mock delivery attempt object
 */
export const createMockDeliveryAttempt = (overrides = {}) => ({
  date: new Date().toISOString(),
  status: 'Delivery attempted',
  notes: 'No one available to receive package',
  ...overrides
});

/**
 * Mock response for fetch calls
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Object} Mock response object
 */
export const createMockResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data)
});

/**
 * Create error response for fetch calls
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Object} Mock error response
 */
export const createMockErrorResponse = (message, status = 500) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error: message })
});

/**
 * Wait for all promises to resolve
 * @returns {Promise} Promise that resolves when all promises are settled
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/**
 * Create mock notification data
 * @param {Object} overrides - Fields to override in the mock notification
 * @returns {Object} Mock notification object
 */
export const createMockNotification = (overrides = {}) => ({
  id: `notify-${Math.random().toString(36).substr(2, 9)}`,
  type: EMAIL_TEMPLATE_TYPES.ORDER_STATUS,
  recipient: 'customer@example.com',
  subject: 'Test Notification',
  body: 'This is a test notification',
  priority: NOTIFICATION_PRIORITY.MEDIUM,
  metadata: {
    orderId: 'order123',
    status: ORDER_STATUS.PROCESSING
  },
  timestamp: new Date().toISOString(),
  ...overrides
});

/**
 * Create mock tracking information
 * @param {Object} overrides - Fields to override in the mock tracking
 * @returns {Object} Mock tracking object
 */
export const createMockTrackingInfo = (overrides = {}) => ({
  trackingNumber: 'TRACK123456',
  carrier: 'Test Carrier',
  status: 'IN_TRANSIT',
  currentLocation: 'Test City Distribution Center',
  estimatedDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  lastUpdated: new Date().toISOString(),
  events: [
    {
      timestamp: new Date().toISOString(),
      location: 'Test City Distribution Center',
      status: 'Package received',
      details: 'Package has been received at distribution center'
    }
  ],
  ...overrides
});