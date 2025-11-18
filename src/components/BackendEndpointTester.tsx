import { useState } from 'react';
import { apiConfig } from '@/config/api';

interface EndpointTest {
  path: string;
  name: string;
  status: number | null;
  success: boolean;
  message: string;
  accessible: boolean;
}

export function BackendEndpointTester() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<EndpointTest[]>([]);

  const testEndpoints = async () => {
    setTesting(true);
    const baseUrl = apiConfig.baseURL;
    
    const endpoints = [
      { path: '/', name: 'Root' },
      { path: '/actuator/health', name: 'Actuator Health' },
      { path: '/health', name: 'Health Check' },
      { path: '/api', name: 'API Root' },
      { path: '/api/health', name: 'API Health' },
      { path: '/api/public/health', name: 'Public Health' },
      { path: '/api/auth/login', name: 'Login Endpoint (POST)' },
      { path: '/api/products', name: 'Products API' }
    ];

    const testResults: EndpointTest[] = [];

    for (const endpoint of endpoints) {
      try {
        const url = `${baseUrl}${endpoint.path}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit'
        });

        testResults.push({
          path: endpoint.path,
          name: endpoint.name,
          status: response.status,
          success: response.ok,
          message: `${response.status} ${response.statusText}`,
          accessible: response.status !== 403
        });
      } catch (error) {
        testResults.push({
          path: endpoint.path,
          name: endpoint.name,
          status: null,
          success: false,
          message: error instanceof Error ? error.message : 'Network error',
          accessible: false
        });
      }
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusColor = (test: EndpointTest) => {
    if (test.success) return 'text-green-600 bg-green-50';
    if (test.status === 403) return 'text-orange-600 bg-orange-50';
    if (test.status === 404) return 'text-blue-600 bg-blue-50';
    return 'text-red-600 bg-red-50';
  };

  const serverStatus = () => {
    if (results.length === 0) return null;
    
    const allForbidden = results.every(r => r.status === 403);
    const someResponding = results.some(r => r.status !== null);
    
    if (allForbidden) {
      return {
        status: '🟡 Server Running - Security Blocking Requests',
        message: 'Backend is online but all endpoints return 403 Forbidden',
        recommendation: 'Check Spring Security configuration and ensure public endpoints are properly configured'
      };
    } else if (someResponding) {
      return {
        status: '🟢 Server Partially Accessible',
        message: 'Some endpoints are responding',
        recommendation: 'Review endpoint-specific configurations'
      };
    } else {
      return {
        status: '🔴 Server Down or Unreachable',
        message: 'No endpoints are responding',
        recommendation: 'Check Render deployment status and server logs'
      };
    }
  };

  const status = serverStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Backend Endpoint Testing</h2>
        <button
          onClick={testEndpoints}
          disabled={testing}
          className={`px-4 py-2 rounded-lg text-white font-medium ${
            testing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {testing ? 'Testing...' : 'Test Endpoints'}
        </button>
      </div>

      {status && (
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="font-medium text-lg mb-2">{status.status}</h3>
          <p className="text-gray-700 mb-2">{status.message}</p>
          <p className="text-sm text-blue-600">💡 {status.recommendation}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Endpoint Test Results</h3>
          <div className="space-y-1">
            {results.map((test, index) => (
              <div key={index} className={`p-3 rounded-lg ${getStatusColor(test)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{test.name}</span>
                    <span className="text-sm text-gray-600 ml-2">{test.path}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {test.status ? `${test.status}` : 'No Response'}
                  </div>
                </div>
                <div className="text-sm mt-1">{test.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">Diagnosis</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div><strong>Total Endpoints Tested:</strong> {results.length}</div>
            <div><strong>Responding:</strong> {results.filter(r => r.status !== null).length}</div>
            <div><strong>Accessible:</strong> {results.filter(r => r.accessible).length}</div>
            <div><strong>Forbidden (403):</strong> {results.filter(r => r.status === 403).length}</div>
            <div><strong>Not Found (404):</strong> {results.filter(r => r.status === 404).length}</div>
          </div>
        </div>
      )}
    </div>
  );
}