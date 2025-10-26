import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Package, Star, Minus, Plus, ArrowRight } from 'lucide-react';
import { useProductComparison } from '../contexts/ProductComparisonContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductComparison = ({ isOpen, onClose }) => {
  const { comparisonList, removeFromComparison, clearComparison } = useProductComparison();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const features = [
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price', format: (val) => `Rs. ${val?.toFixed(2)}` },
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Stock', format: (val) => `${val} units` },
    { key: 'description', label: 'Description' },
  ];

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
            <div className="flex min-h-full items-start justify-center p-4 pt-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-7xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-gray-100">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Compare Products</h2>
                    <p className="text-gray-600 mt-1">{comparisonList.length} products selected</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {comparisonList.length > 0 && (
                      <button
                        onClick={clearComparison}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all hover:rotate-90"
                    >
                      <X className="w-6 h-6 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {comparisonList.length === 0 ? (
                    <div className="text-center py-20">
                      <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products to Compare</h3>
                      <p className="text-gray-600 mb-6">Add products to comparison to see them here</p>
                      <button
                        onClick={onClose}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left p-4 font-bold text-gray-700 bg-gray-50 rounded-tl-xl w-48">
                              Features
                            </th>
                            {comparisonList.map((product) => (
                              <th key={product.id} className="p-4 bg-gray-50 relative group">
                                <button
                                  onClick={() => removeFromComparison(product.id)}
                                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <div className="aspect-square bg-white rounded-xl overflow-hidden mb-3 border-2 border-gray-200">
                                  {product.images && product.images.length > 0 ? (
                                    <img
                                      src={`http://localhost:8080/api/files/products/${product.images[0]}`}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                      <Package className="w-16 h-16 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {features.map((feature, index) => (
                            <tr key={feature.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-4 font-semibold text-gray-700 border-b border-gray-200">
                                {feature.label}
                              </td>
                              {comparisonList.map((product) => (
                                <td key={product.id} className="p-4 text-center border-b border-gray-200">
                                  {feature.format
                                    ? feature.format(product[feature.key])
                                    : product[feature.key] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                          <tr>
                            <td className="p-4 font-semibold text-gray-700">Actions</td>
                            {comparisonList.map((product) => (
                              <td key={product.id} className="p-4">
                                <button
                                  onClick={() => {
                                    navigate(`/products/${product.id}`);
                                    onClose();
                                  }}
                                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                  View Details
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductComparison;
