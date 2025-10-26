// Admin Product API client (uses backend admin endpoints)
const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';
const ADMIN_PRODUCTS = `${API_BASE}/api/admin/products`;

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
    let message = `Admin product API failed (${res.status})`;
    
    // Handle specific error codes
    if (res.status === 401) {
      message = 'Unauthorized - Please log in again';
      console.error('Token invalid or expired');
    } else if (res.status === 403) {
      message = 'Forbidden - Admin access required';
      console.error('User does not have admin permissions');
    }
    
    try {
      const text = await res.text();
      if (text) message += `: ${text}`;
    } catch (_) {}
    
    console.error('AdminProductApi Error:', message);
    throw new Error(message);
  }
  return res.json();
}

export const AdminProductApi = {
  list: () => fetch(ADMIN_PRODUCTS, { 
    credentials: 'include', 
    headers: authHeaders()
  }).then(handle),
  
  getById: (id) => fetch(`${ADMIN_PRODUCTS}/${encodeURIComponent(id)}`, { 
    credentials: 'include', 
    headers: authHeaders()
  }).then(handle),
};

export default AdminProductApi;
