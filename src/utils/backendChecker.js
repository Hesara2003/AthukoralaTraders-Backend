// Backend Status and Endpoint Checker
export class BackendChecker {
  constructor(baseUrl = 'https://athukorala-traders-backend.onrender.com') {
    this.baseUrl = baseUrl;
    this.endpoints = [
      // Public endpoints that should work without auth
      { path: '/', name: 'Root', public: true },
      { path: '/actuator/health', name: 'Actuator Health', public: true },
      { path: '/health', name: 'Health Check', public: true },
      { path: '/api/public/health', name: 'Public Health API', public: true },
      
      // Auth endpoints that should accept POST
      { path: '/api/auth/login', name: 'Login API', public: true, method: 'POST' },
      { path: '/api/auth/register', name: 'Register API', public: true, method: 'POST' },
      
      // Protected endpoints
      { path: '/api/products', name: 'Products API', public: false },
      { path: '/api/users', name: 'Users API', public: false },
      { path: '/api/orders', name: 'Orders API', public: false }
    ];
  }

  async checkEndpoint(endpoint, token = null) {
    const url = `${this.baseUrl}${endpoint.path}`;
    const method = endpoint.method || 'GET';
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': window.location.origin
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers,
      mode: 'cors',
      credentials: 'include'
    };
    
    // Add empty body for POST requests
    if (method === 'POST') {
      options.body = JSON.stringify({});
    }
    
    try {
      const response = await fetch(url, options);
      
      return {
        endpoint: endpoint.name,
        path: endpoint.path,
        method,
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        accessible: response.status !== 403,
        data: response.ok ? await response.text().catch(() => 'No body') : null,
        error: null
      };
    } catch (error) {
      return {
        endpoint: endpoint.name,
        path: endpoint.path,
        method,
        success: false,
        status: 0,
        statusText: 'Network Error',
        accessible: false,
        data: null,
        error: error.message
      };
    }
  }

  async checkAllEndpoints(token = null) {
    const results = [];
    
    console.log('🔍 Starting backend endpoint check...');
    
    for (const endpoint of this.endpoints) {
      const result = await this.checkEndpoint(endpoint, token);
      results.push(result);
      
      const status = result.accessible ? '✅' : '❌';
      console.log(`${status} ${endpoint.name}: ${result.status} ${result.statusText}`);
    }
    
    return {
      baseUrl: this.baseUrl,
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        accessible: results.filter(r => r.accessible).length,
        successful: results.filter(r => r.success).length,
        forbidden: results.filter(r => r.status === 403).length
      },
      results
    };
  }

  async diagnoseIssues() {
    const check = await this.checkAllEndpoints();
    const issues = [];
    const recommendations = [];
    
    if (check.summary.forbidden === check.summary.total) {
      issues.push('🚫 ALL endpoints return 403 Forbidden');
      recommendations.push('Backend security is blocking all requests');
      recommendations.push('Check Spring Security configuration');
      recommendations.push('Ensure public endpoints are properly configured');
    }
    
    if (check.summary.accessible === 0) {
      issues.push('🔌 No endpoints are accessible');
      recommendations.push('Backend may be misconfigured');
      recommendations.push('Check CORS settings');
      recommendations.push('Verify deployment configuration');
    }
    
    const serverRunning = check.results.some(r => r.status === 403);
    if (serverRunning) {
      issues.push('✅ Server is running (returns 403 instead of network error)');
    } else {
      issues.push('❌ Server may be down or unreachable');
      recommendations.push('Check Render deployment status');
      recommendations.push('Verify server is not in sleep mode');
    }
    
    return {
      serverStatus: serverRunning ? 'RUNNING_BUT_BLOCKED' : 'DOWN_OR_UNREACHABLE',
      issues,
      recommendations,
      fullReport: check
    };
  }

  // Create a test user token for authenticated endpoint testing
  async attemptLogin(credentials = { email: 'test@test.com', password: 'test123' }) {
    try {
      const result = await this.checkEndpoint(
        { path: '/api/auth/login', name: 'Login', method: 'POST' },
        null
      );
      
      // Even if login fails, we can see if the endpoint is properly configured
      return {
        loginAttempted: true,
        endpointAccessible: result.status !== 403,
        result
      };
    } catch (error) {
      return {
        loginAttempted: false,
        endpointAccessible: false,
        error: error.message
      };
    }
  }
}

export default new BackendChecker();