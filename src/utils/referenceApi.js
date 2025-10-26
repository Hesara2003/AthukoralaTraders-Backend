// Helper to fetch categories and products for selection lists
const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const CAT = base + '/api/admin/categories';
const PROD = base + '/api/admin/products';

// Helper function to get auth headers with Bearer token
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

async function handle(res){
  if(!res.ok) {
    console.error('ReferenceApi Error:', res.status);
    throw new Error('Request failed: '+res.status);
  }
  return res.json();
}

export const ReferenceApi = {
  categories: () => fetch(CAT, {
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle),
  
  products: () => fetch(PROD, {
    headers: authHeaders(),
    credentials: 'include'
  }).then(handle)
};
