import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Eye, ZoomIn, ChevronLeft, ChevronRight, Package, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ImageZoom from './ImageZoom';
import toast from 'react-hot-toast';

const ProductQuickView = ({ product, isOpen, onClose, getDiscountInfo }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const discountInfo = getDiscountInfo ? getDiscountInfo(product) : { hasDiscount: false, discountedPrice: product.price };
  const effectivePrice = discountInfo.hasDiscount ? discountInfo.discountedPrice : product.price;
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => `http://localhost:8080/api/files/products/${img}`)
    : [null];

  const handleAddToCart = () => {
    const productForCart = { ...product, price: effectivePrice };
    addToCart(productForCart, quantity);
    toast.success('Added to cart!', { icon: '🛒' });
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 hover:rotate-90 group"
                >
                  <X className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
                </button>

                <div className="grid md:grid-cols-2 gap-8 p-8">
                  {/* Image Gallery Section */}
                  <div className="space-y-4">
                    {/* Main Image with Zoom */}
                    <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-200 group">
                      {images[currentImageIndex] ? (
                        <ImageZoom
                          src={images[currentImageIndex]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Package className="w-32 h-32 text-gray-300" />
                        </div>
                      )}

                      {/* Discount Badge */}
                      {discountInfo.hasDiscount && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg"
                        >
                          -{discountInfo.discountPercent}% OFF
                        </motion.div>
                      )}

                      {/* Navigation Arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft className="w-6 h-6 text-gray-700" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="w-6 h-6 text-gray-700" />
                          </button>
                        </>
                      )}

                      {/* Zoom Indicator */}
                      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>

                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              currentImageIndex === index
                                ? 'border-blue-600 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {img ? (
                              <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Details Section */}
                  <div className="flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                      {/* Product Title */}
                      <h2 className="text-3xl font-black text-gray-900 mb-4">{product.name}</h2>

                      {/* Category & SKU */}
                      <div className="flex items-center gap-4 mb-6">
                        {product.category && (
                          <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {product.category}
                          </span>
                        )}
                        {product.sku && (
                          <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-4xl font-black text-blue-600">
                            Rs. {effectivePrice?.toFixed(2)}
                          </span>
                          {discountInfo.hasDiscount && (
                            <span className="text-xl text-gray-400 line-through font-medium">
                              Rs. {product.price?.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {discountInfo.hasDiscount && discountInfo.promotionName && (
                          <p className="text-sm text-green-600 font-semibold">
                            🎉 {discountInfo.promotionName}
                          </p>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mb-6">
                        {product.stock > 0 ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                            <span className="font-semibold">{product.stock} in stock</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <div className="w-3 h-3 bg-red-600 rounded-full" />
                            <span className="font-semibold">Out of stock</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {product.description && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                          <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>
                      )}

                      {/* Features (if available) */}
                      {product.features && product.features.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Features</h3>
                          <ul className="space-y-2">
                            {product.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-gray-600">
                                <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t-2 border-gray-100 pt-6 mt-6 space-y-4">
                      {/* Quantity Selector */}
                      {product.stock > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all font-bold text-xl"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={product.stock}
                              value={quantity}
                              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                              className="w-20 h-12 text-center border-2 border-gray-300 rounded-xl font-bold text-lg focus:border-blue-600 focus:outline-none"
                            />
                            <button
                              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                              className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddToCart}
                          disabled={product.stock === 0}
                          className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart
                        </button>
                        <button
                          onClick={handleAddToWishlist}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isInWishlist(product.id)
                              ? 'bg-red-50 border-red-600 text-red-600'
                              : 'border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickView;
