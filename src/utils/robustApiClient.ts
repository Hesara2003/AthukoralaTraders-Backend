// Enhanced API configuration with fallback and error handling
const API_CONFIG = {
  // Primary backend (Render)
  primary: 'https://athukorala-traders-backend.onrender.com',
  
  // Fallback options (if you have them)
  fallbacks: [
    // Add any backup servers here
    // 'https://backup-server.herokuapp.com',
  ],
  
  // Local development
  local: 'http://localhost:8080'
};

export class RobustApiClient {
  private baseURL: string;
  private isProduction: boolean;
  private maxRetries: number;
  private timeout: number;

  constructor() {
    this.baseURL = this.determineBaseURL();
    this.isProduction = (import.meta as any).env.PROD;
    this.maxRetries = 3;
    this.timeout = 30000;
  }

  determineBaseURL() {
    // Use environment variable if available
    const envUrl = (import.meta as any).env.VITE_API_BASE;
    if (envUrl) return envUrl;
    
    // Fallback to configuration
    if (this.isProduction) {
      return API_CONFIG.primary;
    } else {
      return API_CONFIG.local;
    }
  }

  async makeRequest(endpoint: string, options: RequestInit = {}) {
    const urls = [this.baseURL, ...API_CONFIG.fallbacks];
    let lastError: Error | null = null;

    for (const baseUrl of urls) {
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          const url = `${baseUrl}/api${endpoint}`;
          
          const defaultOptions: RequestInit = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors',
            credentials: 'include',
            ...options,
          };

          // Add auth token if available
          const token = localStorage.getItem('token');
          if (token && defaultOptions.headers) {
            (defaultOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
          }

          console.log(`🔄 API Request: ${defaultOptions.method} ${url} (attempt ${attempt})`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);

          const response = await fetch(url, {
            ...defaultOptions,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Handle different response statuses
          if (response.ok) {
            console.log(`✅ Success: ${response.status} ${response.statusText}`);
            const contentType = response.headers.get('content-type');
            
            if (contentType?.includes('application/json')) {
              return await response.json();
            } else {
              return await response.text();
            }
          } else if (response.status === 403) {
            // 403 means server is running but blocking - don't retry other servers
            throw new Error(`Authentication required: ${response.status} ${response.statusText}`);
          } else if (response.status === 404) {
            // 404 might be endpoint issue - try other servers
            throw new Error(`Endpoint not found: ${response.status} ${response.statusText}`);
          } else if (response.status >= 500) {
            // Server error - retry
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          } else {
            // Client error - don't retry
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
          }

        } catch (error) {
          lastError = error as Error;
          console.log(`❌ Attempt ${attempt} failed: ${lastError.message}`);

          // Don't retry for auth errors or client errors
          if (lastError.message.includes('Authentication required') || 
              lastError.message.includes('Request failed')) {
            break;
          }

          // Wait before retry (exponential backoff)
          if (attempt < this.maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // If we got an auth error, don't try other servers
      if (lastError?.message.includes('Authentication required')) {
        break;
      }
    }

    throw lastError || new Error('All API requests failed');
  }

  // Convenience methods
  async get(endpoint: string) {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }

  // Health check that doesn't require auth
  async healthCheck() {
    const healthEndpoints = ['/health', '/actuator/health', '/public/health'];
    
    for (const endpoint of healthEndpoints) {
      try {
        const result = await this.makeRequest(endpoint);
        return { success: true, endpoint, data: result };
      } catch (error) {
        console.log(`Health check failed for ${endpoint}: ${error}`);
      }
    }
    
    throw new Error('All health check endpoints failed');
  }
}

// Export singleton instance
export const apiClient = new RobustApiClient();
export default apiClient;