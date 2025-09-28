// Google OAuth Service using Google Identity Services (GIS)
class GoogleAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.isInitialized = false;
    this.currentUser = null;
  }

  // Initialize Google OAuth with GIS
  async initialize() {
    if (this.isInitialized) return true;

    try {
      if (!this.clientId) {
        throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
      }
      
      // Load Google Identity Services
      await this.loadGoogleIdentityServices();
      
      this.isInitialized = true;
      console.log('Google Identity Services initialized successfully');
      return true;
    } catch (error) {
      console.error('Google Auth initialization failed:', error);
      return false;
    }
  }

  // Load Google Identity Services script dynamically
  loadGoogleIdentityServices() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts) {
        resolve(window.google);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google?.accounts) {
          resolve(window.google);
        } else {
          reject(new Error('Google Identity Services not available after script load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };

      document.head.appendChild(script);
    });
  }

  getClientId() {
    return this.clientId;
  }

  // Sign in with Google using GIS
  async signIn() {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Google Auth not initialized');
      }
    }

    return new Promise((resolve, reject) => {
      try {
        // Initialize Google ID for sign-in with popup
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: async (credentialResponse) => {
            try {
              // Decode the JWT token to get user info
              const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
              
              const profile = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                imageUrl: payload.picture
              };

              this.currentUser = profile;

              resolve({
                idToken: credentialResponse.credential,
                profile
              });
            } catch (error) {
              reject(new Error('Failed to process credential response'));
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false
        });

        // Show the popup sign-in
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            // If prompt is not displayed, fall back to popup
            this.showPopupSignIn(resolve, reject);
          } else if (notification.isSkippedMoment()) {
            // User closed the prompt, try popup
            this.showPopupSignIn(resolve, reject);
          }
        });

      } catch (error) {
        console.error('Google Sign-In failed:', error);
        reject(error);
      }
    });
  }

  // Fallback popup sign-in method
  showPopupSignIn(resolve, reject) {
    try {
      // Create a popup button temporarily
      const div = document.createElement('div');
      div.style.display = 'none';
      document.body.appendChild(div);

      window.google.accounts.id.renderButton(div, {
        type: 'standard',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });

      // Trigger click programmatically
      setTimeout(() => {
        const button = div.querySelector('div');
        if (button) {
          button.click();
        } else {
          reject(new Error('Unable to create sign-in popup'));
        }
        document.body.removeChild(div);
      }, 100);

    } catch (error) {
      reject(error);
    }
  }

  // Sign out
  async signOut() {
    try {
      // Clear current user
      this.currentUser = null;
      
      // Disable auto-select for next sign-in
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Check if user is signed in
  isSignedIn() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }
}

// Create a singleton instance
export const googleAuthService = new GoogleAuthService();

// React hook for Google Auth
import { useState, useEffect } from 'react';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const initialized = await googleAuthService.initialize();
        setIsInitialized(initialized);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    try {
      const result = await googleAuthService.signIn();
      return result;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await googleAuthService.signOut();
    } catch (error) {
      console.error('Google Sign-Out error:', error);
    }
  };

  return {
    signIn,
    signOut,
    isLoading,
    isInitialized,
    isSignedIn: googleAuthService.isSignedIn(),
    currentUser: googleAuthService.getCurrentUser()
  };
};