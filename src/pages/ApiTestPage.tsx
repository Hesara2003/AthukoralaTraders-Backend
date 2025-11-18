import PublicLayout from '../components/PublicLayout';
import { ApiDiagnostics } from '../components/ApiDiagnostics';
import { BackendEndpointTester } from '../components/BackendEndpointTester';

/// <reference types="vite/client" />

const ApiTestPage = () => {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">API Diagnostics</h1>
          <p className="text-gray-600 mb-8">
            This page helps diagnose API connection issues for the deployed application.
          </p>
          
          <ApiDiagnostics />
          
          <BackendEndpointTester />
          
          {/* Quick Actions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="block w-full text-left px-3 py-2 bg-white border rounded hover:bg-gray-50"
              >
                Clear Local Storage & Refresh
              </button>
              <button
                onClick={() => {
                  console.log('Current localStorage:', Object.keys(localStorage));
                console.log('Environment variables:', {
                  VITE_API_BASE: (import.meta as any).env.VITE_API_BASE,
                  VITE_API_BASE_URL: (import.meta as any).env.VITE_API_BASE_URL,
                  MODE: (import.meta as any).env.MODE,
                  DEV: (import.meta as any).env.DEV,
                  PROD: (import.meta as any).env.PROD
                });
                }}
                className="block w-full text-left px-3 py-2 bg-white border rounded hover:bg-gray-50"
              >
                Log Debug Info to Console
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ApiTestPage;