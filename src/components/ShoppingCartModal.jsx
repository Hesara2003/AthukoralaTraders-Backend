import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

const ShoppingCartModal = ({ isOpen, onClose }) => {
  const { 
    cartItems, 
    getCartTotal, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    canAddToCart,
    getAvailableQuantity
  } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  // Show notification temporarily
  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Enhanced quantity update with validation
  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.product.id);
      return;
    }

    const validation = canAddToCart(item.product, newQuantity);
    
    if (newQuantity > item.product.stock) {
      showNotification(`Only ${item.product.stock} items available in stock`, 'error');
      return;
    }

    if (validation.canAdd) {
      const actualQuantity = Math.min(newQuantity, validation.maxQuantity);
      updateQuantity(item.product.id, actualQuantity, item.product);
      
      if (actualQuantity < newQuantity) {
        showNotification(`Only ${actualQuantity} items added due to stock limitation`, 'warning');
      }
    } else {
      showNotification(validation.reason, 'error');
    }
  };

  if (!isOpen) return null;

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const total = getCartTotal();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Premium Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-gray-900/50 to-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Premium Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-white via-gray-50/50 to-white shadow-2xl border-l border-gray-200 animate-slide-in-right">
        <div className="flex h-full flex-col">
          {/* Premium Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Shopping Cart
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="group p-2 rounded-xl hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-all duration-200 transform hover:scale-110"
            >
              <X className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors" />
            </button>
          </div>

          {/* Premium Notification Banner */}
          {notification && (
            <div className="px-6 pt-4">
              <div className={`animate-slide-down flex items-center gap-3 p-4 border-2 rounded-xl shadow-lg backdrop-blur-sm ${
                notification.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800 shadow-red-100' :
                notification.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800 shadow-amber-100' :
                'bg-emerald-50/90 border-emerald-200 text-emerald-800 shadow-emerald-100'
              }`}>
                <div className={`rounded-full p-1.5 ${
                  notification.type === 'error' ? 'bg-red-100' :
                  notification.type === 'warning' ? 'bg-amber-100' : 'bg-emerald-100'
                }`}>
                  <AlertTriangle size={18} />
                </div>
                <span className="text-sm font-semibold">{notification.message}</span>
              </div>
            </div>
          )}

          {/* Premium Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-transparent to-gray-50/30">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-8 max-w-xs leading-relaxed">
                  Discover amazing products and add them to your cart to get started
                </p>
                <button
                  onClick={onClose}
                  className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5 group-hover:animate-bounce" />
                  Start Shopping
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <div key={item.product.id} className={`group animate-slide-up bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`} style={{animationDelay: `${index * 100}ms`}}>
                    <div className="flex items-start space-x-4">
                      {/* Premium Product Image */}
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 via-gray-100 to-purple-100 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                          <ShoppingBag className="h-8 w-8 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-xs font-bold text-white">{item.quantity}</span>
                        </div>
                      </div>
                      
                      {/* Premium Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {item.product.name}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 mb-3">
                          {item.product.category}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {formatPrice(item.product.price)}
                            </span>
                            <span className="text-sm text-gray-400">each</span>
                          </div>
                          
                          {item.product.stock <= 5 && (
                            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border-2 shadow-sm ${
                              item.product.stock === 0 ? 'bg-red-50 border-red-200 text-red-700' :
                              item.product.stock <= 3 ? 'bg-orange-50 border-orange-200 text-orange-700' :
                              'bg-yellow-50 border-yellow-200 text-yellow-700'
                            }`}>
                              {item.product.stock === 0 ? 'Out of Stock' : `Only ${item.product.stock} left`}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
                            Stock: {item.product.stock}
                          </span>
                          <div className="text-right">
                            <div className="text-xs text-gray-400 mb-1">Subtotal</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(item.product.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Premium Quantity Controls */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="p-3 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border-r border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="px-4 py-3 bg-gray-50 font-bold text-gray-900 min-w-[3rem] text-center">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className={`p-3 border-l border-gray-200 transition-all duration-200 ${
                            item.quantity >= item.product.stock 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'hover:bg-green-50 hover:text-green-600'
                          }`}
                          disabled={item.quantity >= item.product.stock}
                          title={item.quantity >= item.product.stock ? 'Maximum stock reached' : 'Increase quantity'}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="group p-3 rounded-xl hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-all duration-200 transform hover:scale-110"
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Premium Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-6 space-y-6">
              {/* Premium Total Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="text-sm text-gray-500">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-xl font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(total)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Tax and shipping calculated at checkout
                </div>
              </div>
              
              {/* Premium Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose?.();
                    navigate('/checkout');
                  }}
                  className="w-full group flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <CreditCard className="h-6 w-6 group-hover:animate-pulse" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
                      clearCart();
                    }
                  }}
                  className="w-full group flex items-center justify-center space-x-2 text-red-600 py-3 rounded-xl border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 font-semibold"
                >
                  <Trash2 className="h-4 w-4 group-hover:animate-bounce" />
                  <span>Clear Cart</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartModal;