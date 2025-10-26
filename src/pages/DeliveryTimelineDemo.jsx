import React, { useState } from 'react';
import DeliveryTimelineModal from '../components/DeliveryTimelineModal';
import DeliveryStatusBadge from '../components/DeliveryStatusBadge';

const DeliveryTimelineDemo = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [pos, setPos] = useState([
    {
      id: 'PO-2025-001',
      supplierId: 'supplier-001',
      productIds: ['prod1', 'prod2', 'prod3'],
      status: 'APPROVED',
      deliveryDate: '2025-10-15',
      createdAt: '2025-10-01T10:00:00Z'
    },
    {
      id: 'PO-2025-002', 
      supplierId: 'supplier-002',
      productIds: ['prod4', 'prod5'],
      status: 'CREATED',
      deliveryDate: '2025-10-20',
      createdAt: '2025-10-02T14:30:00Z'
    },
    {
      id: 'PO-2025-003',
      supplierId: 'supplier-001',
      productIds: ['prod6'],
      status: 'RECEIVED',
      deliveryDate: '2025-10-05',
      createdAt: '2025-09-25T09:15:00Z'
    }
  ]);

  const openDeliveryModal = (po) => {
    setSelectedPo(po);
    setModalOpen(true);
  };

  const closeDeliveryModal = () => {
    setModalOpen(false);
    setSelectedPo(null);
  };

  const updateDeliveryDate = async (id, newDeliveryDate, reason) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedPos = pos.map(p => 
      p.id === id ? { ...p, deliveryDate: newDeliveryDate } : p
    );
    setPos(updatedPos);
    
    // Mock notification
    console.log('📧 Mock Email Notifications Sent:', {
      to: ['admin@athukoralatraders.com', 'inventory@athukoralatraders.com'],
      subject: `Delivery Timeline Updated - Purchase Order #${id}`,
      newDeliveryDate,
      reason
    });
    
    alert('Delivery date updated successfully! Mock notifications sent to staff.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🚀 Delivery Timeline Update - Feature Demo
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              This demo shows the new delivery timeline update features without requiring authentication
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900">
              ✨ New Features Demonstrated Below:
            </h2>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Enhanced delivery date column with visual status indicators</li>
              <li>• Professional modal for updating delivery timelines</li>
              <li>• Automatic staff notifications (mock implementation)</li>
              <li>• Status-based permissions (CREATED/APPROVED orders can be updated)</li>
            </ul>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PO ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  🆕 Delivery Date & Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  🆕 Update Timeline
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pos.map(po => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">{po.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{po.supplierId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{po.productIds.length} items</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      po.status === 'CREATED' ? 'bg-amber-100 text-amber-700' :
                      po.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                      po.status === 'RECEIVED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DeliveryStatusBadge deliveryDate={po.deliveryDate} status={po.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(po.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {(po.status === 'CREATED' || po.status === 'APPROVED') ? (
                      <button
                        onClick={() => openDeliveryModal(po)}
                        className="px-3 py-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium"
                      >
                        📅 Update Timeline
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {po.status === 'RECEIVED' ? '✅ Delivered' : '🚫 Cannot Update'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🎯 How to Test the New Features:
          </h3>
          <ol className="text-sm text-green-800 space-y-1 ml-4">
            <li>1. Click "📅 Update Timeline" on any CREATED or APPROVED order</li>
            <li>2. Select a new delivery date in the modal</li>
            <li>3. Optionally add a reason for the change</li>
            <li>4. Click "Update Delivery Date"</li>
            <li>5. Check the browser console (F12) to see mock notifications</li>
            <li>6. Notice the visual status indicators update</li>
          </ol>
        </div>
      </div>

      <DeliveryTimelineModal
        po={selectedPo}
        isOpen={modalOpen}
        onClose={closeDeliveryModal}
        onUpdate={updateDeliveryDate}
      />
    </div>
  );
};

export default DeliveryTimelineDemo;