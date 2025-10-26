// Mock notification API service for development/testing
// In a real implementation, this would connect to an actual email service

/**
 * Mock email service for demonstration
 * In production, this would integrate with services like SendGrid, AWS SES, etc.
 */
class MockNotificationService {
  constructor() {
    this.notifications = [];
    this.isEnabled = true;
  }

  /**
   * Simulate sending an email notification
   * @param {Object} emailData - Email notification data
   * @returns {Promise} - Resolves with mock response
   */
  async sendEmail(emailData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.isEnabled) {
      throw new Error('Notification service is currently unavailable');
    }

    // Simulate random failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Failed to deliver notification');
    }

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      ...emailData
    };

    this.notifications.push(notification);
    
    // Log to console for development visibility
    console.log('📧 Mock Email Sent:', {
      to: emailData.to,
      subject: emailData.subject,
      timestamp: notification.timestamp
    });

    return {
      success: true,
      id: notification.id,
      message: 'Email sent successfully'
    };
  }

  /**
   * Get all sent notifications (for debugging)
   * @returns {Array} - List of sent notifications
   */
  getNotifications() {
    return this.notifications;
  }

  /**
   * Clear notification history
   */
  clearNotifications() {
    this.notifications = [];
  }

  /**
   * Toggle service availability (for testing failure scenarios)
   * @param {boolean} enabled - Whether the service should be enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Create singleton instance
const mockNotificationService = new MockNotificationService();

/**
 * Mock API endpoint handler
 * In a real application, this would be handled by the backend
 */
export async function handleNotificationAPI(emailData) {
  try {
    const result = await mockNotificationService.sendEmail(emailData);
    return {
      ok: true,
      status: 200,
      json: () => Promise.resolve(result)
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: error.message })
    };
  }
}

// Override fetch for notification endpoint in development
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options = {}) {
    // Intercept notification API calls
    if (url.includes('/api/notifications')) {
      const emailData = options.body ? JSON.parse(options.body) : {};
      return handleNotificationAPI(emailData);
    }
    
    // Pass through all other requests
    return originalFetch.apply(this, arguments);
  };
}

export default mockNotificationService;