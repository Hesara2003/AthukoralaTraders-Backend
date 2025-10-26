import React, { useState, useEffect } from 'react';
import { Search, Package, Tag, Hash } from 'lucide-react';
import { CustomerProductApi } from '../utils/customerProductApi';
import { ProductApi } from '../utils/productApi';

const SearchDemo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('customer'); // 'customer' or 'admin'

  const performSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let results;
      if (searchType === 'customer') {
        results = await CustomerProductApi.search(searchTerm);
      } else {
        results = await ProductApi.search(searchTerm);
      }
      
      setSearchResults(results);
      console.log('Search results:', results);
    } catch (err) {
      setError('Search failed: ' + err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const performAdvancedSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let results;
      if (searchType === 'customer') {
        results = await CustomerProductApi.advancedSearch(searchTerm, 0, 1000, true);
      } else {
        results = await ProductApi.advancedSearch(searchTerm, 0, 1000, true);
      }
      
      setSearchResults(results);
      console.log('Advanced search results:', results);
    } catch (err) {
      setError('Advanced search failed: ' + err.message);
      console.error('Advanced search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchType]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Search className="w-8 h-8 text-blue-600" />
          Search Demo - Product Search by Name, Category & SKU
        </h1>
        
        {/* API Toggle */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">API Endpoint:</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="customer"
                checked={searchType === 'customer'}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-2"
              />
              Customer API (with promotions)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="admin"
                checked={searchType === 'admin'}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-2"
              />
              Admin API (full product data)
            </label>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product name, category, SKU, brand, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ✨ Try searching for: "hammer", "electrical", "safety", "construction", or any SKU
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={performSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={performAdvancedSearch}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Advanced Search (Available Only)
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Search Results ({searchResults.length} found)
          </h2>
          
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {searchResults.length === 0 && !loading && searchTerm && (
            <p className="text-gray-500 text-center py-8">No products found matching your search.</p>
          )}
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((product, index) => (
              <div key={product.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex-1">{product.name}</h3>
                  <Package className="w-5 h-5 text-gray-400 ml-2" />
                </div>
                
                <div className="space-y-2 text-sm">
                  {product.category && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Category: </span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                  )}
                  
                  {product.sku && (
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">SKU: </span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                  )}
                  
                  {product.brand && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Brand: </span>
                      <span className="font-medium">{product.brand}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div>
                      {product.discountedPrice && product.discountedPrice < product.price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">${product.discountedPrice}</span>
                          <span className="text-sm text-gray-500 line-through">${product.price}</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      )}
                    </div>
                    {product.stock !== undefined && (
                      <span className={`text-sm px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDemo;