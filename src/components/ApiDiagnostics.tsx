import { useState, useEffect } from 'react';
import { apiConfig } from '@/config/api';
import backendChecker from '@/utils/backendChecker';

interface DiagnosticsState {
  loading: boolean;
  config: {
    environment: string;
    isDev: boolean;
    isProd: boolean;
    baseURL: string;
    apiURL: string;
    hasToken: boolean;
  } | null;
  connectionTest: {
    success: boolean;
    message: string;
    status?: number;
    error?: string;
  } | null;
  timestamp: string | null;
}

export function ApiDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    loading: true,
    config: null,
    connectionTest: null,
    timestamp: null
  });

  const runDiagnostics = async () => {
    setDiagnostics(prev => ({ ...prev, loading: true }));
    
    try {
      // Simple connection test
      const backendUrl = apiConfig.baseURL;
      let connectionResult = { success: false, message: 'Connection failed' };
      
      try {
        const response = await fetch(`${backendUrl}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          credentials: 'omit'
        });
        
        connectionResult = {
          success: response.ok,
          message: response.ok ? 'Backend is accessible' : `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        };
      } catch (fetchError) {
        // Try alternative endpoints
        const endpoints = ['/', '/actuator/health'];
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(`${backendUrl}${endpoint}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              mode: 'cors',
              credentials: 'omit'
            });
            
            if (response.ok || response.status < 500) {
              connectionResult = {
                success: response.status < 400,
                message: `Backend responded via ${endpoint} - Status: ${response.status}`,
                status: response.status
              };
              break;
            }
          } catch (e) {
            // Continue to next endpoint
          }
        }
        
        if (!connectionResult.success && connectionResult.message === 'Connection failed') {
          connectionResult = {
            success: false,
            message: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
            error: fetchError instanceof Error ? fetchError.message : 'Unknown error'
          };
        }
      }
      
      setDiagnostics({
        loading: false,
        config: {
          environment: (import.meta as any).env.MODE || 'unknown',
          isDev: (import.meta as any).env.DEV || false,
          isProd: (import.meta as any).env.PROD || false,
          baseURL: apiConfig.baseURL,
          apiURL: apiConfig.apiURL,
          hasToken: !!localStorage.getItem('token')
        },
        connectionTest: connectionResult,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        loading: false,
        connectionTest: {
          success: false,
          message: `Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toLocaleString()
      }));
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  if (diagnostics.loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="text-blue-600">Running API diagnostics...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">API Diagnostics</h3>
        <button
          onClick={runDiagnostics}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      
      <div className="text-xs text-gray-500">Last updated: {diagnostics.timestamp}</div>
      
      {/* Configuration */}
      {diagnostics.config && (
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Environment:</strong> {diagnostics.config.environment}</div>
            <div><strong>Mode:</strong> {diagnostics.config.isDev ? 'Development' : 'Production'}</div>
            <div><strong>Base URL:</strong> {diagnostics.config.baseURL}</div>
            <div><strong>API URL:</strong> {diagnostics.config.apiURL}</div>
            <div><strong>Has Token:</strong> {diagnostics.config.hasToken ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

      {/* Connection Test */}
      {diagnostics.connectionTest && (
        <div className={`p-3 rounded ${
          diagnostics.connectionTest.success ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <h4 className={`font-medium mb-2 ${
            diagnostics.connectionTest.success ? 'text-green-900' : 'text-red-900'
          }`}>
            Connection Test
          </h4>
          <div className={`text-sm ${
            diagnostics.connectionTest.success ? 'text-green-700' : 'text-red-700'
          }`}>
            <div><strong>Status:</strong> {diagnostics.connectionTest.success ? 'Success' : 'Failed'}</div>
            <div><strong>Message:</strong> {diagnostics.connectionTest.message}</div>
            {diagnostics.connectionTest.status && (
              <div><strong>HTTP Status:</strong> {diagnostics.connectionTest.status}</div>
            )}
            {diagnostics.connectionTest.error && (
              <div><strong>Error:</strong> {diagnostics.connectionTest.error}</div>
            )}
          </div>
        </div>
      )}

      {/* Environment Variables */}
      <div className="bg-yellow-50 p-3 rounded">
        <h4 className="font-medium text-yellow-900 mb-2">Environment Variables</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <div><strong>VITE_API_BASE:</strong> {(import.meta as any).env.VITE_API_BASE || 'Not set'}</div>
          <div><strong>VITE_API_BASE_URL:</strong> {(import.meta as any).env.VITE_API_BASE_URL || 'Not set'}</div>
          <div><strong>VITE_GOOGLE_CLIENT_ID:</strong> {(import.meta as any).env.VITE_GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}</div>
        </div>
      </div>
    </div>
  );
}