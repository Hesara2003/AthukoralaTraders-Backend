import { useState, useEffect } from 'react';
import './PickPackDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const PickPackDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState({});
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/customer/orders/pending`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update order status');
      
      // Refresh orders list
      await fetchOrders();
      setShowModal(false);
      setSelectedOrder(null);
      setModalAction(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const openConfirmationModal = (order, action) => {
    setSelectedOrder(order);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmAction = () => {
    if (selectedOrder && modalAction) {
      handleStatusUpdate(selectedOrder.id, modalAction.status);
    }
  };

  const assignOrderToStaff = (orderId, staffName) => {
    setAssignedStaff({ ...assignedStaff, [orderId]: staffName });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      PLACED: 'badge-placed',
      PROCESSING: 'badge-processing',
      PICKED: 'badge-picked',
      PACKED: 'badge-packed',
      READY_TO_DISPATCH: 'badge-ready',
      SHIPPED: 'badge-shipped',
      DELIVERED: 'badge-delivered',
      CANCELLED: 'badge-cancelled'
    };
    return statusMap[status] || 'badge-default';
  };

  const getFilteredOrders = () => {
    if (filterStatus === 'ALL') return orders;
    return orders.filter(order => order.status === filterStatus);
  };

  const getActionButtons = (order) => {
    switch (order.status) {
      case 'PLACED':
      case 'PROCESSING':
        return (
          <button
            className="btn btn-primary"
            onClick={() => openConfirmationModal(order, {
              status: 'PICKED',
              title: 'Mark as Picked',
              message: 'Are you sure you want to mark this order as PICKED? This will deduct inventory.'
            })}
          >
            Mark as Picked
          </button>
        );
      case 'PICKED':
        return (
          <button
            className="btn btn-success"
            onClick={() => openConfirmationModal(order, {
              status: 'PACKED',
              title: 'Mark as Packed',
              message: 'Are you sure you want to mark this order as PACKED? Status will automatically update to READY TO DISPATCH.'
            })}
          >
            Mark as Packed
          </button>
        );
      default:
        return <span className="text-muted">No action available</span>;
    }
  };

  if (loading) {
    return (
      <div className="pick-pack-dashboard">
        <div className="loading-spinner">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="pick-pack-dashboard">
      <div className="dashboard-header">
        <h1>Pick & Pack Orders Dashboard</h1>
        <button className="btn btn-secondary" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <label>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Orders</option>
          <option value="PLACED">Placed</option>
          <option value="PROCESSING">Processing</option>
          <option value="PICKED">Picked</option>
          <option value="PACKED">Packed</option>
          <option value="READY_TO_DISPATCH">Ready to Dispatch</option>
        </select>
        <span className="order-count">
          Showing {getFilteredOrders().length} of {orders.length} orders
        </span>
      </div>

      {/* Orders Grid */}
      <div className="orders-grid">
        {getFilteredOrders().map((order) => (
          <div key={order.id} className="order-card">
            {/* Order Header */}
            <div className="order-header">
              <div>
                <h3>Order #{order.id.substring(0, 8)}</h3>
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="order-meta">
                <p>Placed: {new Date(order.placedAt).toLocaleDateString()}</p>
                <p className="order-total">₹{order.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="customer-info">
              <p><strong>Customer:</strong> {order.customerEmail}</p>
              {order.shipping && (
                <p><strong>Shipping to:</strong> {order.shipping.city}, {order.shipping.country}</p>
              )}
            </div>

            {/* Product Details */}
            <div className="product-details">
              <h4>Items to Pick:</h4>
              <div className="items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-id">ID: {item.productId.substring(0, 8)}</span>
                    </div>
                    <div className="item-quantity">
                      <span className="quantity-badge">Qty: {item.quantity}</span>
                      <span className="item-price">₹{item.unitPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Assignment */}
            <div className="staff-assignment">
              <label>Assigned to:</label>
              <input
                type="text"
                placeholder="Enter staff name"
                value={assignedStaff[order.id] || ''}
                onChange={(e) => assignOrderToStaff(order.id, e.target.value)}
                className="staff-input"
              />
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
              {getActionButtons(order)}
            </div>
          </div>
        ))}
      </div>

      {getFilteredOrders().length === 0 && (
        <div className="empty-state">
          <p>No orders found for the selected filter.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedOrder && modalAction && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalAction.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-summary">
                <h3>Order #{selectedOrder.id.substring(0, 8)}</h3>
                <p><strong>Current Status:</strong> {selectedOrder.status}</p>
                <p><strong>New Status:</strong> {modalAction.status}</p>
              </div>

              <div className="modal-message">
                <p>{modalAction.message}</p>
              </div>

              <div className="items-summary">
                <h4>Items in this order:</h4>
                <ul>
                  {selectedOrder.items.map((item, index) => (
                    <li key={index}>
                      {item.name} - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              {assignedStaff[selectedOrder.id] && (
                <p className="assigned-info">
                  <strong>Assigned to:</strong> {assignedStaff[selectedOrder.id]}
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickPackDashboard;
