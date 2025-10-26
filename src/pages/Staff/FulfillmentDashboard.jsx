import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API_BASE = 'http://localhost:8080/api';

export default function FulfillmentDashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState('all'); // all, pick, pack, delivery

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/fulfillment/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPicking = async (orderId) => {
    try {
      await axios.post(`${API_BASE}/fulfillment/orders/${orderId}/pick/start`);
      await loadOrders();
      alert('Picking started successfully');
    } catch (error) {
      alert('Failed to start picking: ' + error.message);
    }
  };

  const completePicking = async (orderId) => {
    try {
      await axios.post(`${API_BASE}/fulfillment/orders/${orderId}/pick/complete`);
      await loadOrders();
      alert('Picking completed successfully');
    } catch (error) {
      alert('Failed to complete picking: ' + error.message);
    }
  };

  const startPacking = async (orderId) => {
    try {
      await axios.post(`${API_BASE}/fulfillment/orders/${orderId}/pack/start`);
      await loadOrders();
      alert('Packing started successfully');
    } catch (error) {
      alert('Failed to start packing: ' + error.message);
    }
  };

  const scheduleDelivery = async (orderId) => {
    try {
      await axios.post(`${API_BASE}/fulfillment/orders/${orderId}/delivery/schedule`, {
        scheduledDate: new Date().toISOString(),
      });
      await loadOrders();
      alert('Delivery scheduled successfully');
    } catch (error) {
      alert('Failed to schedule delivery: ' + error.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (currentStage === 'all') return true;
    if (currentStage === 'pick') return ['PLACED', 'PROCESSING'].includes(order.status);
    if (currentStage === 'pack') return ['PICKED'].includes(order.status);
    if (currentStage === 'delivery') return ['PACKED', 'READY_TO_DISPATCH'].includes(order.status);
    return true;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      PLACED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-yellow-100 text-yellow-800',
      PICKED: 'bg-purple-100 text-purple-800',
      PACKED: 'bg-indigo-100 text-indigo-800',
      READY_TO_DISPATCH: 'bg-green-100 text-green-800',
      SHIPPED: 'bg-teal-100 text-teal-800',
      DELIVERED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="Order Fulfillment" subtitle="Pick, pack, and dispatch orders efficiently">
      {/* Stage Filters */}
      <div className="mb-6 flex gap-4">
          <button
            onClick={() => setCurrentStage('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStage === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setCurrentStage('pick')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStage === 'pick'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pick Stage ({orders.filter(o => ['PLACED', 'PROCESSING'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setCurrentStage('pack')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStage === 'pack'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pack Stage ({orders.filter(o => o.status === 'PICKED').length})
          </button>
          <button
            onClick={() => setCurrentStage('delivery')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStage === 'delivery'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Delivery ({orders.filter(o => ['PACKED', 'READY_TO_DISPATCH'].includes(o.status)).length})
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No orders in this stage</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.slice(-8)}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium text-gray-900">
                          {order.customerEmail || order.customerId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium text-gray-900">
                          Rs. {order.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="font-medium text-gray-900">{order.items?.length || 0} items</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Placed At</p>
                        <p className="font-medium text-gray-900">
                          {order.placedAt
                            ? new Date(order.placedAt).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    {selectedOrder === order.id && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Order Items:</h4>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-gray-50 p-3 rounded"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity} × Rs. {item.unitPrice?.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                Rs. {(item.quantity * item.unitPrice).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex flex-col gap-2">
                    <button
                      onClick={() =>
                        setSelectedOrder(selectedOrder === order.id ? null : order.id)
                      }
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                    </button>

                    {['PLACED', 'PROCESSING'].includes(order.status) && (
                      <button
                        onClick={() => startPicking(order.id)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start Picking
                      </button>
                    )}

                    {order.status === 'PICKED' && (
                      <>
                        <button
                          onClick={() => completePicking(order.id)}
                          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Complete Pick
                        </button>
                        <button
                          onClick={() => startPacking(order.id)}
                          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Start Packing
                        </button>
                      </>
                    )}

                    {['PACKED', 'READY_TO_DISPATCH'].includes(order.status) && (
                      <button
                        onClick={() => scheduleDelivery(order.id)}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Schedule Delivery
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </AdminLayout>
  );
}
