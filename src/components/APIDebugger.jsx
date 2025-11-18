import React, { useState, useEffect } from 'react';

const APIDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Gather debug information
    const info = {
      environment: import.meta.env.MODE,
      apiBase: import.meta.env.VITE_API_BASE,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      currentOrigin: window.location.origin,
      currentHost: window.location.host,
      userAgent: navigator.userAgent.substring(0, 100)
    };
    setDebugInfo(info);
  }, []);

  const testEndpoint = async (endpoint, name) => {
    setLoading(true);
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let responseData = '';
      try {
        if (response.ok) {
          const data = await response.json();
          responseData = Array.isArray(data) 
            ? `Array with ${data.length} items`
            : JSON.stringify(data).substring(0, 100);
        } else {
          responseData = await response.text();
        }
      } catch (e) {
        responseData = 'Could not parse response';
      }

      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          responseTime,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries()),
          error: null
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          ok: false,
          responseTime: 0,
          data: null,
          headers: {},
          error: error.message
        }
      }));
    }
    setLoading(false);
  };

  const runTests = () => {
    setTestResults({});
    
    // Test different endpoint variations
    const apiBase = import.meta.env.VITE_API_BASE || 'https://athukorala-traders-backend.onrender.com';
    
    testEndpoint(`${apiBase}/api/products`, 'products');
    testEndpoint(`${apiBase}/api/health`, 'health');
    testEndpoint(`https://athukorala-traders-backend.onrender.com/api/products`, 'direct-render');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">API Debug Dashboard</h2>
      
      {/* Environment Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Environment Information</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-600">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Run API Tests'}
        </button>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Test Results</h3>
          {Object.entries(testResults).map(([name, result]) => (
            <div key={name} className="mb-4 p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-gray-800">
                {name} - 
                <span className={result.ok ? 'text-green-600' : 'text-red-600'}>
                  {result.error ? 'ERROR' : `${result.status}`}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  ({result.responseTime}ms)
                </span>
              </h4>
              
              {result.error && (
                <div className="text-red-600 text-sm mb-2">
                  Error: {result.error}
                </div>
              )}
              
              {result.data && (
                <div className="text-sm text-gray-600 mb-2">
                  Data: {result.data}
                </div>
              )}
              
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer">Headers</summary>
                <pre className="mt-2 bg-gray-50 p-2 rounded">
                  {JSON.stringify(result.headers, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default APIDebugger;