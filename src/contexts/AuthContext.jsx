import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple JWT decoder (for demonstration - in production, use a proper JWT library)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app startup
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      
      if (token && username) {
        // Decode JWT to get user role
        const decodedToken = decodeJWT(token);
        const role = decodedToken?.role || 'CUSTOMER'; // Default to CUSTOMER if no role found
        
        // Get additional stored data
        const email = localStorage.getItem('userEmail');
        const profileImage = localStorage.getItem('userProfileImage');
        const fullName = localStorage.getItem('userFullName');
        const isGoogleAuth = decodedToken?.isGoogleAuth || false;
        
        setUser({ 
          username, 
          role, 
          email,
          profileImage,
          fullName,
          isGoogleAuth
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, username, role = null, additionalData = {}) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    
    // If role is not provided, try to decode it from the token
    let userRole = role;
    if (!userRole) {
      const decodedToken = decodeJWT(token);
      userRole = decodedToken?.role || 'CUSTOMER';
    }
    
    // Store additional user data (for Google OAuth)
    if (additionalData.email) {
      localStorage.setItem('userEmail', additionalData.email);
    }
    if (additionalData.profileImage) {
      localStorage.setItem('userProfileImage', additionalData.profileImage);
    }
    if (additionalData.fullName) {
      localStorage.setItem('userFullName', additionalData.fullName);
    }
    
    setUser({ 
      username, 
      role: userRole,
      email: additionalData.email,
      profileImage: additionalData.profileImage,
      fullName: additionalData.fullName,
      isGoogleAuth: additionalData.isGoogleAuth || false
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userProfileImage');
    localStorage.removeItem('userFullName');
    setUser(null);
    setIsAuthenticated(false);
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    getToken,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};