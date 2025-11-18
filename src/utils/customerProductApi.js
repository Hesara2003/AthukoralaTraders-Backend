// Customer-facing Product API using public endpoints that include promotion info
// Use environment variable with fallback to render backend
const API_BASE = import.meta.env.VITE_API_BASE || 'https://athukorala-traders-backend.onrender.com';
const PRODUCTS_PUBLIC = `${API_BASE}/api/products`;

// Log the configuration for debugging
console.log('CustomerProductApi Configuration:', {
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  API_BASE,
  PRODUCTS_PUBLIC,
  mode: import.meta.env.MODE
});

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

// Enhanced fetch function with retry and better error handling
async function fetchWithRetry(url, options = {}, retries = 2) {
  const defaultOptions = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors', // Explicitly set CORS mode
    cache: 'no-cache',
    ...options
  };

  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`Attempt ${i + 1} - Fetching:`, url);
      const response = await fetch(url, defaultOptions);
      return await handle(response);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      if (i === retries) {
        // Last attempt failed, try fallback
        if (url.includes('localhost') && import.meta.env.PROD) {
          console.log('Trying fallback URL for production...');
          const fallbackUrl = url.replace(/localhost:8080/, 'athukorala-traders-backend.onrender.com');
          return fetch(fallbackUrl, defaultOptions).then(handle);
        }
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export const CustomerProductApi = {
  // Returns ProductDTO list (may not include id)
  list: () => {
    console.log('Fetching products from:', PRODUCTS_PUBLIC);
    return fetchWithRetry(PRODUCTS_PUBLIC);
  },
  
  // Returns ProductDetailDTO with discounted pricing and promotion info
  getById: (id) => {
    const url = `${PRODUCTS_PUBLIC}/${encodeURIComponent(id)}`;
    console.log('Fetching product by ID from:', url);
    return fetchWithRetry(url);
  },
  
  // Search products by name, category, or SKU
  search: (searchTerm) => {
    const url = `${PRODUCTS_PUBLIC}/search?q=${encodeURIComponent(searchTerm)}`;
    console.log('Searching products:', url);
    return fetchWithRetry(url);
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
    return fetchWithRetry(url);
  }
};

export default CustomerProductApi;
