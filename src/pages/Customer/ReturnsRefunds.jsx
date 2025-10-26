import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import CustomerLayout from '../../components/CustomerLayout';

const API_BASE = 'http://localhost:8080/api';

export default function ReturnsRefunds() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnType, setReturnType] = useState('RETURN');
  const [comments, setComments] = useState('');
  const [activeTab, setActiveTab] = useState('eligible'); // eligible, myReturns
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, returnsRes] = await Promise.all([
        axios.get(`${API_BASE}/customer/orders`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/returns/customer/${user?.id || 'guest'}`).catch(() => ({ data: [] })),
      ]);
      
      // Filter delivered orders within 30 days
      const eligible = ordersRes.data.filter((order) => {
        if (order.status !== 'DELIVERED') return false;
        const deliveryDate = new Date(order.placedAt); // Simplified - should use actual delivery date
        const daysSince = (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      });
      
      setOrders(eligible);
      setReturns(returnsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    
    if (!selectedOrder) {
      alert('Please select an order');
      return;
    }

    try {
      const returnData = {
        orderId: selectedOrder.id,
        customerId: user?.id || 'guest',
        items: selectedOrder.items.map(item => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        reason: returnReason,
        type: returnType,
        comments: comments,
      };

      await axios.post(`${API_BASE}/returns/request`, returnData);
      alert('Return request submitted successfully!');
      
      // Reset form
      setSelectedOrder(null);
      setReturnReason('');
      setReturnType('RETURN');
      setComments('');
      setActiveTab('myReturns');
      
      // Reload data
      loadData();
    } catch (error) {
      alert('Failed to submit return request: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      RECEIVED: 'bg-blue-100 text-blue-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
      EXCHANGED: 'bg-indigo-100 text-indigo-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <CustomerLayout title="Returns & Refunds" subtitle="Request returns and track refund status">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`${
              activeTab === 'eligible'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Eligible Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('myReturns')}
            className={`${
              activeTab === 'myReturns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Returns ({returns.length})
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {/* Eligible Orders Tab */}
          {activeTab === 'eligible' && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-900">
                  💡 You can return items within <strong>30 days</strong> of delivery. Select an order below to start your return request.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 text-lg">No eligible orders for return at this time</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all ${
                        selectedOrder?.id === order.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">Order #{order.id?.slice(-8)}</h3>
                          <p className="text-sm text-gray-600">
                            Placed: {new Date(order.placedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          Rs. {order.totalAmount?.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            • {item.name} (Qty: {item.quantity})
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Return Request Form */}
              {selectedOrder && (
                <form onSubmit={handleSubmitReturn} className="mt-6 bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Return Request Form</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Type *
                      </label>
                      <select
                        value={returnType}
                        onChange={(e) => setReturnType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="RETURN">Return & Refund</option>
                        <option value="EXCHANGE">Exchange for Same Product</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Return *
                      </label>
                      <select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">-- Select a reason --</option>
                        <option value="DEFECTIVE">Defective or Damaged</option>
                        <option value="WRONG_ITEM">Wrong Item Received</option>
                        <option value="NOT_AS_DESCRIBED">Not as Described</option>
                        <option value="CHANGED_MIND">Changed Mind</option>
                        <option value="BETTER_PRICE">Found Better Price</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments
                      </label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows="4"
                        placeholder="Please provide additional details about your return..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      ></textarea>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Submit Return Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* My Returns Tab */}
          {activeTab === 'myReturns' && (
            <div>
              {returns.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 text-lg">You haven't requested any returns yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {returns.map((returnItem) => (
                    <div key={returnItem.id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Return #{returnItem.id?.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Order: #{returnItem.orderId?.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Requested: {new Date(returnItem.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(returnItem.status)}`}>
                          {returnItem.status}
                        </span>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-700">
                          <strong>Type:</strong> {returnItem.type}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {returnItem.reason}
                        </p>
                        {returnItem.comments && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Comments:</strong> {returnItem.comments}
                          </p>
                        )}
                        {returnItem.adminNotes && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">Admin Response:</p>
                            <p className="text-sm text-blue-800 mt-1">{returnItem.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </CustomerLayout>
  );
}
