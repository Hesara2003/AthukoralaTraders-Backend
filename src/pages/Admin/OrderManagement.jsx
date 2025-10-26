import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  RefreshCw
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:8080';

// Status configuration
const ORDER_STATUSES = [
  { value: 'ALL', label: 'All Orders', color: 'gray' },
  { value: 'PROCESSING', label: 'Processing', color: 'blue' },
  { value: 'PLACED', label: 'Placed', color: 'indigo' },
  { value: 'PICKED', label: 'Picked', color: 'purple' },
  { value: 'PACKED', label: 'Packed', color: 'pink' },
  { value: 'READY_TO_DISPATCH', label: 'Ready to Dispatch', color: 'yellow' },
  { value: 'SHIPPED', label: 'Shipped', color: 'orange' },
  { value: 'DELIVERED', label: 'Delivered', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' }
];

const StatusBadge = ({ status }) => {
  const config = ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  const colors = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    pink: 'bg-pink-100 text-pink-700 border-pink-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${colors[config.color]}`}>
      {status}
    </span>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updateStatusModal, setUpdateStatusModal] = useState(null);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all orders (by getting all statuses)
      const promises = ORDER_STATUSES.slice(1).map(status => 
        fetch(`${API_BASE}/api/customer/orders/by-status?status=${status.value}`)
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      );
      
      const results = await Promise.all(promises);
      const allOrders = results.flat();
      
      // Sort by placedAt (newest first)
      allOrders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
      
      setOrders(allOrders);
      setFilteredOrders(allOrders);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id?.toLowerCase().includes(term) ||
        order.customerEmail?.toLowerCase().includes(term) ||
        order.customerReference?.toLowerCase().includes(term) ||
        order.billing?.email?.toLowerCase().includes(term) ||
        order.billing?.firstName?.toLowerCase().includes(term) ||
        order.billing?.lastName?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedStatus]);

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/api/customer/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Refresh orders
      await fetchOrders();
      setUpdateStatusModal(null);
      alert('Order status updated successfully!');
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    }
  };

  // View order details
  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/api/customer/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      
      const data = await response.json();
      setSelectedOrder(data);
      setShowDetailsModal(true);
    } catch (err) {
      alert('Failed to load order details: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <AdminLayout
      title="Order Management"
      subtitle="Manage and track all customer orders"
    >
      {/* Header Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {ORDER_STATUSES.map(status => (
          <button
            key={status.value}
            onClick={() => setSelectedStatus(status.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStatus === status.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.label}
            {status.value !== 'ALL' && (
              <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                {orders.filter(o => o.status === status.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => ['PROCESSING', 'PLACED'].includes(o.status)).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shipped</p>
              <p className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.status === 'SHIPPED').length}
              </p>
            </div>
            <Truck className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      {order.customerReference && (
                        <div className="text-xs text-gray-500">Ref: {order.customerReference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.billing?.firstName} {order.billing?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{order.customerEmail || order.billing?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.placedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewOrderDetails(order.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => setUpdateStatusModal(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Placed At</p>
                  <p className="font-semibold">{formatDate(selectedOrder.placedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>

              {/* Customer Info */}
              {selectedOrder.billing && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Billing Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="text-gray-600">Name:</span> {selectedOrder.billing.firstName} {selectedOrder.billing.lastName}</p>
                    {selectedOrder.billing.company && <p><span className="text-gray-600">Company:</span> {selectedOrder.billing.company}</p>}
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> {selectedOrder.billing.email}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> {selectedOrder.billing.phone}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {selectedOrder.billing.address}, {selectedOrder.billing.city}, {selectedOrder.billing.postal}</p>
                  </div>
                </div>
              )}

              {/* Shipping Info */}
              {selectedOrder.shipping && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="text-gray-600">Contact:</span> {selectedOrder.shipping.contact}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> {selectedOrder.shipping.phone}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {selectedOrder.shipping.address}, {selectedOrder.shipping.city}, {selectedOrder.shipping.postal}</p>
                    {selectedOrder.shipping.instructions && (
                      <p className="text-sm text-gray-600 italic">Instructions: {selectedOrder.shipping.instructions}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">ID: {item.productId}</div>
                          </td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Info */}
              {selectedOrder.payment && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="text-gray-600">Method:</span> {selectedOrder.payment.method}</p>
                    <p><span className="text-gray-600">Status:</span> {selectedOrder.payment.status}</p>
                    {selectedOrder.payment.transactionId && (
                      <p><span className="text-gray-600">Transaction ID:</span> {selectedOrder.payment.transactionId}</p>
                    )}
                    <p><span className="text-gray-600">Amount:</span> {formatCurrency(selectedOrder.payment.amount)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setUpdateStatusModal(selectedOrder);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {updateStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Update Order Status</h3>
              <p className="text-sm text-gray-600 mt-1">Order: {updateStatusModal.id}</p>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Current Status:</p>
              <StatusBadge status={updateStatusModal.status} />

              <p className="text-sm text-gray-600 mt-6 mb-4">Select New Status:</p>
              <div className="space-y-2">
                {ORDER_STATUSES.slice(1).map(status => (
                  <button
                    key={status.value}
                    onClick={() => handleUpdateStatus(updateStatusModal.id, status.value)}
                    disabled={status.value === updateStatusModal.status}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      status.value === updateStatusModal.status
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <StatusBadge status={status.value} />
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setUpdateStatusModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrderManagement;
