const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

async function handle(res) {
  if (!res.ok) {
    let msg = 'Request failed: ' + res.status;
    try { const data = await res.json(); msg = typeof data === 'string' ? data : (data.message || msg); } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const SupplierApi = {
  list: () => fetch(base + '/api/admin/suppliers').then(handle)
};

export const PoApi = {
  list: () => fetch(base + '/api/supplier/purchase-orders').then(handle),
  get: (id) => fetch(base + '/api/supplier/purchase-orders/' + id).then(handle),
  create: (po) => fetch(base + '/api/supplier/purchase-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(po) }).then(handle),
  update: (id, po) => fetch(base + '/api/supplier/purchase-orders/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(po) }).then(handle),
  cancel: (id) => fetch(base + `/api/supplier/purchase-orders/${id}/cancel`, { method: 'POST' }).then(handle)
};
