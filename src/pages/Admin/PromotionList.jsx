import React, { useEffect, useState } from 'react';
import { PromotionApi } from '../../utils/promotionApi';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import AdminLayout from '../../components/AdminLayout';

const scopeLabel = (s) => s.charAt(0) + s.slice(1).toLowerCase();

export default function PromotionList() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = () => {
    setLoading(true);
    PromotionApi.list()
      .then(setPromotions)
      .catch(e => setError(e.message))
      .finally(()=> setLoading(false));
  };

  useEffect(()=>{ load(); }, []);

  const onDelete = (id) => {
    if (!window.confirm('Delete this promotion?')) return;
    PromotionApi.delete(id)
      .then(()=> load())
      .catch(e => alert(e.message));
  };

  const filtered = promotions.filter(p => {
    const matchText = p.name.toLowerCase().includes(search.toLowerCase()) || String(p.discountPercent).includes(search);
    const matchScope = scopeFilter === 'ALL' || p.scope === scopeFilter;
    return matchText && matchScope;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe-1)*pageSize, pageSafe*pageSize);

  if (loading) return <AdminLayout title="Promotions" subtitle="Manage discount campaigns"><div className="text-gray-600">Loading promotions...</div></AdminLayout>;
  if (error) return <AdminLayout title="Promotions"><div className="text-red-600">Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout
      title="Promotions"
      subtitle={`Manage discount campaigns (${filtered.length})`}
      actions={<Link to="/admin/promotions/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">New Promotion</Link>}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <input placeholder="Search name or %" value={search} onChange={e=> {setSearch(e.target.value); setPage(1);}} className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <select value={scopeFilter} onChange={e=> {setScopeFilter(e.target.value); setPage(1);}} className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="ALL">All Scopes</option>
              <option value="GLOBAL">Global</option>
              <option value="CATEGORY">Category</option>
              <option value="PRODUCT">Product</option>
            </select>
          </div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-600">No promotions found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Window</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paged.map(p => {
                  const start = p.startDate ? new Date(p.startDate) : null;
                  const end = p.endDate ? new Date(p.endDate) : null;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{scopeLabel(p.scope)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.discountPercent}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-xs">
                        {start && end ? `${start.toLocaleString()} - ${end.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge promotion={p} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link to={`/admin/promotions/${p.id}/edit`} className="text-blue-600 hover:text-blue-800">Edit</Link>
                        <button onClick={()=> onDelete(p.id)} className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-600">Page {pageSafe} / {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={pageSafe===1} onClick={()=> setPage(p=> Math.max(1,p-1))} className="border px-3 py-1 rounded disabled:opacity-40">Prev</button>
                <button disabled={pageSafe===totalPages} onClick={()=> setPage(p=> Math.min(totalPages,p+1))} className="border px-3 py-1 rounded disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
