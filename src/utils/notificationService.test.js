import { handleOrderStatusChange } from './notificationService';
import { getOrderById } from './orderApi';

// Mock fetch for email service
global.fetch = jest.fn();

// Mock orderApi
jest.mock('./orderApi', () => ({
  getOrderById: jest.fn()
}));

describe('notificationService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    fetch.mockClear();
    getOrderById.mockClear();
  });

  it('should handle order status change and send email notification', async () => {
    // Mock order data
    const mockOrder = {
      id: 'order123',
      customerEmail: 'customer@example.com',
      items: [
        { id: 'item1', name: 'Test Item 1', quantity: 2, price: 10.00 }
      ],
      totalAmount: 20.00
    };

    // Mock successful order fetch
    getOrderById.mockResolvedValueOnce(mockOrder);

    // Mock successful email send
    fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    }));

    // Test order shipped notification
    const result = await handleOrderStatusChange('order123', 'SHIPPED', {
      trackingNumber: 'TRACK123'
    });

    // Verify order was fetched
    expect(getOrderById).toHaveBeenCalledWith('order123');

    // Verify email was sent with correct data
    expect(fetch).toHaveBeenCalledTimes(1);
    const emailCall = fetch.mock.calls[0];
    expect(emailCall[0]).toContain('/email');
    
    const emailData = JSON.parse(emailCall[1].body);
    expect(emailData.to).toBe('customer@example.com');
    expect(emailData.subject).toContain('Shipped');
    expect(emailData.body).toContain('TRACK123');

    // Verify result
    expect(result.success).toBe(true);
  });

  it('should handle missing customer email gracefully', async () => {
    // Mock order without email
    const mockOrder = {
      id: 'order123',
      items: [{ id: 'item1', name: 'Test Item 1', quantity: 1 }]
    };

    getOrderById.mockResolvedValueOnce(mockOrder);

    const result = await handleOrderStatusChange('order123', 'DELIVERED');

    // Email should not be attempted
    expect(fetch).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should handle email service errors gracefully', async () => {
    // Mock order data
    const mockOrder = {
      id: 'order123',
      customerEmail: 'customer@example.com'
    };

    getOrderById.mockResolvedValueOnce(mockOrder);

    // Mock email service failure
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Email service unavailable')));

    // Should throw error for email service failure
    await expect(handleOrderStatusChange('order123', 'CANCELLED'))
      .rejects.toThrow('Email service unavailable');
  });

  it('should handle invalid order ID', async () => {
    getOrderById.mockRejectedValueOnce(new Error('Order not found'));

    await expect(handleOrderStatusChange('invalid-order', 'SHIPPED'))
      .rejects.toThrow('Order not found');
  });

  it('should include correct email content for different statuses', async () => {
    const mockOrder = {
      id: 'order123',
      customerEmail: 'customer@example.com'
    };

    getOrderById.mockResolvedValue(mockOrder);
    fetch.mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    }));

    // Test different status notifications
    await handleOrderStatusChange('order123', 'PROCESSING');
    expect(JSON.parse(fetch.mock.calls[0][1].body).subject).toContain('Being Processed');

    await handleOrderStatusChange('order123', 'SHIPPED', { trackingNumber: 'TRACK123' });
    expect(JSON.parse(fetch.mock.calls[1][1].body).subject).toContain('Shipped');
    expect(JSON.parse(fetch.mock.calls[1][1].body).body).toContain('TRACK123');

    await handleOrderStatusChange('order123', 'DELIVERED');
    expect(JSON.parse(fetch.mock.calls[2][1].body).subject).toContain('Delivered');

    await handleOrderStatusChange('order123', 'CANCELLED');
    expect(JSON.parse(fetch.mock.calls[3][1].body).subject).toContain('Cancelled');
  });
});