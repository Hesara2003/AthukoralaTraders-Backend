const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const PRODUCTS = base + '/api/admin/products';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch (_) {}
    throw new Error(message);
  }
  return res.json();
}

export const ProductApi = {
  list: () => fetch(PRODUCTS, { headers: { ...authHeaders() } }).then(handle),
  getById: (id) => fetch(`${PRODUCTS}/${encodeURIComponent(id)}`, { headers: { ...authHeaders() } }).then(handle),
};

export default ProductApi;
