import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { ProductCard } from '../../components/ui/product-card-1';
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
                  <ProductCard
                    name={product.name}
                    price={product.discountedPrice && product.discountedPrice < product.price ? product.discountedPrice : product.price}
                    originalPrice={product.discountedPrice && product.discountedPrice < product.price ? product.price : null}
                    rating={product.rating || 4.5}
                    reviewCount={product.reviewCount || 0}
                    images={product.images?.map(img => `http://localhost:8080/api/files/products/${img}`) || []}
                    brands={product.brands || []}
                    specifications={product.specifications || []}
                    isNew={product.isNew || false}
                    isBestSeller={product.isBestSeller || false}
                    discount={product.discountPercent || 0}
                    freeShipping={product.freeShipping || false}
                    inStock={product.stockQuantity > 0}
                    onAddToCart={() => handleAddToCart(product)}
                  />
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
