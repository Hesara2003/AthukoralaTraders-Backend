// Centralized API configuration
const getApiConfig = () => {
  // Get base URL from environment variables
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
  
  // Remove trailing slash if present
  const baseURL = API_BASE.replace(/\/$/, '');
  
  console.log('API Configuration:', {
    environment: import.meta.env.MODE,
    baseURL: baseURL,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD
  });
  
  return {
    baseURL,
    apiURL: `${baseURL}/api`,
    timeout: 30000, // 30 second timeout
  };
};

// Get auth headers for API requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Common error handler for all API calls
export const handleApiError = (error, context = 'API') => {
  console.error(`${context} Error:`, error);
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        localStorage.removeItem('token');
        return new Error('Authentication required. Please login again.');
      case 403:
        return new Error('Access denied. Insufficient permissions.');
      case 404:
        return new Error(data?.message || 'Resource not found.');
      case 400:
        return new Error(data?.message || 'Invalid request data.');
      case 429:
        return new Error('Too many requests. Please try again later.');
      case 500:
        return new Error('Server error. Please try again later.');
      case 502:
      case 503:
      case 504:
        return new Error('Service unavailable. Please try again later.');
      default:
        return new Error(data?.message || `HTTP ${status}: Request failed.`);
    }
  } else if (error.request) {
    return new Error('Network error: Unable to connect to server. Please check your connection.');
  } else {
    return new Error(error.message || 'An unexpected error occurred.');
  }
};

// Test API connection
export const testApiConnection = async () => {
  const { apiURL } = getApiConfig();
  
  try {
    const response = await fetch(`${apiURL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'API connection successful' : 'API connection failed'
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: `Connection failed: ${error.message}`,
      error: error
    };
  }
};

export const apiConfig = getApiConfig();
export default apiConfig;