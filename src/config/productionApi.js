// Production API Configuration and CORS Fix
const getProductionApiConfig = () => {
  const backendUrl = 'https://athukorala-traders-backend.onrender.com';
  
  return {
    baseURL: backendUrl,
    apiURL: `${backendUrl}/api`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Add CORS headers for production
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
    timeout: 30000,
  };
};

// Test different backend endpoints to diagnose the issue
export const diagnoseBackendAPI = async () => {
  const config = getProductionApiConfig();
  const results = [];
  
  // Test endpoints to try
  const endpoints = [
    '/',
    '/health',
    '/actuator/health',
    '/api',
    '/api/health',
    '/api/public/health'
  ];
  
  for (const endpoint of endpoints) {
    const url = `${config.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit', // Don't send credentials for public endpoints
      });
      
      results.push({
        endpoint,
        url,
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: response.ok ? await response.text().catch(() => 'No body') : 'Error response'
      });
    } catch (error) {
      results.push({
        endpoint,
        url,
        success: false,
        error: error.message,
        type: error.name
      });
    }
  }
  
  return results;
};

// Enhanced API client with better error handling for production
export class ProductionApiClient {
  constructor() {
    this.config = getProductionApiConfig();
    this.retryCount = 3;
    this.retryDelay = 1000;
  }
  
  async makeRequest(endpoint, options = {}) {
    const url = `${this.config.apiURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const requestOptions = {
      method: 'GET',
      headers: {
        ...this.config.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'include',
      ...options,
    };
    
    // Remove body for GET requests
    if (requestOptions.method === 'GET') {
      delete requestOptions.body;
    }
    
    let lastError;
    
    // Retry logic for production
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        console.log(`🔄 API Request attempt ${attempt + 1}:`, { url, method: requestOptions.method });
        
        const response = await fetch(url, requestOptions);
        
        console.log(`📡 API Response:`, { 
          status: response.status, 
          statusText: response.statusText,
          ok: response.ok 
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text();
        }
        
      } catch (error) {
        lastError = error;
        console.error(`❌ API Request failed (attempt ${attempt + 1}):`, error.message);
        
        // Don't retry on client errors (4xx)
        if (error.message.includes('HTTP 4')) {
          break;
        }
        
        // Wait before retry
        if (attempt < this.retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError;
  }
  
  // Test connectivity
  async testConnection() {
    try {
      // Try different health check endpoints
      const healthEndpoints = ['/health', '/actuator/health', '/public/health'];
      
      for (const endpoint of healthEndpoints) {
        try {
          const result = await this.makeRequest(endpoint);
          return { success: true, endpoint, data: result };
        } catch (error) {
          console.log(`Health check failed for ${endpoint}:`, error.message);
        }
      }
      
      // If health checks fail, try a basic API call
      const result = await this.makeRequest('/products', { method: 'GET' });
      return { success: true, endpoint: '/products', data: result };
      
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        suggestions: this.getErrorSuggestions(error)
      };
    }
  }
  
  getErrorSuggestions(error) {
    const suggestions = [];
    
    if (error.message.includes('CORS')) {
      suggestions.push('CORS issue: Backend needs to allow frontend domain');
      suggestions.push('Check backend CORS configuration');
    }
    
    if (error.message.includes('403')) {
      suggestions.push('Authentication required: Try logging in first');
      suggestions.push('Backend may require API key or token');
    }
    
    if (error.message.includes('404')) {
      suggestions.push('Endpoint not found: Check API documentation');
      suggestions.push('Backend may not be deployed with expected endpoints');
    }
    
    if (error.message.includes('500')) {
      suggestions.push('Server error: Check backend logs');
      suggestions.push('Database or service may be down');
    }
    
    if (error.message.includes('Network')) {
      suggestions.push('Network issue: Check internet connection');
      suggestions.push('Backend server may be down');
    }
    
    return suggestions;
  }
}

export default new ProductionApiClient();