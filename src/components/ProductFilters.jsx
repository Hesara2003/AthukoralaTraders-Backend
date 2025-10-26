import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';

const ProductFilters = ({ onFilterChange, categories = [], maxPrice = 100000 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, maxPrice],
    categories: [],
    inStock: false,
    sortBy: 'default',
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryToggle = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    handleFilterChange('categories', newCategories);
  };

  const clearFilters = () => {
    const defaultFilters = {
      priceRange: [0, maxPrice],
      categories: [],
      inStock: false,
      sortBy: 'default',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFiltersCount =
    filters.categories.length +
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== maxPrice ? 1 : 0) +
    (filters.sortBy !== 'default' ? 1 : 0);

  return (
    <>
      {/* Filter Toggle Button - Mobile */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-600 transition-all"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-700">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <X className={`w-5 h-5 ${isOpen ? 'text-blue-600' : 'text-gray-400'}`} />
          </motion.div>
        </button>
      </div>

      {/* Filters Panel */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen || window.innerWidth >= 1024 ? 'auto' : 0,
          opacity: isOpen || window.innerWidth >= 1024 ? 1 : 0,
        }}
        className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-6 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-gray-100">
          <h3 className="text-xl font-black text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Price Range
          </label>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={filters.priceRange[1]}
              onChange={(e) =>
                handleFilterChange('priceRange', [0, parseInt(e.target.value)])
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-semibold text-gray-600">
                Rs. {filters.priceRange[0].toFixed(0)}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                Rs. {filters.priceRange[1].toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Categories
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 font-medium">{category}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Availability
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all border-2 border-gray-200">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 font-medium">In Stock Only</span>
          </label>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none font-medium text-gray-700"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="stock-desc">Stock: High to Low</option>
          </select>
        </div>
      </motion.div>
    </>
  );
};

export default ProductFilters;
