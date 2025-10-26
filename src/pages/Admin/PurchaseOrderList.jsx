import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Link } from 'react-router-dom';

export default function PurchaseOrderList() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
    const url = base + '/api/admin/purchase-orders';
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load purchase orders: ' + res.status);
        const data = await res.json();
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
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
    const token = localStorage.getItem('token');
    setBusyId(id);
    try {
      const res = await fetch(`${base}/api/admin/purchase-orders/${id}/cancel`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data || 'Failed to cancel');
      setPos(prev => prev.map(p => p.id === id ? data : p));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <AdminLayout title="Purchase Orders" subtitle="List of all POs"><div className="text-gray-600">Loading purchase orders...</div></AdminLayout>;
  if (error) return <AdminLayout title="Purchase Orders"><div className="text-red-600">{error}</div></AdminLayout>;

  return (
    <AdminLayout
      title="Purchase Orders"
      subtitle="View all purchase orders in the system"
      actions={<Link to="/admin/purchase-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">New PO</Link>}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PO ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Items</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No purchase orders yet.</td>
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
                <td className="px-4 py-3 text-sm text-gray-600">{po.createdAt ? new Date(po.createdAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-sm flex gap-2 items-center">
                  {po.status === 'CREATED' ? (
                    <>
                    <Link to={`/admin/purchase-orders/${po.id}/edit`} className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Edit</Link>
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
    </AdminLayout>
  );
}
