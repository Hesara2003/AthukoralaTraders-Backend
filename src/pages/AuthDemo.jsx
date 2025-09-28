import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';

const AuthDemo = () => {
  const [currentMode, setCurrentMode] = useState('signin');

  const toggleMode = () => {
    setCurrentMode(prev => prev === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Demo Controls */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={toggleMode}
          className="bg-white px-6 py-3 rounded-full shadow-lg border-2 border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
        >
          Switch to {currentMode === 'signin' ? 'Signup' : 'Login'} 
          <span className="ml-2">🔄</span>
        </button>
      </div>

      <AuthLayout 
        mode={currentMode}
        title={currentMode === 'signin' ? 'Welcome Back' : 'Join Us Today'}
        subtitle={currentMode === 'signin' ? 'Sign in to your account' : 'Create your new account'}
        footerText={currentMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
        footerLink={currentMode === 'signin' ? '/signup' : '/login'}
        footerLinkText={currentMode === 'signin' ? 'Sign Up' : 'Sign In'}
      >
        <div className="space-y-4">
          <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🎨 Sliding Animation Demo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Watch the image panel slide when you switch between login and signup modes!
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Current mode: <strong>{currentMode}</strong></span>
            </div>
          </div>
          
          {/* Sample form elements to show the layout */}
          <div className="space-y-3">
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            {currentMode === 'signup' && (
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            )}
            <div className="h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
};

export default AuthDemo;