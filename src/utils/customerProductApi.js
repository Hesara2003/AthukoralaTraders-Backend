// Customer-facing Product API using public endpoints that include promotion info
// Use relative /api base by default so dev proxy and same-origin deployments work
const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';
const PRODUCTS_PUBLIC = `${API_BASE}/api/products`;

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    
    // Log the full URL for debugging
    console.error('Failed request URL:', res.url);
    console.error('Status:', res.status, res.statusText);
    
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
      console.error('Error response:', data);
    } catch (e) {
      // Try to get text if JSON parsing fails
      try {
        const text = await res.text();
        if (text) {
          console.error('Error text:', text);
          message += `: ${text}`;
        }
      } catch (_) {}
    }
    
    throw new Error(message);
  }
  return res.json();
}

export const CustomerProductApi = {
  // Returns ProductDTO list (may not include id)
  list: () => {
    console.log('Fetching products from:', PRODUCTS_PUBLIC);
    return fetch(PRODUCTS_PUBLIC, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).then(handle);
  },
  
  // Returns ProductDetailDTO with discounted pricing and promotion info
  getById: (id) => {
    const url = `${PRODUCTS_PUBLIC}/${encodeURIComponent(id)}`;
    console.log('Fetching product by ID from:', url);
    return fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).then(handle);
  },
  
  // Search products by name, category, or SKU
  search: (searchTerm) => {
    const url = `${PRODUCTS_PUBLIC}/search?q=${encodeURIComponent(searchTerm)}`;
    console.log('Searching products:', url);
    return fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).then(handle);
  },
  
  // Advanced search with filters
  advancedSearch: (searchTerm = '', minPrice = null, maxPrice = null, availableOnly = false) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (minPrice !== null) params.append('minPrice', minPrice);
    if (maxPrice !== null) params.append('maxPrice', maxPrice);
    if (availableOnly) params.append('availableOnly', 'true');
    
    const url = `${PRODUCTS_PUBLIC}/search/advanced?${params.toString()}`;
    console.log('Advanced search:', url);
    return fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).then(handle);
  }
};

export default CustomerProductApi;
