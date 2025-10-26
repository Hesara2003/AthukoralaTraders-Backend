// PO notification service for handling purchase order delivery timeline updates
import { formatDate } from './dateUtils';
import './mockNotificationService'; // Initialize mock service for development

const NOTIFICATIONS_ENDPOINT = '/api/notifications';

/**
 * Send email notification with retry mechanism
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body content (HTML supported)
 * @param {number} retries - Number of retries remaining
 * @returns {Promise} - Resolves when email is sent
 */
async function sendEmail({ to, subject, body }, retries = 3) {
  try {
    const response = await fetch(NOTIFICATIONS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, subject, body })
    });

    if (!response.ok) {
      throw new Error(`Email service responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return sendEmail({ to, subject, body }, retries - 1);
    }
    throw error;
  }
}

/**
 * Generate delivery timeline update email content
 * @param {Object} po - Purchase order details
 * @param {string} oldDate - Previous delivery date
 * @param {string} newDate - New delivery date
 * @returns {Object} - Email subject and body
 */
function generateDeliveryUpdateEmailContent(po, oldDate, newDate) {
  const formattedOldDate = oldDate ? formatDate(oldDate) : 'Not specified';
  const formattedNewDate = formatDate(newDate);
  
  return {
    subject: `Delivery Timeline Updated - Purchase Order #${po.id}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Delivery Timeline Updated</h1>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Purchase Order #${po.id}</h2>
          
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
            <h3 style="color: #374151; margin-top: 0;">Delivery Date Update</h3>
            <p style="margin: 10px 0;">
              <strong>Previous Date:</strong> ${formattedOldDate}
            </p>
            <p style="margin: 10px 0;">
              <strong>New Date:</strong> <span style="color: #059669; font-weight: bold;">${formattedNewDate}</span>
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
            <h3 style="color: #374151; margin-top: 0;">Order Details</h3>
            <p><strong>Supplier:</strong> ${po.supplierId || 'N/A'}</p>
            <p><strong>Items:</strong> ${po.productIds ? po.productIds.length : 0} items</p>
            <p><strong>Status:</strong> ${po.status}</p>
            <p><strong>Created:</strong> ${po.createdAt ? formatDate(po.createdAt) : 'N/A'}</p>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #fbbf24;">
            <h3 style="color: #92400e; margin-top: 0;">What This Means</h3>
            <p style="color: #92400e; margin-bottom: 0;">
              The supplier has updated the expected delivery timeline for this purchase order. 
              Please plan accordingly and adjust any related schedules or customer commitments.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from Athukorala Traders Purchase Order System.
            </p>
          </div>
        </div>
      </div>
    `
  };
}

/**
 * Notify stakeholders about delivery timeline update
 * @param {Object} po - Purchase order details
 * @param {string} oldDeliveryDate - Previous delivery date
 * @param {string} newDeliveryDate - New delivery date
 * @returns {Promise} - Resolves when notifications are sent
 */
export async function notifyDeliveryTimelineUpdate(po, oldDeliveryDate, newDeliveryDate) {
  try {
    const emailContent = generateDeliveryUpdateEmailContent(po, oldDeliveryDate, newDeliveryDate);
    
    // List of email addresses to notify (in a real system, this would come from user management)
    const notificationEmails = [
      // Staff notifications
      'admin@athukoralatraders.com',
      'inventory@athukoralatraders.com',
      'operations@athukoralatraders.com',
      
      // Customer service (they can notify customers)
      'customerservice@athukoralatraders.com'
    ];

    // Send notifications to all stakeholders
    const notifications = notificationEmails.map(email => 
      sendEmail({
        to: email,
        ...emailContent
      }).catch(error => {
        console.error(`Failed to send notification to ${email}:`, error);
        return { error: error.message, email };
      })
    );

    const results = await Promise.all(notifications);
    
    // Count successful notifications
    const successful = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;

    return {
      success: true,
      message: `Delivery timeline update notifications sent: ${successful} successful, ${failed} failed`,
      po,
      results
    };
  } catch (error) {
    console.error('Error sending delivery timeline notifications:', error);
    throw new Error(`Failed to send delivery timeline notifications: ${error.message}`);
  }
}

/**
 * Generate customer notification email for delivery timeline changes
 * @param {Object} order - Customer order details (if related to PO)
 * @param {Object} po - Purchase order details
 * @param {string} newDeliveryDate - New delivery date
 * @returns {Object} - Email subject and body for customers
 */
export function generateCustomerDeliveryUpdateEmail(order, po, newDeliveryDate) {
  const formattedNewDate = formatDate(newDeliveryDate);
  
  return {
    subject: `Delivery Update for Your Order #${order.id}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Delivery Update</h1>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b;">Dear ${order.customerName || 'Valued Customer'},</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            We have an update regarding the delivery timeline for your order <strong>#${order.id}</strong>.
          </p>

          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #059669; margin-top: 0;">Updated Delivery Information</h3>
            <p style="margin: 10px 0;">
              <strong>New Expected Delivery:</strong> ${formattedNewDate}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              Our supplier has updated the delivery schedule for some items in your order.
            </p>
          </div>

          <p style="color: #374151; line-height: 1.6;">
            We apologize for any inconvenience this may cause and appreciate your patience. 
            If you have any questions or concerns about this change, please don't hesitate to contact our customer service team.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:+94112345678" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Contact Customer Service
            </a>
          </div>

          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
            <h4 style="color: #0c4a6e; margin-top: 0;">Need Help?</h4>
            <p style="color: #0c4a6e; margin-bottom: 10px;">Our customer support team is available:</p>
            <p style="color: #0c4a6e; margin: 5px 0;">📞 Phone: (+94) 11 234 5678</p>
            <p style="color: #0c4a6e; margin: 5px 0;">📧 Email: support@athukoralatraders.com</p>
            <p style="color: #0c4a6e; margin: 5px 0;">🕒 Hours: Mon-Sat 8AM-6PM</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #6b7280; font-size: 14px;">
              Thank you for choosing Athukorala Traders!<br>
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  };
}