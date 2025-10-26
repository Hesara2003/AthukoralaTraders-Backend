import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

const API_BASE = 'http://localhost:8080/api';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = async (id) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE}/customer/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      setError('Order not found. Please check your order ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      window.location.href = `/track-order/${trackingInput.trim()}`;
    }
  };

  const getStatusStep = (status) => {
    const steps = ['PLACED', 'PROCESSING', 'PICKED', 'PACKED', 'SHIPPED', 'DELIVERED'];
    return steps.indexOf(status);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-gray-600">Enter your order ID to check delivery status</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="max-w-md mx-auto mb-12">
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="Enter Order ID"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Track
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Order Details */}
        {!loading && order && (
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order #{order.id?.slice(-8)}</h2>
                  <p className="text-gray-600 mt-1">Placed on {formatDate(order.placedAt)}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Progress Tracker */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {['Ordered', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                    const currentStep = getStatusStep(order.status);
                    const isActive = idx <= currentStep;
                    const isLast = idx === 4;

                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <p className={`mt-2 text-xs font-medium ${
                            isActive ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {step}
                          </p>
                        </div>
                        {!isLast && (
                          <div className={`flex-1 h-1 mx-2 ${
                            idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                          }`}></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                  <div className="text-gray-700">
                    <p>{order.shipping.contact}</p>
                    <p>{order.shipping.address}</p>
                    <p>{order.shipping.city}, {order.shipping.postal}</p>
                    <p>{order.shipping.country}</p>
                    <p className="mt-2">Phone: {order.shipping.phone}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × Rs. {item.unitPrice?.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        Rs. {(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-6 mt-6">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>Rs. {order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Estimated Delivery */}
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 font-medium">
                    📦 Estimated Delivery: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">Contact our customer support for any questions</p>
              <div className="flex justify-center gap-4">
                <a href="mailto:support@athukoralatraders.com" className="text-blue-600 hover:underline">
                  Email Support
                </a>
                <span className="text-gray-400">|</span>
                <a href="tel:+94112345678" className="text-blue-600 hover:underline">
                  Call +94 11 234 5678
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
