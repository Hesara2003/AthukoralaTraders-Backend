import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SupplierLayout from '../../components/SupplierLayout';
import { SupplierApi, PoApi } from '../../utils/poApi';
import { ReferenceApi } from '../../utils/referenceApi';

function emptyItem() { return { productId: '', quantity: 1 }; }

export default function SupplierPurchaseOrderForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [po, setPo] = useState({ supplierId: '', items: [emptyItem()], deliveryDate: '' });
  const [status, setStatus] = useState('CREATED');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [sup, prods] = await Promise.all([SupplierApi.list(), ReferenceApi.products()]);
        setSuppliers(sup);
        setProducts(prods);
        if (editing) {
          const data = await PoApi.get(id);
          setPo({ supplierId: data.supplierId || '', items: data.items && data.items.length ? data.items : (data.productIds || []).map(pid => ({ productId: pid, quantity: 1 })), deliveryDate: data.deliveryDate || '' });
          setStatus(data.status || 'CREATED');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, editing]);

  const canEdit = status === 'CREATED';

  const onChangeItem = (idx, patch) => {
    setPo(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, ...patch } : it) }));
  };
  const addItem = () => setPo(p => ({ ...p, items: [...p.items, emptyItem()] }));
  const removeItem = (idx) => setPo(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const save = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...po };
      if (editing) await PoApi.update(id, payload); else await PoApi.create(payload);
      navigate('/supplier/purchase-orders');
    } catch (e2) {
      alert(e2.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SupplierLayout title={editing ? 'Edit Purchase Order' : 'New Purchase Order'}><div className="text-gray-600">Loading...</div></SupplierLayout>;
  if (error) return <SupplierLayout title="Purchase Order"><div className="text-red-600">{error}</div></SupplierLayout>;

  return (
    <SupplierLayout title={editing ? 'Edit Purchase Order' : 'New Purchase Order'}>
      {!canEdit && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">Only POs in CREATED status can be edited.</div>
      )}
      <form className="space-y-6" onSubmit={save}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select disabled={!canEdit} value={po.supplierId} onChange={e => setPo(p => ({ ...p, supplierId: e.target.value }))} className="w-full border rounded px-3 py-2">
              <option value="">Select supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
            <input type="date" disabled={!canEdit} value={po.deliveryDate || ''} onChange={e => setPo(p => ({ ...p, deliveryDate: e.target.value }))} className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <input value={status} disabled className="w-full border rounded px-3 py-2 bg-gray-50"/>
          </div>
        </div>

        <div className="bg-white border rounded">
          <div className="border-b px-4 py-2 font-medium">Items</div>
          <div className="p-4 space-y-3">
            {po.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <div className="md:col-span-4">
                  <select disabled={!canEdit} value={it.productId} onChange={e => onChangeItem(idx, { productId: e.target.value })} className="w-full border rounded px-3 py-2">
                    <option value="">Select product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <input type="number" min="1" disabled={!canEdit} value={it.quantity} onChange={e => onChangeItem(idx, { quantity: parseInt(e.target.value || '1', 10) })} className="w-full border rounded px-3 py-2"/>
                </div>
                <div className="text-right">
                  <button type="button" disabled={!canEdit} onClick={() => removeItem(idx)} className="px-3 py-2 text-red-600 disabled:text-gray-300">Remove</button>
                </div>
              </div>
            ))}
            <div>
              <button type="button" disabled={!canEdit} onClick={addItem} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">Add item</button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={!canEdit || saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : (editing ? 'Save Changes' : 'Create PO')}</button>
          <button type="button" className="px-4 py-2 bg-gray-100 rounded" onClick={() => navigate('/supplier/purchase-orders')}>Cancel</button>
        </div>
      </form>
    </SupplierLayout>
  );
}
