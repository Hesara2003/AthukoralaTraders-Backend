import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Package } from 'lucide-react';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

const RecentlyViewedSection = ({ currentProductId = null }) => {
  const { recentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();

  // Filter out current product if on product detail page
  const displayProducts = currentProductId
    ? recentlyViewed.filter(p => p.id !== currentProductId)
    : recentlyViewed;

  if (displayProducts.length === 0) return null;

  return (
    <ScrollReveal>
      <section className="py-12 bg-white border-t-2 border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">Recently Viewed</h2>
              <p className="text-gray-600">Products you've checked out recently</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group p-3"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3 border border-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={`http://localhost:8080/api/files/products/${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                <p className="text-blue-600 font-black text-base">
                  Rs. {product.price?.toFixed(2)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};

export default RecentlyViewedSection;
