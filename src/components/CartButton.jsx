import React from 'react';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

const CartButton = ({ onClick, className = '' }) => {
  const { getCartItemsCount, getCartTotal } = useCart();
  const itemsCount = getCartItemsCount();
  const total = getCartTotal();

  return (
    <button
      onClick={onClick}
      className={`relative group flex items-center space-x-3 px-5 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-blue-300 hover:from-blue-50 hover:to-blue-100 ${className}`}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
        {itemsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white">
            {itemsCount > 99 ? '99+' : itemsCount}
          </span>
        )}
      </div>
      <div className="hidden sm:block text-left">
        <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors duration-300">Cart</div>
        {itemsCount > 0 ? (
          <div className="text-xs font-medium bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            ${total.toFixed(2)}
          </div>
        ) : (
          <div className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors duration-300">
            Empty
          </div>
        )}
      </div>
      {itemsCount > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
      )}
    </button>
  );
};

export default CartButton;