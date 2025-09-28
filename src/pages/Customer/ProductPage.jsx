import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ShoppingCart, Eye, Package, X, ChevronDown, ChevronUp, Star, TrendingUp, DollarSign, Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProductApi } from '../../utils/productApi';
import { CustomerProductApi } from '../../utils/customerProductApi';
import { useCart } from '../../contexts/CartContext';
import CartButton from '../../components/CartButton';
import ShoppingCartModal from '../../components/ShoppingCartModal';
import PublicLayout from '../../components/PublicLayout';
import CustomerLayout from '../../components/CustomerLayout';

const ProductBrowsePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
    const { 
    addToCart, 
    getCartItemQuantity, 
    isInCart,
    canAddToCart,
    getAvailableQuantity
  } = useCart();
  const [notification, setNotification] = useState(null);

  // Show notification temporarily
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Enhanced add to cart with validation
  const handleAddToCart = (product, quantity = 1) => {
    const validation = canAddToCart(product, quantity);
    
    if (!validation.canAdd) {
      showNotification(validation.reason, 'error');
      return;
    }

    const result = addToCart(product, validation.maxQuantity);
    
    if (result.success) {
      if (result.actualQuantity < quantity) {
        showNotification(`Added ${result.actualQuantity} items to cart (limited by stock)`, 'warning');
      } else {
        showNotification(`${result.actualQuantity} item${result.actualQuantity > 1 ? 's' : ''} added to cart`, 'success');
      }
    } else {
      showNotification(result.message, 'error');
    }
  };
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  // Grid density (3 or 4 columns for desktop grid view)
  const [gridCols, setGridCols] = useState(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('gridCols') : null;
    const parsed = saved ? parseInt(saved, 10) : 3;
    return parsed === 4 ? 4 : 3;
  });
  
  // Filter states
  // Filters sidebar (desktop) and drawer (mobile)
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [userPriceRange, setUserPriceRange] = useState({ min: '', max: '' });
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stockFilter, setStockFilter] = useState('all');
  
  // Meta data
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [actualPriceRange, setActualPriceRange] = useState({ min: 0, max: 1000 });

  // No mock data, we use real backend data

  // Helper to normalize product IDs from various possible DTO shapes
  const getPid = (p) => p?.id ?? p?.productId ?? p?._id ?? p?.sku ?? p?.code ?? null;
  
  // Store discount data fetched from customer API
  const [discountData, setDiscountData] = useState(new Map());
  
  // Helper to compute discount info by combining admin product data with customer discount data
  const getDiscountInfo = (product) => {
    const discountInfo = discountData.get(product.name); // Match by name since customer API doesn't have id
    if (discountInfo && discountInfo.discountPercent != null && discountInfo.discountedPrice != null && discountInfo.discountedPrice < product.price) {
      return {
        hasDiscount: true,
        discountedPrice: discountInfo.discountedPrice,
        discountPercent: discountInfo.discountPercent,
        promotionName: discountInfo.promotionName
      };
    }
    return {
      hasDiscount: false,
      discountedPrice: product.price,
      discountPercent: null,
      promotionName: null
    };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch both admin products (for complete data) and customer products (for discount info)
        const [adminData, customerData] = await Promise.all([
          ProductApi.list(),
          CustomerProductApi.list().catch(() => []) // Don't fail if customer API is down
        ]);
        
        console.log('Fetched products (admin):', adminData);
        console.log('Fetched discount data (customer):', customerData);
        
        // Create discount lookup map by product name
        const discountMap = new Map();
        if (Array.isArray(customerData)) {
          customerData.forEach(item => {
            if (item.name) {
              discountMap.set(item.name, {
                discountedPrice: item.discountedPrice,
                discountPercent: item.discountPercent,
                promotionName: item.promotionName
              });
            }
          });
        }
        setDiscountData(discountMap);
        
        // Ensure each product has an id for navigation/cart by normalizing
        const normalized = (Array.isArray(adminData) ? adminData : []).map((p) => {
          const pid = getPid(p);
          return pid != null ? { ...p, id: pid } : p;
        });
        setProducts(normalized);
        setFilteredProducts(normalized);
        
        // Extract categories and brands from products
        const uniqueCategories = [...new Set(adminData.map(product => product.category).filter(cat => cat))].sort();
        const uniqueBrands = [...new Set(adminData.map(product => product.brand).filter(brand => brand))].sort();
        
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
        
        // Calculate price range
        if (adminData.length > 0) {
          const prices = adminData.map(p => p.price).filter(price => price != null);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setActualPriceRange({ min: minPrice, max: maxPrice });
          setPriceRange({ min: minPrice, max: maxPrice });
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Persist grid density preference
  useEffect(() => {
    try {
      window.localStorage.setItem('gridCols', String(gridCols));
    } catch (_) {}
  }, [gridCols]);

  // Apply filters and search
  const applyFiltersAndSearch = () => {
    let filtered = products;
    
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category && product.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(product =>
        product.brand && product.brand.toLowerCase().includes(selectedBrand.toLowerCase())
      );
    }
    
    // Price range filter
    const minPrice = userPriceRange.min !== '' ? parseFloat(userPriceRange.min) : 0;
    const maxPrice = userPriceRange.max !== '' ? parseFloat(userPriceRange.max) : Number.MAX_VALUE;
    
    filtered = filtered.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    );
    
    // Stock filter
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'inStock':
          filtered = filtered.filter(product => product.stock > 5);
          break;
        case 'lowStock':
          filtered = filtered.filter(product => product.stock > 0 && product.stock <= 5);
          break;
        case 'outOfStock':
          filtered = filtered.filter(product => product.stock === 0);
          break;
      }
    }
    
    // Availability filter
    if (availableOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'brand':
          aValue = (a.brand || '').toLowerCase();
          bValue = (b.brand || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    setFilteredProducts(filtered);
  };

  // Trigger search/filter when dependencies change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFiltersAndSearch();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedBrand, userPriceRange, availableOnly, stockFilter, sortBy, sortOrder, products]);



  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setUserPriceRange({ min: '', max: '' });
    setAvailableOnly(false);
    setStockFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (stock <= 5) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-50' };
  };

  // Derive counts for categories and brands
  const countsBy = (items, key) => {
    return items.reduce((acc, item) => {
      const val = (item?.[key] || '').toString().trim();
      if (!val) return acc;
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  };
  const categoryCounts = Object.entries(countsBy(products, 'category'))
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const brandCounts = Object.entries(countsBy(products, 'brand'))
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Active Filters Display Component
  const ActiveFilters = () => {
    const activeFilters = [];
    
    if (searchTerm) {
      activeFilters.push({ type: 'search', value: searchTerm, label: `Search: "${searchTerm}"` });
    }
    if (selectedCategory) {
      activeFilters.push({ type: 'category', value: selectedCategory, label: `Category: ${selectedCategory}` });
    }
    if (selectedBrand) {
      activeFilters.push({ type: 'brand', value: selectedBrand, label: `Brand: ${selectedBrand}` });
    }
    if (userPriceRange.min) {
      activeFilters.push({ type: 'minPrice', value: userPriceRange.min, label: `Min Price: $${userPriceRange.min}` });
    }
    if (userPriceRange.max) {
      activeFilters.push({ type: 'maxPrice', value: userPriceRange.max, label: `Max Price: $${userPriceRange.max}` });
    }
    if (stockFilter !== 'all') {
      const stockLabels = {
        inStock: 'In Stock',
        lowStock: 'Low Stock',
        outOfStock: 'Out of Stock'
      };
      activeFilters.push({ type: 'stock', value: stockFilter, label: stockLabels[stockFilter] });
    }
    if (availableOnly) {
      activeFilters.push({ type: 'available', value: true, label: 'Available Only' });
    }
    
    if (activeFilters.length === 0) return null;
    
    const removeFilter = (filterType) => {
      switch (filterType) {
        case 'search':
          setSearchTerm('');
          break;
        case 'category':
          setSelectedCategory('');
          break;
        case 'brand':
          setSelectedBrand('');
          break;
        case 'minPrice':
          setUserPriceRange(prev => ({ ...prev, min: '' }));
          break;
        case 'maxPrice':
          setUserPriceRange(prev => ({ ...prev, max: '' }));
          break;
        case 'stock':
          setStockFilter('all');
          break;
        case 'available':
          setAvailableOnly(false);
          break;
      }
    };
    
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            Active Filters
          </span>
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-200"
          >
            Clear All
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {filter.label}
              <button
                onClick={() => removeFilter(filter.type)}
                className="ml-2 text-blue-600 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-600 mt-4 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
    );
  };

  const FilterContent = () => (
    <div>
      {/* Enhanced Popular Categories */}
      {categoryCounts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> Popular Categories
            </label>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {categoryCounts.slice(0, 8).map(({ name, count }) => (
              <li key={name}>
                <button
                  onClick={() => {
                    setSelectedCategory(name);
                    setIsMobileFiltersOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-all duration-200 ${selectedCategory === name ? 'text-blue-700 bg-blue-50 border-l-4 border-blue-500' : 'text-gray-700'}`}
                >
                  <span className="truncate text-left font-medium">{name}</span>
                  <span className={`ml-2 inline-flex items-center justify-center text-xs font-bold px-2 py-1 rounded-full ${selectedCategory === name ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                    {count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Popular Brands */}
      {brandCounts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              <Star className="w-4 h-4 inline mr-1" /> Popular Brands
            </label>
            {selectedBrand && (
              <button
                onClick={() => setSelectedBrand('')}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="divide-y divide-gray-100 border rounded-lg">
            {brandCounts.slice(0, 8).map(({ name, count }) => (
              <li key={name}>
                <button
                  onClick={() => {
                    setSelectedBrand(name);
                    setIsMobileFiltersOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${selectedBrand === name ? 'text-blue-700 bg-blue-50' : 'text-gray-700'}`}
                >
                  <span className="truncate text-left">{name}</span>
                  <span className={`ml-2 inline-flex items-center justify-center text-xs font-medium px-2 py-0.5 rounded-full ${selectedBrand === name ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                    {count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Category */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Package className="w-4 h-4 inline mr-1" /> Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      {/* Brand */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Star className="w-4 h-4 inline mr-1" /> Brand
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Brands</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>
      {/* Stock */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <TrendingUp className="w-4 h-4 inline mr-1" /> Stock Status
        </label>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Products</option>
          <option value="inStock">In Stock (6+)</option>
          <option value="lowStock">Low Stock (1-5)</option>
          <option value="outOfStock">Out of Stock</option>
        </select>
      </div>
      {/* Price */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" /> Price Range
        </label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={userPriceRange.min} onChange={(e) => setUserPriceRange(prev => ({ ...prev, min: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0" />
          <input type="number" placeholder="Max" value={userPriceRange.max} onChange={(e) => setUserPriceRange(prev => ({ ...prev, max: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Available: ${actualPriceRange.min} - ${actualPriceRange.max}</div>
      </div>
      {/* Sort */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="stock">Stock</option>
          <option value="category">Category</option>
          <option value="brand">Brand</option>
        </select>
      </div>
      {/* Quick */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Quick Filters</label>
        <div className="flex flex-col gap-3">
          <label className="flex items-center"><input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" /><span className="ml-2 text-sm text-gray-700">Available Only</span></label>
          <label className="flex items-center"><input type="checkbox" checked={userPriceRange.max !== '' && parseFloat(userPriceRange.max) <= 50} onChange={(e) => { if (e.target.checked) { setUserPriceRange(prev => ({ ...prev, max: '50' })); } else { setUserPriceRange(prev => ({ ...prev, max: '' })); } }} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" /><span className="ml-2 text-sm text-gray-700">Under $50</span></label>
          <label className="flex items-center"><input type="checkbox" checked={stockFilter === 'lowStock'} onChange={(e) => setStockFilter(e.target.checked ? 'lowStock' : 'all')} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" /><span className="ml-2 text-sm text-gray-700">Low Stock Alert</span></label>
        </div>
      </div>
      <button onClick={clearFilters} className="w-full text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"><X className="w-4 h-4" /> Clear All</button>
    </div>
  );

  const SidebarFilters = () => (
    <aside className="hidden md:block">
      <div className="sticky top-24">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters
          </h3>
          <FilterContent />
        </div>
      </div>
    </aside>
  );

  const MobileFilters = () => (
    <div className="md:hidden">
      <button onClick={() => setIsMobileFiltersOpen(true)} className="inline-flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
        <Filter className="w-5 h-5" /> Filters
      </button>
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filters
              </h3>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </div>
  );

const ProductCard = ({ product }) => {
  const pid = getPid(product) ?? product.id;
  // Preserve original stock, but ensure we have a number for calculations
  const stock = product.stock != null ? Number(product.stock) : 0;
  const stockStatus = getStockStatus(stock);
  const isProductInCart = pid != null ? isInCart(pid) : false;
  const cartQuantity = pid != null ? getCartItemQuantity(pid) : 0;

  const handleAddToCartClick = async () => {
    // Use discounted price if available
    if (pid == null) return;
    let p = product;
    let s = stock;
    try {
      // Only fetch details if we don't have stock info, not if stock is legitimately 0
      if (s == null || isNaN(s)) {
        const full = await ProductApi.getById(pid);
        if (full) {
          p = { ...full, id: getPid(full) ?? full.id ?? pid };
          s = full.stock != null ? Number(full.stock) : 0;
        }
      }
    } catch (_) {
      // ignore detail fetch errors; we'll try with what we have
    }
    const discountInfo = getDiscountInfo(p);
    const effectivePrice = discountInfo.hasDiscount ? discountInfo.discountedPrice : p.price;
    const priceNum = typeof effectivePrice === 'string' ? parseFloat(effectivePrice) : effectivePrice;
    const productForCart = { ...p, id: pid, stock: s, price: isNaN(priceNum) ? 0 : priceNum };
    handleAddToCart(productForCart, 1);
  };

  const hasImage = Array.isArray(product.images) && product.images.length > 0;
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
  const resolveImageSrc = (value) => {
    if (!value) return "";
    const v = String(value).trim();
    if (v.startsWith("data:")) return v;
    if (/^https?:\/\//i.test(v)) return v;
    if (/^\/\//.test(v)) return `https:${v}`; // protocol-relative
    if (/^[\w.-]+\.[A-Za-z]{2,}.*$/.test(v)) return `https://${v}`;
    return `${API_BASE}/api/files/products/${encodeURIComponent(v)}`;
  };
  const discountInfo = getDiscountInfo(product);
  const hasDiscount = discountInfo.hasDiscount;
  const displayPrice = hasDiscount ? discountInfo.discountedPrice : product.price;
  const price = displayPrice != null ? parseFloat(displayPrice).toFixed(2) : '0.00';
  const originalPrice = product.price != null ? parseFloat(product.price).toFixed(2) : null;
    
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      {/* Enhanced Media */}
      <div className="relative">
        <button
          onClick={() => { if (pid != null) navigate(`/products/${pid}`); }}
          className="block w-full"
        >
          <div className="aspect-[4/3] w-full bg-gray-50 flex items-center justify-center overflow-hidden">
            {hasImage ? (
              <img
                src={resolveImageSrc(product.images[0])}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <Package className="w-16 h-16 text-gray-300 group-hover:text-gray-400 transition-colors" />
            )}
          </div>
        </button>
        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute right-4 top-4 px-3 py-1.5 text-xs font-bold rounded-xl bg-red-500 text-white shadow-lg border border-red-400">-{discountInfo.discountPercent}%</span>
        )}
        {/* Enhanced Stock badge */}
        <span className={`absolute left-4 top-4 px-3 py-1.5 text-xs font-bold rounded-xl backdrop-blur-md bg-white/90 shadow-lg ${stockStatus.color} border border-white/20`}>
          {stockStatus.text}
        </span>
        {/* Enhanced Out of stock overlay */}
        {stock === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-red-600 font-bold shadow-inner">Out of Stock</div>
        )}
      </div>

      {/* Enhanced Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <button
              onClick={() => { if (pid != null) navigate(`/products/${pid}`); }}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors text-left line-clamp-2 group-hover:text-blue-600"
            >
              {product.name}
            </button>
            <div className="mt-2 flex items-center gap-2">
              {product.brand && (
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">{product.brand}</span>
              )}
              {product.category && (
                <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">{product.category}</span>
              )}
            </div>
          </div>
          <button 
            onClick={() => { if (pid != null) navigate(`/products/${pid}`); }}
            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">${price}</p>
              {hasDiscount && (
                <p className="text-sm font-semibold text-gray-400 line-through">${originalPrice}</p>
              )}
            </div>
            {discountInfo.promotionName && hasDiscount && (
              <p className="text-xs text-red-600 mt-1 font-medium">{discountInfo.promotionName}</p>
            )}
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Package className="w-3 h-3" />
              {product.stock} in stock
            </p>
            {isProductInCart && (
              <p className="text-sm text-blue-600 font-semibold flex items-center gap-1 mt-1">
                <ShoppingCart className="w-3 h-3" />
                In cart: {cartQuantity}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCartClick}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg ${
              stock > 0 
                ? 'text-white bg-blue-600 hover:bg-blue-700' 
                : 'text-gray-400 bg-gray-200 cursor-not-allowed'
            }`}
            disabled={stock === 0}
            title={stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          >
            <Plus className="w-5 h-5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

  const ProductListItem = ({ product }) => {
    const pid = getPid(product) ?? product.id;
    // Preserve original stock, but ensure we have a number for calculations
    const stock = product.stock != null ? Number(product.stock) : 0;
    const stockStatus = getStockStatus(stock);
    const isProductInCart = pid != null ? isInCart(pid) : false;
    const cartQuantity = pid != null ? getCartItemQuantity(pid) : 0;
    
    const handleAddToCartClick = () => {
      const discountInfo = getDiscountInfo(product);
      const effectivePrice = discountInfo.hasDiscount ? discountInfo.discountedPrice : product.price;
      const productForCart = { ...product, id: pid, stock, price: effectivePrice };
      handleAddToCart(productForCart, 1);
    };
    
    const discountInfo = getDiscountInfo(product);
    const hasDiscount = discountInfo.hasDiscount;

    return (
      <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-24 h-20 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
              {Array.isArray(product.images) && product.images.length > 0 ? (
                <img
                  src={resolveImageSrc(product.images[0])}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <Package className="w-10 h-10 text-gray-300 group-hover:text-gray-400 transition-colors" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => { if (pid != null) navigate(`/products/${pid}`); }}
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors text-left group-hover:text-blue-600"
              >
                {product.name}
              </button>
              <div className="mt-2 flex items-center gap-2">
                {product.brand && (
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">{product.brand}</span>
                )}
                {product.category && (
                  <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">{product.category}</span>
                )}
              </div>
              <p className="text-gray-700 mt-2 line-clamp-1 leading-relaxed">{product.description}</p>
              {product.specifications && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-1">{product.specifications}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-baseline gap-2 justify-end">
                <p className="text-2xl font-bold text-gray-900">${(hasDiscount ? discountInfo.discountedPrice : product.price)?.toFixed(2)}</p>
                {hasDiscount && (
                  <p className="text-sm font-semibold text-gray-400 line-through">${product.price.toFixed(2)}</p>
                )}
              </div>
              {discountInfo.promotionName && hasDiscount && (
                <p className="text-xs text-red-600 mt-1 font-medium">{discountInfo.promotionName} (-{discountInfo.discountPercent}%)</p>
              )}
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <Package className="w-3 h-3" />
                Stock: {product.stock}
              </p>
              {isProductInCart && (
                <p className="text-sm text-blue-600 font-semibold flex items-center gap-1 mt-1">
                  <ShoppingCart className="w-3 h-3" />
                  In cart: {cartQuantity}
                </p>
              )}
            </div>
            
            <span className={`px-4 py-2 text-sm font-bold rounded-xl shadow-sm ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => { if (pid != null) navigate(`/products/${pid}`); }}
                className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                title="View Details"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button 
                onClick={handleAddToCartClick}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg ${
                  stock > 0 
                    ? 'text-white bg-blue-600 hover:bg-blue-700' 
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
                disabled={stock === 0}
                title={stock > 0 ? "Add to Cart" : "Out of Stock"}
              >
                <Plus className="w-5 h-5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 animate-pulse">
      <div className="h-48 bg-gray-200/60 rounded-xl mb-4" />
      <div className="space-y-3">
        <div className="h-5 bg-gray-200/60 rounded-lg w-3/4" />
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200/60 rounded-full w-16" />
          <div className="h-4 bg-gray-200/60 rounded-full w-20" />
        </div>
        <div className="h-3 bg-gray-200/60 rounded w-full" />
        <div className="h-3 bg-gray-200/60 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200/60 rounded w-20" />
          <div className="h-10 bg-gray-200/60 rounded-xl w-16" />
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Error Loading Products</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Choose layout based on user authentication
  const Layout = user ? CustomerLayout : PublicLayout;
  
  return (
    <Layout>
      {/* Enhanced Notification Banner */}
      {notification && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className={`animate-slide-down flex items-center gap-3 p-4 border rounded-xl shadow-lg backdrop-blur-sm ${
              notification.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800 shadow-red-100' :
              notification.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800 shadow-amber-100' :
              'bg-emerald-50/90 border-emerald-200 text-emerald-800 shadow-emerald-100'
            }`}>
              <div className={`rounded-full p-1.5 ${
                notification.type === 'error' ? 'bg-red-100' :
                notification.type === 'warning' ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                <AlertTriangle size={18} />
              </div>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Controls */}
      <div className="container mx-auto px-4">
        <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Hardware Products</h1>
            <p className="text-gray-600 mt-2 text-lg">Browse and manage your premium hardware inventory</p>
          </div>
          {/* Enhanced Search and Controls */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-80 shadow-sm hover:shadow-md transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="flex space-x-3">
              <CartButton onClick={() => setIsCartOpen(true)} className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl" />
              {/* Mobile filters trigger */}
              <div className="md:hidden">
                <MobileFilters />
              </div>
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Products + Sidebar Layout */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <SidebarFilters />
          </div>
          {/* Main */}
          <div className="md:col-span-9">
            {/* Enhanced Breadcrumb and Heading */}
            <div className="mb-8">
              <nav className="flex items-center gap-2 text-sm mb-4">
                <button onClick={() => navigate('/')} className="px-3 py-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">Home</button>
                <span className="text-gray-400">•</span>
                <button onClick={() => { clearFilters(); navigate('/products'); }} className="px-3 py-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">Shop</button>
                {selectedCategory && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="px-3 py-2 rounded-full text-gray-900 bg-gray-100 font-medium">{selectedCategory}</span>
                  </>
                )}
                {selectedBrand && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="px-3 py-2 rounded-full text-gray-900 bg-gray-100 font-medium">{selectedBrand}</span>
                  </>
                )}
              </nav>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {selectedCategory || 'All Products'}{selectedBrand ? <span className="text-gray-500 font-normal"> • {selectedBrand}</span> : ''}
                  </h2>
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
            </div>
            {/* Active Filters */}
            <ActiveFilters />
            {/* Results and Mobile Filters */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">Showing {filteredProducts.length} of {products.length} products</p>
                <div className="text-sm text-gray-500 mt-1">Sorted by {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})</div>
              </div>
              <div className="md:hidden">
                <MobileFilters />
              </div>
              {/* Enhanced Grid density selector */}
              <div className="hidden md:flex items-center gap-3">
                {viewMode === 'grid' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Columns:</span>
                    <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                      <button
                        onClick={() => setGridCols(3)}
                        className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${gridCols === 3 ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="3 columns"
                      >
                        3
                      </button>
                      <button
                        onClick={() => setGridCols(4)}
                        className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${gridCols === 4 ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="4 columns"
                      >
                        4
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className={viewMode === 'grid' ? `grid grid-cols-1 md:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6` : "space-y-4"}>
                {Array.from({ length: 6 }).map((_, i) => (<SkeletonCard key={i} />))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">{searchTerm || selectedCategory || selectedBrand || userPriceRange.min || userPriceRange.max || availableOnly || stockFilter !== 'all' ? 'Try adjusting your search terms or filters to find what you\'re looking for.' : 'No products available at this time. Please check back later.'}</p>
                {(searchTerm || selectedCategory || selectedBrand || userPriceRange.min || userPriceRange.max || availableOnly || stockFilter !== 'all') && (
                  <button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">Clear All Filters</button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? `grid grid-cols-1 md:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6` : "space-y-4"}>
                {filteredProducts.map(product => (viewMode === 'grid' ? (<ProductCard key={product.id} product={product} />) : (<ProductListItem key={product.id} product={product} />)))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Shopping Cart Modal */}
      <ShoppingCartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </Layout>
  );
};

export default ProductBrowsePage;