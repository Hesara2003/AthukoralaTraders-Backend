import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PromotionApi, emptyPromotion } from '../../utils/promotionApi';
import { ReferenceApi } from '../../utils/referenceApi';
import AdminLayout from '../../components/AdminLayout';

export default function PromotionForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(emptyPromotion());
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(()=> {
    if (editing) {
      setLoading(true);
      PromotionApi.get(id)
        .then(found => {
          const adapt = (d) => d ? new Date(d).toISOString().slice(0,16) : '';
          setPromotion({ ...found, startDate: adapt(found.startDate), endDate: adapt(found.endDate) });
        })
        .catch(e => setError(e.message))
        .finally(()=> setLoading(false));
    }
  }, [editing, id]);

  useEffect(()=> {
    ReferenceApi.categories().then(setCategories).catch(()=>{});
    ReferenceApi.products().then(setProducts).catch(()=>{});
  }, []);

  const updateField = (field, value) => setPromotion(prev => ({ ...prev, [field]: value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const toIso = (val) => val ? new Date(val).toISOString().replace('Z','') : null;
    const payload = {
      ...promotion,
      startDate: toIso(promotion.startDate),
      endDate: toIso(promotion.endDate),
      productId: promotion.scope === 'PRODUCT' ? promotion.productId || null : null,
      categoryId: promotion.scope === 'CATEGORY' ? promotion.categoryId || null : null,
    };
    const op = editing ? PromotionApi.update(id, payload) : PromotionApi.create(payload);
    op.then(()=> navigate('/admin/promotions'))
      .catch(e => setError(e.message))
      .finally(()=> setSaving(false));
  };

  if (loading) return <AdminLayout title={editing ? 'Edit Promotion' : 'New Promotion'}><div className="text-gray-600">Loading...</div></AdminLayout>;
  if (error) return <AdminLayout title="Promotion Error"><div className="text-red-600">Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout title={editing ? 'Edit Promotion' : 'New Promotion'} subtitle={editing ? 'Update existing promotion' : 'Create a new promotion'}>
      <div className="max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name *</label>
              <input value={promotion.name} onChange={e=> updateField('name', e.target.value)} required className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Scope *</label>
              <select value={promotion.scope} onChange={e=> updateField('scope', e.target.value)} className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="GLOBAL">Global</option>
                <option value="CATEGORY">Category</option>
                <option value="PRODUCT">Product</option>
              </select>
            </div>
            {promotion.scope === 'CATEGORY' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Category *</label>
                <select value={promotion.categoryId} onChange={e=> updateField('categoryId', e.target.value)} required className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            {promotion.scope === 'PRODUCT' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Product *</label>
                <select value={promotion.productId} onChange={e=> updateField('productId', e.target.value)} required className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">-- Select Product --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Discount Percent (0-100)</label>
              <input type="number" min="0" max="100" step="0.01" value={promotion.discountPercent} onChange={e=> updateField('discountPercent', parseFloat(e.target.value)||0)} className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                <input type="datetime-local" value={promotion.startDate} onChange={e=> updateField('startDate', e.target.value)} className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                <input type="datetime-local" value={promotion.endDate} onChange={e=> updateField('endDate', e.target.value)} className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={promotion.active} onChange={e=> updateField('active', e.target.checked)} className="h-4 w-4" />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </div>
          <div className="flex gap-3 pt-2">
            <button disabled={saving} type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Promotion'}</button>
            <button type="button" onClick={()=> navigate('/admin/promotions')} className="px-5 py-2 rounded-lg text-sm font-medium border bg-white hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
