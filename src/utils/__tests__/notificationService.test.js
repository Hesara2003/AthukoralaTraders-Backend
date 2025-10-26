import { handleOrderStatusChange } from '../notificationService';
import { getOrderById } from '../orderApi';
import { formatDate } from '../dateUtils';
import {
  createMockOrder,
  createMockDeliveryAttempt,
  createMockResponse,
  createMockErrorResponse,
  flushPromises
} from './testUtils';

// Mock dependencies
jest.mock('../orderApi');
jest.mock('../dateUtils', () => ({
  formatDate: jest.fn(date => new Date(date).toISOString())
}));

describe('Notification Service', () => {
  // Setup fetch mock
  const originalFetch = global.fetch;
  beforeAll(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    fetch.mockClear();
    getOrderById.mockClear();
    formatDate.mockClear();
  });

  describe('Order Processing Notifications', () => {
    it('should send processing notification with estimated delivery', async () => {
      const mockOrder = createMockOrder();
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      const result = await handleOrderStatusChange('order123', 'PROCESSING');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][1].body).toContain('Being Processed');
      expect(fetch.mock.calls[0][1].body).toContain(mockOrder.estimatedDeliveryDate);
      expect(result.success).toBe(true);
    });

    it('should handle missing estimated delivery date', async () => {
      const mockOrder = createMockOrder({ estimatedDeliveryDate: null });
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await handleOrderStatusChange('order123', 'PROCESSING');

      const emailBody = JSON.parse(fetch.mock.calls[0][1].body).body;
      expect(emailBody).not.toContain('estimated delivery');
    });
  });

  describe('Shipping Notifications', () => {
    it('should send shipping notification with tracking details', async () => {
      const mockOrder = createMockOrder();
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await handleOrderStatusChange('order123', 'SHIPPED', {
        trackingNumber: 'TRACK123456',
        carrier: 'Test Carrier'
      });

      const emailData = JSON.parse(fetch.mock.calls[0][1].body);
      expect(emailData.subject).toContain('Shipped');
      expect(emailData.body).toContain('TRACK123456');
      expect(emailData.body).toContain('Test Carrier');
    });

    it('should include shipping method in notification', async () => {
      const mockOrder = createMockOrder({ shippingMethod: 'express' });
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await handleOrderStatusChange('order123', 'SHIPPED');

      expect(fetch.mock.calls[0][1].body).toContain('express');
    });
  });

  describe('Delivery Attempt Notifications', () => {
    it('should send delivery attempt notification with next attempt details', async () => {
      const mockOrder = createMockOrder({
        deliveryAttempts: [createMockDeliveryAttempt()],
        nextDeliveryAttempt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await handleOrderStatusChange('order123', 'DELIVERY_ATTEMPTED');

      const emailData = JSON.parse(fetch.mock.calls[0][1].body);
      expect(emailData.subject).toContain('Action Required');
      expect(emailData.body).toContain('attempt delivery again');
      expect(emailData.body).toContain(mockOrder.nextDeliveryAttempt);
    });

    it('should include delivery attempt history', async () => {
      const attempts = [
        createMockDeliveryAttempt({ date: '2025-09-28T10:00:00Z' }),
        createMockDeliveryAttempt({ date: '2025-09-29T11:00:00Z' })
      ];
      const mockOrder = createMockOrder({ deliveryAttempts: attempts });
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await handleOrderStatusChange('order123', 'DELIVERY_ATTEMPTED');

      const emailBody = JSON.parse(fetch.mock.calls[0][1].body).body;
      attempts.forEach(attempt => {
        expect(emailBody).toContain(new Date(attempt.date).toISOString());
        expect(emailBody).toContain(attempt.status);
        expect(emailBody).toContain(attempt.notes);
      });
    });
  });

  describe('Delivery Completion Notifications', () => {
    it('should send successful delivery notification', async () => {
      const mockOrder = createMockOrder({
        signature: 'John Doe',
        deliveredAt: new Date().toISOString()
      });
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await handleOrderStatusChange('order123', 'DELIVERED');

      const emailData = JSON.parse(fetch.mock.calls[0][1].body);
      expect(emailData.subject).toContain('Delivered');
      expect(emailData.body).toContain('successfully delivered');
      expect(emailData.body).toContain('John Doe');
    });

    it('should include delivery confirmation details', async () => {
      const mockOrder = createMockOrder({
        signature: 'John Doe',
        deliveredAt: new Date().toISOString(),
        deliveryNotes: 'Left at front door'
      });
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await handleOrderStatusChange('order123', 'DELIVERED');

      const emailBody = JSON.parse(fetch.mock.calls[0][1].body).body;
      expect(emailBody).toContain('John Doe');
      expect(emailBody).toContain('Left at front door');
      expect(emailBody).toContain(mockOrder.deliveredAt);
    });
  });

  describe('Cancellation Notifications', () => {
    it('should send cancellation notification with reason', async () => {
      const mockOrder = createMockOrder({
        cancellationReason: 'Customer request',
        cancelledAt: new Date().toISOString()
      });
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await handleOrderStatusChange('order123', 'CANCELLED');

      const emailData = JSON.parse(fetch.mock.calls[0][1].body);
      expect(emailData.subject).toContain('Cancelled');
      expect(emailData.body).toContain('Customer request');
    });

    it('should handle cancellation without specific reason', async () => {
      const mockOrder = createMockOrder({
        cancellationReason: null
      });
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      await handleOrderStatusChange('order123', 'CANCELLED');

      const emailBody = JSON.parse(fetch.mock.calls[0][1].body).body;
      expect(emailBody).toContain('Not specified');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing order gracefully', async () => {
      getOrderById.mockRejectedValueOnce(new Error('Order not found'));

      await expect(handleOrderStatusChange('invalid-id', 'SHIPPED'))
        .rejects.toThrow('Order not found');
    });

    it('should handle email service failures', async () => {
      const mockOrder = createMockOrder();
      getOrderById.mockResolvedValueOnce(mockOrder);
      fetch.mockRejectedValueOnce(new Error('Email service unavailable'));

      await expect(handleOrderStatusChange('order123', 'DELIVERED'))
        .rejects.toThrow('Email service unavailable');
    });

    it('should handle missing customer email', async () => {
      const mockOrder = createMockOrder({ customerEmail: null });
      getOrderById.mockResolvedValueOnce(mockOrder);

      const result = await handleOrderStatusChange('order123', 'SHIPPED');

      expect(fetch).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});