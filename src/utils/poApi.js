const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

// Helper function to get auth headers with Bearer token
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

async function handle(res) {
  if (!res.ok) {
    let msg = 'Request failed: ' + res.status;
    try { 
      const data = await res.json(); 
      msg = typeof data === 'string' ? data : (data.message || msg); 
    } catch {}
    console.error('API Error:', msg);
    throw new Error(msg);
  }
  return res.json();
}

export const SupplierApi = {
  list: () => fetch(base + '/api/admin/suppliers', {
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle)
};

export const PoApi = {
  list: () => fetch(base + '/api/supplier/purchase-orders', {
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  get: (id) => fetch(base + '/api/supplier/purchase-orders/' + id, {
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  create: (po) => fetch(base + '/api/supplier/purchase-orders', { 
    method: 'POST', 
    headers: authHeaders(), 
    credentials: 'include',
    body: JSON.stringify(po) 
  }).then(handle),
  
  update: (id, po) => fetch(base + '/api/supplier/purchase-orders/' + id, { 
    method: 'PUT', 
    headers: authHeaders(), 
    credentials: 'include',
    body: JSON.stringify(po) 
  }).then(handle),
  
  cancel: (id) => fetch(base + `/api/supplier/purchase-orders/${id}/cancel`, { 
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  updateDeliveryDate: (id, deliveryDate, reason) => fetch(base + `/api/supplier/purchase-orders/${id}/delivery-date`, { 
    method: 'POST', 
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ deliveryDate, reason }) 
  }).then(handle),
  
  updateStatus: (id, status, notes) => fetch(base + `/api/supplier/purchase-orders/${id}/status`, { 
    method: 'POST', 
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status, notes }) 
  }).then(handle)
};
