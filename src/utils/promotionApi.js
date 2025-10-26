// Promotion API helper
// Assumes backend base URL set via VITE_API_BASE (e.g., http://localhost:8080)

const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const ADMIN_PROMO_BASE = base + '/api/admin/promotions';

function authHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

async function handle(res) {
  if (!res.ok) {
    let msg = 'Request failed ' + res.status;
    
    // Handle specific error codes
    if (res.status === 401) {
      msg = 'Unauthorized - Please log in again';
      console.error('Token invalid or expired');
    } else if (res.status === 403) {
      msg = 'Forbidden - Admin access required';
      console.error('User does not have admin permissions');
    }
    
    try { 
      const data = await res.json(); 
      msg = data.message || JSON.stringify(data); 
    } catch (_) {}
    
    console.error('PromotionApi Error:', msg);
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const PromotionApi = {
  list: () => fetch(ADMIN_PROMO_BASE, { 
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  get: (id) => fetch(`${ADMIN_PROMO_BASE}/${id}`, { 
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  create: (promotion) => fetch(ADMIN_PROMO_BASE, { 
    method: 'POST', 
    headers: authHeaders(), 
    credentials: 'include',
    body: JSON.stringify(promotion) 
  }).then(handle),
  
  update: (id, promotion) => fetch(`${ADMIN_PROMO_BASE}/${id}`, { 
    method: 'PUT', 
    headers: authHeaders(), 
    credentials: 'include',
    body: JSON.stringify(promotion) 
  }).then(handle),
  
  delete: (id) => fetch(`${ADMIN_PROMO_BASE}/${id}`, { 
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
};

export function emptyPromotion() {
  const now = new Date();
  const inWeek = new Date(now.getTime() + 7*24*60*60*1000);
  return {
    name: '',
    scope: 'GLOBAL',
    productId: '',
    categoryId: '',
    discountPercent: 0,
    startDate: now.toISOString().slice(0,16), // for datetime-local
    endDate: inWeek.toISOString().slice(0,16),
    active: true
  };
}
