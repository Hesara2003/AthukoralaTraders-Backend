const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const PRODUCTS = base + '/api/admin/products';

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
    let message = `Request failed: ${res.status}`;
    
    // Handle specific error codes
    if (res.status === 401) {
      message = 'Unauthorized - Please log in again';
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      // Optionally redirect to login
      // window.location.href = '/business-login';
    } else if (res.status === 403) {
      message = 'Forbidden - You do not have permission to access this resource';
    }
    
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch (_) {}
    
    console.error(`API Error (${res.status}):`, message);
    throw new Error(message);
  }
  return res.json();
}

export const ProductApi = {
  list: () => fetch(PRODUCTS, { 
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  get: (id) => fetch(`${PRODUCTS}/${encodeURIComponent(id)}`, { 
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  getById: (id) => fetch(`${PRODUCTS}/${encodeURIComponent(id)}`, { 
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  create: (productData) => fetch(PRODUCTS, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(productData)
  }).then(handle),
  
  update: (id, productData) => fetch(`${PRODUCTS}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(productData)
  }).then(handle),
  
  delete: (id) => fetch(`${PRODUCTS}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  // Search products by name, category, or SKU
  search: (searchTerm) => fetch(`${PRODUCTS}/search?q=${encodeURIComponent(searchTerm)}`, { 
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  // Advanced search with filters
  advancedSearch: (searchTerm = '', minPrice = null, maxPrice = null, availableOnly = false) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (minPrice !== null) params.append('minPrice', minPrice);
    if (maxPrice !== null) params.append('maxPrice', maxPrice);
    if (availableOnly) params.append('availableOnly', 'true');
    
    return fetch(`${PRODUCTS}/search/advanced?${params.toString()}`, { 
      headers: authHeaders(),
      credentials: 'include'
    }).then(handle);
  }
};

export default ProductApi;
