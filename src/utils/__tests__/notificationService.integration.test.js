import { createNotificationTemplate, sendNotification } from '../notificationService';

class NotificationServiceMock {
  constructor() {
    this.notifications = [];
    this.errors = [];
  }

  clear() {
    this.notifications = [];
    this.errors = [];
  }

  async send(notification) {
    return new Promise((resolve, reject) => {
      if (notification.error) {
        this.errors.push(notification);
        reject(new Error(notification.error));
      } else {
        this.notifications.push(notification);
        resolve({ success: true, id: Math.random().toString(36).substring(7) });
      }
    });
  }

  getNotifications() {
    return this.notifications;
  }

  getErrors() {
    return this.errors;
  }
}

const mockService = new NotificationServiceMock();

describe('NotificationService Integration', () => {
  beforeEach(() => {
    mockService.clear();
  });

  describe('Template Generation', () => {
    it('should generate correct templates for different statuses', () => {
      const orderData = {
        id: 'order123',
        customerName: 'John Doe',
        items: [
          { name: 'Test Product', quantity: 2, price: 10.00 }
        ],
        total: 20.00,
        shippingAddress: '123 Test St, Test City'
      };

      const processingTemplate = createNotificationTemplate(orderData, 'PROCESSING');
      expect(processingTemplate.subject).toContain('Processing');
      expect(processingTemplate.body).toContain(orderData.customerName);

      const shippedTemplate = createNotificationTemplate(orderData, 'SHIPPED');
      expect(shippedTemplate.subject).toContain('Shipped');
      expect(shippedTemplate.body).toContain(orderData.shippingAddress);
    });

    it('should include all required fields in templates', () => {
      const orderData = {
        id: 'order123',
        customerName: 'John Doe',
        items: [
          { name: 'Test Product', quantity: 2, price: 10.00 }
        ]
      };

      const template = createNotificationTemplate(orderData, 'PROCESSING');
      expect(template).toHaveProperty('subject');
      expect(template).toHaveProperty('body');
      expect(template).toHaveProperty('recipient');
      expect(template).toHaveProperty('type');
    });
  });

  describe('Notification Sending', () => {
    it('should queue and send notifications successfully', async () => {
      const notification = {
        recipient: 'test@example.com',
        subject: 'Test Notification',
        body: 'This is a test notification',
        type: 'ORDER_STATUS'
      };

      const result = await sendNotification(notification);
      expect(result.success).toBe(true);
      expect(mockService.getNotifications()).toHaveLength(1);
    });

    it('should handle multiple notifications in sequence', async () => {
      const notifications = [
        {
          recipient: 'test1@example.com',
          subject: 'Test 1',
          body: 'Notification 1',
          type: 'ORDER_STATUS'
        },
        {
          recipient: 'test2@example.com',
          subject: 'Test 2',
          body: 'Notification 2',
          type: 'ORDER_STATUS'
        }
      ];

      await Promise.all(notifications.map(n => sendNotification(n)));
      expect(mockService.getNotifications()).toHaveLength(2);
    });

    it('should handle service errors gracefully', async () => {
      const notification = {
        recipient: 'test@example.com',
        subject: 'Test Error',
        body: 'This should fail',
        type: 'ORDER_STATUS',
        error: 'Service unavailable'
      };

      await expect(sendNotification(notification)).rejects.toThrow('Service unavailable');
      expect(mockService.getErrors()).toHaveLength(1);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting correctly', async () => {
      const notifications = Array(10).fill(null).map((_, i) => ({
        recipient: `test${i}@example.com`,
        subject: `Test ${i}`,
        body: `Notification ${i}`,
        type: 'ORDER_STATUS'
      }));

      const results = await Promise.all(
        notifications.map(n => sendNotification(n))
      );

      expect(results.every(r => r.success)).toBe(true);
      expect(mockService.getNotifications()).toHaveLength(10);
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should retry failed notifications', async () => {
      const notification = {
        recipient: 'test@example.com',
        subject: 'Test Retry',
        body: 'This should retry',
        type: 'ORDER_STATUS',
        retries: 3
      };

      // First attempt fails
      notification.error = 'Temporary error';
      await expect(sendNotification(notification)).rejects.toThrow('Temporary error');

      // Second attempt succeeds
      delete notification.error;
      const result = await sendNotification(notification);
      expect(result.success).toBe(true);
    });
  });
});