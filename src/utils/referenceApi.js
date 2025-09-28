// Helper to fetch categories and products for selection lists
const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const CAT = base + '/api/admin/categories';
const PROD = base + '/api/admin/products';

async function handle(res){
  if(!res.ok) throw new Error('Request failed: '+res.status);
  return res.json();
}

export const ReferenceApi = {
  categories: () => fetch(CAT).then(handle),
  products: () => fetch(PROD).then(handle)
};
