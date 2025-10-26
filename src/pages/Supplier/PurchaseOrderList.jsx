import React, { useEffect, useState } from 'react';
import SupplierLayout from '../../components/SupplierLayout';
import DeliveryTimelineModal from '../../components/DeliveryTimelineModal';
import DeliveryStatusBadge from '../../components/DeliveryStatusBadge';
import { Link } from 'react-router-dom';
import { PoApi } from '../../utils/poApi';
import { notifyDeliveryTimelineUpdate } from '../../utils/poNotificationService';

export default function SupplierPurchaseOrderList() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await PoApi.list();
        setPos(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cancelPo = async (id) => {
    if (!confirm('Cancel this purchase order?')) return;
    setBusyId(id);
    try {
      const data = await PoApi.cancel(id);
      setPos(prev => prev.map(p => p.id === id ? data : p));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const openDeliveryModal = (po) => {
    setSelectedPo(po);
    setDeliveryModalOpen(true);
  };

  const closeDeliveryModal = () => {
    setDeliveryModalOpen(false);
    setSelectedPo(null);
  };

  const updateDeliveryDate = async (id, newDeliveryDate, reason) => {
    setBusyId(id);
    try {
      // Get the current PO to get the old delivery date
      const currentPo = pos.find(p => p.id === id);
      const oldDeliveryDate = currentPo?.deliveryDate;
      
      // Update the delivery date
      const updated = await PoApi.updateDeliveryDate(id, newDeliveryDate);
      setPos(prev => prev.map(p => p.id === id ? updated : p));
      
      // Send notifications to staff and customers
      try {
        await notifyDeliveryTimelineUpdate(updated, oldDeliveryDate, newDeliveryDate);
        alert('Delivery date updated successfully! Staff and customers have been notified.');
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
        alert('Delivery date updated successfully, but there was an issue sending notifications. Please inform the team manually.');
      }
    } catch (e) {
      alert('Error updating delivery date: ' + e.message);
      throw e; // Re-throw to let the modal handle it
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <SupplierLayout title="Purchase Orders" subtitle="List of all POs"><div className="text-gray-600">Loading purchase orders...</div></SupplierLayout>;
  if (error) return <SupplierLayout title="Purchase Orders"><div className="text-red-600">{error}</div></SupplierLayout>;

  return (
    <SupplierLayout
      title="Purchase Orders"
      subtitle="View all purchase orders in the system"
      actions={<Link to="/supplier/purchase-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">New PO</Link>}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PO ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Items</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Delivery Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">No purchase orders yet.</td>
              </tr>
            )}
            {pos.map(po => (
              <tr key={po.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 font-mono truncate max-w-[240px]">{po.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{po.supplierId || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{po.productIds ? po.productIds.length : 0}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${po.status === 'CREATED' ? 'bg-amber-100 text-amber-700' : po.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : po.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{po.status || '—'}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex gap-2 items-center">
                    <span>{po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : '—'}</span>
                    {(po.status === 'CREATED' || po.status === 'APPROVED') && (
                      <button
                        onClick={() => openDeliveryModal(po)}
                        disabled={busyId === po.id}
                        className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-50"
                        title="Update delivery timeline"
                      >
                        {busyId === po.id ? '⏳' : '�'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{po.createdAt ? new Date(po.createdAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-sm flex gap-2 items-center">
                  {po.status === 'CREATED' ? (
                    <>
                    <Link to={`/supplier/purchase-orders/${po.id}/edit`} className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Edit</Link>
                    <button
                      className="px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => cancelPo(po.id)}
                      disabled={busyId === po.id}
                    >{busyId === po.id ? 'Canceling...' : 'Cancel'}</button>
                    </>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeliveryTimelineModal
        po={selectedPo}
        isOpen={deliveryModalOpen}
        onClose={closeDeliveryModal}
        onUpdate={updateDeliveryDate}
      />
    </SupplierLayout>
  );
}

