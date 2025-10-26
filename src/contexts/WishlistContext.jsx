import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }, [wishlist]);

  const addToWishlist = (product) => {
    if (wishlist.find(item => item.id === product.id)) {
      toast.error('Product already in wishlist!', {
        icon: '❤️',
        duration: 2000,
      });
      return;
    }
    setWishlist([...wishlist, product]);
    toast.success('Added to wishlist!', {
      icon: '❤️',
      duration: 2000,
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(wishlist.filter(item => item.id !== productId));
    toast.success('Removed from wishlist', {
      icon: '💔',
      duration: 2000,
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    toast.success('Wishlist cleared', {
      duration: 2000,
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
