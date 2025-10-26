// Email templates for different types of notifications
import { formatDate } from './dateUtils';

// Common email header with branding
const generateEmailHeader = () => `
  <div style="background-color: #f8fafc; padding: 20px 0; text-align: center;">
    <img src="https://athukoralatraders.com/logo.png" alt="Athukorala Traders Logo" style="max-width: 200px;">
  </div>
`;

// Common email footer with contact info
const generateEmailFooter = () => `
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
    <p>Need help? Contact our support team:</p>
    <p>Email: support@athukoralatraders.com</p>
    <p>Phone: +94 11 234 5678</p>
    <p style="margin-top: 20px;">Thank you for shopping with Athukorala Traders!</p>
  </div>
`;

// Delivery status timeline block
const generateDeliveryTimeline = (order) => {
  const { deliveryAttempts = [] } = order;
  if (!deliveryAttempts.length) return '';

  return `
    <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
      <h3 style="color: #1e293b; margin-bottom: 15px;">Delivery Timeline</h3>
      <div style="border-left: 2px solid #e2e8f0; padding-left: 20px;">
        ${deliveryAttempts.map(attempt => `
          <div style="margin-bottom: 15px; position: relative;">
            <div style="margin-left: -27px; width: 12px; height: 12px; border-radius: 50%; background-color: #3b82f6; position: absolute;"></div>
            <div style="padding-left: 10px;">
              <div style="font-weight: 600; color: #1e293b;">${formatDate(attempt.date)}</div>
              <div style="color: #64748b;">${attempt.status}</div>
              ${attempt.notes ? `<div style=\"color: #64748b; font-style: italic;\">${attempt.notes}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// Tracking information section
const generateTrackingInfo = (order) => {
  const {
    trackingNumber,
    estimatedDeliveryDate,
    currentLocation,
    carrier,
    shippingMethod
  } = order;

  return `
    <div style="margin: 20px 0; padding: 20px; background-color: #f1f5f9; border-radius: 8px;">
      <h3 style="color: #1e293b; margin-bottom: 15px;">Tracking Information</h3>
      ${trackingNumber ? `
        <p style=\"margin-bottom: 10px;\"><strong>Tracking Number:</strong> ${trackingNumber}</p>
      ` : ''}
      ${carrier ? `
        <p style=\"margin-bottom: 10px;\"><strong>Carrier:</strong> ${carrier}</p>
      ` : ''}
      ${shippingMethod ? `
        <p style=\"margin-bottom: 10px;\"><strong>Shipping Method:</strong> ${shippingMethod}</p>
      ` : ''}
      ${currentLocation ? `
        <p style=\"margin-bottom: 10px;\"><strong>Current Location:</strong> ${currentLocation}</p>
      ` : ''}
      ${estimatedDeliveryDate ? `
        <p style=\"margin-bottom: 10px;\"><strong>Estimated Delivery:</strong> ${formatDate(estimatedDeliveryDate)}</p>
      ` : ''}
    </div>
  `;
};

// Generate delivery-related email content based on status
export const generateDeliveryEmail = (order, status) => {
  const templates = {
    OUT_FOR_DELIVERY: {
      subject: `Your Order #${order.id} is Out for Delivery Today!`,
      body: `
        ${generateEmailHeader()}
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #1e293b; margin-bottom: 20px;">Your Order is Out for Delivery!</h1>
          <p style="color: #334155; margin-bottom: 20px;">Great news! Your order will be delivered today. Please ensure someone is available to receive it.</p>
          ${generateTrackingInfo(order)}
          ${order.deliveryInstructions ? `
            <div style=\"margin: 20px 0; padding: 15px; background-color: #fffbeb; border-radius: 8px; border: 1px solid #fbbf24;\">
              <strong>Delivery Instructions:</strong><br>${order.deliveryInstructions}
            </div>
          ` : ''}
          ${generateDeliveryTimeline(order)}
          ${generateEmailFooter()}
        </div>
      `
    },
    DELIVERY_ATTEMPTED: {
      subject: `Delivery Attempted - Action Required for Order #${order.id}`,
      body: `
        ${generateEmailHeader()}
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #1e293b; margin-bottom: 20px;">We Tried to Deliver Your Order</h1>
          <p style="color: #334155; margin-bottom: 20px;">We attempted to deliver your order but were unable to complete the delivery.</p>
          ${generateTrackingInfo(order)}
          ${generateDeliveryTimeline(order)}
          <div style="margin: 20px 0; padding: 15px; background-color: #fee2e2; border-radius: 8px; border: 1px solid #f87171;">
            <h3 style="color: #991b1b; margin-bottom: 10px;">Next Steps:</h3>
            <p style="color: #7f1d1d;">${order.nextDeliveryAttempt ? `We will attempt delivery again on ${formatDate(order.nextDeliveryAttempt)}` : 'Please contact our support team to arrange redelivery.'}</p>
          </div>
          ${generateEmailFooter()}
        </div>
      `
    },
    DELIVERED: {
      subject: `Your Order #${order.id} Has Been Delivered`,
      body: `
        ${generateEmailHeader()}
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #1e293b; margin-bottom: 20px;">Your Order Has Been Delivered!</h1>
          <p style="color: #334155; margin-bottom: 20px;">Your order has been successfully delivered. We hope you enjoy your purchase!</p>
          ${generateTrackingInfo(order)}
          ${order.signature ? `
            <div style=\"margin: 20px 0; padding: 15px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #86efac;\"><strong>Signed for by:</strong> ${order.signature}</div>
          ` : ''}
          ${generateDeliveryTimeline(order)}
          ${generateEmailFooter()}
        </div>
      `
    }
  };

  const template = templates[status];
  if (!template) {
    console.warn(`No specific template found for status: ${status}, using default template`);
    return {
      subject: `Order #${order.id} Status Update`,
      body: `
        ${generateEmailHeader()}
        <div style=\"padding: 20px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;\">
          <h1 style=\"color: #1e293b; margin-bottom: 20px;\">Order Status Update</h1>
          <p style=\"color: #334155; margin-bottom: 20px;\">Your order status has been updated to: ${status}</p>
          ${generateTrackingInfo(order)}
          ${generateDeliveryTimeline(order)}
          ${generateEmailFooter()}
        </div>
      `
    };
  }
  return template;
};
