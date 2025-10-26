import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const MAX_ITEMS = 10;

  // Load recently viewed from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentlyViewed');
      if (saved) {
        setRecentlyViewed(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  }, [recentlyViewed]);

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.id !== product.id);
      // Add to beginning
      const updated = [product, ...filtered];
      // Keep only MAX_ITEMS
      return updated.slice(0, MAX_ITEMS);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
};
