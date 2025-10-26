import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, GitCompare, ChevronUp } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useProductComparison } from '../contexts/ProductComparisonContext';
import { useNavigate } from 'react-router-dom';
import ProductComparison from './ProductComparison';

const FloatingActionButtons = () => {
  const { wishlist } = useWishlist();
  const { comparisonList } = useProductComparison();
  const [showComparison, setShowComparison] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  // Show scroll to top button when scrolled down
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/customer/wishlist')}
          className="relative p-4 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 transition-all group"
        >
          <Heart className="w-6 h-6 fill-current" />
          {wishlist.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-white text-red-600 rounded-full flex items-center justify-center text-xs font-black shadow-lg"
            >
              {wishlist.length}
            </motion.span>
          )}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Wishlist ({wishlist.length})
          </span>
        </motion.button>

        {/* Comparison Button */}
        {comparisonList.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowComparison(true)}
            className="relative p-4 bg-purple-600 text-white rounded-full shadow-2xl hover:bg-purple-700 transition-all group"
          >
            <GitCompare className="w-6 h-6" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-white text-purple-600 rounded-full flex items-center justify-center text-xs font-black shadow-lg"
            >
              {comparisonList.length}
            </motion.span>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Compare ({comparisonList.length})
            </span>
          </motion.button>
        )}

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all group"
            >
              <ChevronUp className="w-6 h-6" />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Back to Top
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Comparison Modal */}
      <ProductComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </>
  );
};

export default FloatingActionButtons;
