import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useGoogleAuth } from '../services/googleAuth';

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GoogleOAuthButton = ({ onSuccess, onError, type = 'signin', disabled = false, className = '' }) => {
  const { signIn, isLoading, isInitialized } = useGoogleAuth();
  const [localLoading, setLocalLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || localLoading) return;

    setLocalLoading(true);
    try {
      // Attempt sign-in; hook will initialize if needed
      const result = await signIn();
      
      if (!result || !result.profile) {
        throw new Error('No user data received from Google');
      }
      
      // Send Google OAuth data to backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: result.idToken,
          profile: result.profile,
          type: type // 'signin' or 'signup'
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        onSuccess(data);
      } else {
        throw new Error(data.error || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      onError(error.message || 'Google authentication failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonLoading = isLoading || localLoading;
  // Don't disable solely due to not-initialized; allow click to trigger init
  const isButtonDisabled = disabled || isButtonLoading;

  const buttonText = type === 'signup' ? 'Sign up with Google' : 'Sign in with Google';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`
        group relative w-full flex items-center justify-center gap-3 px-6 py-3
        bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700
        hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 
        shadow-lg hover:shadow-xl transform hover:scale-[1.02]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
    >
      {isButtonLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      ) : (
        <GoogleIcon />
      )}
      
      <span className="text-sm font-medium">
        {isButtonLoading 
          ? (type === 'signup' ? 'Creating account...' : 'Signing in...')
          : buttonText
        }
      </span>

      {/* Loading overlay */}
      {isButtonLoading && (
        <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default GoogleOAuthButton;