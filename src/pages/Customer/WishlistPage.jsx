import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import ScrollReveal from '../../components/ScrollReveal';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success('Added to cart!', { icon: '🛒' });
  };

  const handleAddAllToCart = () => {
    wishlist.forEach(product => {
      addToCart(product, 1);
    });
    toast.success(`Added ${wishlist.length} items to cart!`, { icon: '🛒' });
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-5xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  <Heart className="w-12 h-12 text-red-600 fill-current" />
                  My Wishlist
                </h1>
                <p className="text-gray-600 text-lg">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              {wishlist.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={handleAddAllToCart}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add All to Cart
                  </button>
                  <button
                    onClick={clearWishlist}
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Wishlist Items */}
          {wishlist.length === 0 ? (
            <ScrollReveal delay={0.1}>
              <div className="bg-white rounded-3xl shadow-lg p-20 text-center">
                <Heart className="w-32 h-32 text-gray-300 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-gray-900 mb-3">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Start adding products you love to your wishlist
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg inline-flex items-center gap-2"
                >
                  Browse Products
                </button>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 0.05}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`http://localhost:8080/api/files/products/${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-20 h-20 text-gray-300" />
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all group/btn"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3
                        className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer min-h-[3.5rem]"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-black text-blue-600">
                          Rs. {product.price?.toFixed(2)}
                        </span>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        {product.stock > 0 ? (
                          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                            In Stock
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600 text-sm font-semibold">
                            <div className="w-2 h-2 bg-red-600 rounded-full" />
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default WishlistPage;
