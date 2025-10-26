import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Package, GitCompare } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useProductComparison } from '../contexts/ProductComparisonContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EnhancedProductCard = ({ product, discountInfo, onQuickView }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToComparison, isInComparison } = useProductComparison();
  const navigate = useNavigate();

  const effectivePrice = discountInfo?.hasDiscount ? discountInfo.discountedPrice : product.price;

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const productForCart = { ...product, price: effectivePrice };
    addToCart(productForCart, 1);
    toast.success('Added to cart!', { icon: '🛒', duration: 2000 });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    const result = addToComparison(product);
    if (result.success) {
      toast.success(result.message, { icon: '⚖️', duration: 2000 });
    } else {
      toast.error(result.message, { duration: 2000 });
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <motion.div
      className="relative bg-white rounded-3xl border-2 border-gray-200 overflow-hidden group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/products/${product.id}`)}
      whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-bl-full" />

      <div className="p-6">
        {/* Image Section */}
        <div className="relative aspect-square bg-gray-50 rounded-2xl mb-5 overflow-hidden border-2 border-gray-100 group-hover:border-blue-300 transition-all duration-500">
          {product.images && product.images.length > 0 ? (
            <motion.img
              src={`http://localhost:8080/api/files/products/${product.images[0]}`}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50">
              <Package className="w-20 h-20 text-blue-300 group-hover:text-blue-400 transition-colors" />
            </div>
          )}

          {/* Discount Badge */}
          {discountInfo?.hasDiscount && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: -12 }}
              className="absolute top-3 right-3 bg-red-600 text-white text-sm font-black px-4 py-2 rounded-xl shadow-2xl"
            >
              -{discountInfo.discountPercent}%
            </motion.div>
          )}

          {/* Quick Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent"
          >
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleQuickView}
                className="flex-1 py-2 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all font-semibold shadow-lg text-sm flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Quick View
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg text-sm flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                <ShoppingCart className="w-4 h-4" />
                Add
              </motion.button>
            </div>
          </motion.div>

          {/* Corner Actions */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className={`p-2 rounded-full backdrop-blur-sm shadow-lg transition-all ${
                isInWishlist(product.id)
                  ? 'bg-red-600 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCompare}
              className={`p-2 rounded-full backdrop-blur-sm shadow-lg transition-all ${
                isInComparison(product.id)
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <GitCompare className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-black text-blue-600">
              Rs. {effectivePrice?.toFixed(2)}
            </span>
            {discountInfo?.hasDiscount && (
              <span className="text-base text-gray-400 line-through font-medium">
                Rs. {product.price?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              {product.stock > 0 ? (
                <span className="text-green-600">{product.stock} in stock</span>
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </span>
            {product.category && (
              <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
                {product.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
    </motion.div>
  );
};

export default EnhancedProductCard;
