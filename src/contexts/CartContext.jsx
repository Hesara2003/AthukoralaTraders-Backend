import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      
      // Validate stock availability
      if (product.stock <= 0) {
        console.warn(`Cannot add ${product.name} - Out of stock`);
        return state; // Don't add if out of stock
      }
      
      const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...state.items];
        const currentQuantity = updatedItems[existingItemIndex].quantity;
        const newQuantity = currentQuantity + quantity;
        
        // Check if new quantity exceeds available stock
        if (newQuantity > product.stock) {
          console.warn(`Cannot add more ${product.name} - Only ${product.stock} available, ${currentQuantity} already in cart`);
          // Set to maximum available stock
          updatedItems[existingItemIndex].quantity = product.stock;
        } else {
          updatedItems[existingItemIndex].quantity = newQuantity;
        }
        
        return {
          ...state,
          items: updatedItems
        };
      } else {
        // Add new item to cart only if stock is available
        const addQuantity = Math.min(quantity, product.stock);
        if (addQuantity < quantity) {
          console.warn(`Only ${addQuantity} ${product.name} available, adding maximum possible`);
        }
        
        return {
          ...state,
          items: [...state.items, { product, quantity: addQuantity }]
        };
      }
    }
    
    case CART_ACTIONS.REMOVE_ITEM: {
      const productId = action.payload;
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== productId)
      };
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity, product } = action.payload;
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return {
          ...state,
          items: state.items.filter(item => item.product.id !== productId)
        };
      }
      
      const updatedItems = state.items.map(item => {
        if (item.product.id === productId) {
          // Validate against current product stock
          const currentProduct = product || item.product;
          const maxQuantity = Math.min(quantity, currentProduct.stock);
          
          if (maxQuantity < quantity) {
            console.warn(`Only ${maxQuantity} ${currentProduct.name} available`);
          }
          
          return { ...item, quantity: maxQuantity };
        }
        return item;
      });
      
      return {
        ...state,
        items: updatedItems
      };
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };
      
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload || []
      };
      
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: []
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('athukorala-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever cart state changes
  useEffect(() => {
    localStorage.setItem('athukorala-cart', JSON.stringify(state.items));
  }, [state.items]);
  
  // Enhanced cart utility functions with stock validation
  const addToCart = (product, quantity = 1) => {
    // Pre-validate before dispatching
    if (product.stock <= 0) {
      return {
        success: false,
        message: `${product.name} is out of stock`,
        type: 'error'
      };
    }
    
    const currentQuantity = getCartItemQuantity(product.id);
    const requestedTotal = currentQuantity + quantity;
    
    if (requestedTotal > product.stock) {
      const availableToAdd = product.stock - currentQuantity;
      if (availableToAdd > 0) {
        dispatch({ 
          type: CART_ACTIONS.ADD_ITEM, 
          payload: { product, quantity: availableToAdd } 
        });
        return {
          success: true,
          message: `Added ${availableToAdd} ${product.name} (maximum available)`,
          type: 'warning',
          actualQuantity: availableToAdd
        };
      } else {
        return {
          success: false,
          message: `${product.name} is already at maximum quantity in cart`,
          type: 'warning'
        };
      }
    }
    
    dispatch({ 
      type: CART_ACTIONS.ADD_ITEM, 
      payload: { product, quantity } 
    });
    
    return {
      success: true,
      message: `Added ${quantity} ${product.name} to cart`,
      type: 'success',
      actualQuantity: quantity
    };
  };
  
  const removeFromCart = (productId) => {
    dispatch({ 
      type: CART_ACTIONS.REMOVE_ITEM, 
      payload: productId 
    });
  };
  
  const updateQuantity = (productId, quantity, product) => {
    dispatch({ 
      type: CART_ACTIONS.UPDATE_QUANTITY, 
      payload: { productId, quantity, product } 
    });
  };
  
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };
  
  // Calculate cart totals
  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };
  
  const getCartItemsCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };
  
  const getCartItemQuantity = (productId) => {
    const item = state.items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };
  
  const isInCart = (productId) => {
    return state.items.some(item => item.product.id === productId);
  };
  
  // Stock validation utilities
  const canAddToCart = (product, requestedQuantity = 1) => {
    if (product.stock <= 0) {
      return { canAdd: false, reason: 'Out of stock', maxQuantity: 0 };
    }
    
    const currentInCart = getCartItemQuantity(product.id);
    const availableToAdd = product.stock - currentInCart;
    
    if (availableToAdd <= 0) {
      return { canAdd: false, reason: 'Already at maximum in cart', maxQuantity: 0 };
    }
    
    if (requestedQuantity <= availableToAdd) {
      return { canAdd: true, reason: 'Available', maxQuantity: requestedQuantity };
    }
    
    return { 
      canAdd: true, 
      reason: `Only ${availableToAdd} available`, 
      maxQuantity: availableToAdd 
    };
  };
  
  const getAvailableQuantity = (productId, currentStock) => {
    const cartQuantity = getCartItemQuantity(productId);
    return Math.max(0, currentStock - cartQuantity);
  };
  
  const validateCartAgainstStock = (updatedProducts) => {
    const issues = [];
    
    state.items.forEach(cartItem => {
      const updatedProduct = updatedProducts.find(p => p.id === cartItem.product.id);
      if (updatedProduct && cartItem.quantity > updatedProduct.stock) {
        issues.push({
          productId: cartItem.product.id,
          productName: cartItem.product.name,
          cartQuantity: cartItem.quantity,
          availableStock: updatedProduct.stock,
          issue: cartItem.quantity > updatedProduct.stock ? 'exceeds_stock' : 'out_of_stock'
        });
      }
    });
    
    return issues;
  };
  
  const value = {
    // State
    cartItems: state.items,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Utilities
    getCartTotal,
    getCartItemsCount,
    getCartItemQuantity,
    isInCart,
    canAddToCart,
    getAvailableQuantity,
    validateCartAgainstStock
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;