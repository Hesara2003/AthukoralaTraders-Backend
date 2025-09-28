// Customer-facing Product API using public endpoints that include promotion info
const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const PRODUCTS_PUBLIC = base + '/api/products';

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

export const CustomerProductApi = {
  // Returns ProductDTO list (may not include id)
  list: () => fetch(PRODUCTS_PUBLIC).then(handle),
  // Returns ProductDetailDTO with discounted pricing and promotion info
  getById: (id) => fetch(`${PRODUCTS_PUBLIC}/${encodeURIComponent(id)}`).then(handle),
};

export default CustomerProductApi;
