import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import PublicLayout from '../../components/PublicLayout';
import CustomerLayout from '../../components/CustomerLayout';
import { CustomerProductApi } from '../../utils/customerProductApi';
import { 
  ArrowLeft, 
  Package, 
  ShoppingCart,
  Loader2, 
  AlertCircle,
  Check,
  X,
  Info,
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight
} from 'lucide-react';

const ProductDetail = () => {
  const params = useParams();
  const location = useLocation();
  // Prefer path param, but gracefully fall back to query string (?id=...)
  const rawId = params?.id ?? new URLSearchParams(location.search).get('id');
  const id = rawId != null && String(rawId).trim() !== '' ? rawId : null;
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    addToCart,
    getCartItemQuantity,
    isInCart,
    canAddToCart,
    getAvailableQuantity
  } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [notification, setNotification] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

  // Safely determine a product identifier from various DTO shapes
  const getPid = (p) => p?.id ?? p?.productId ?? p?._id ?? p?.sku ?? p?.code ?? null;

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  // Dummy product data
  const dummyProducts = {
    '1': {
      id: 1,
      name: 'Professional Wireless Mouse',
      category: 'Computer Accessories',
      price: 89.99,
      description: 'Ergonomic wireless mouse with precision tracking and long-lasting battery life. Perfect for professional use and gaming.',
      stock: 25,
      stockStatus: 'In Stock',
      brand: 'TechPro',
      model: 'WM-2024',
      color: 'Matte Black',
      material: 'ABS Plastic',
      weight: '95g',
      dimensions: '12.5 x 6.8 x 4.2 cm',
      warranty: '2 Year Warranty',
      sku: 'TP-WM-001',
      specifications: 'DPI: 1000-4000, Battery: Up to 18 months, Connectivity: 2.4GHz wireless',
      images: [],
      relatedProducts: [
        { id: 2, name: 'Mechanical Keyboard', category: 'Computer Accessories', price: 129.99 },
        { id: 3, name: 'USB-C Hub', category: 'Computer Accessories', price: 45.99 }
      ]
    },
    '2': {
      id: 2,
      name: 'Mechanical Gaming Keyboard',
      category: 'Computer Accessories',
      price: 129.99,
      description: 'RGB backlit mechanical keyboard with cherry MX switches. Designed for gaming and professional typing.',
      stock: 15,
      stockStatus: 'In Stock',
      brand: 'GameMaster',
      model: 'GM-KB-Pro',
      color: 'Black with RGB',
      material: 'Aluminum Frame',
      weight: '850g',
      dimensions: '44 x 13.5 x 3.5 cm',
      warranty: '3 Year Warranty',
      sku: 'GM-KB-002',
      specifications: 'Switch Type: Cherry MX Blue, Backlight: RGB, Key Layout: Full-size 104 keys',
      images: [],
      relatedProducts: [
        { id: 1, name: 'Professional Wireless Mouse', category: 'Computer Accessories', price: 89.99 },
        { id: 4, name: 'Gaming Headset', category: 'Audio', price: 79.99 }
      ]
    },
    '3': {
      id: 3,
      name: 'USB-C Multi-Port Hub',
      category: 'Computer Accessories',
      price: 45.99,
      description: 'Compact USB-C hub with multiple ports including HDMI, USB 3.0, and power delivery support.',
      stock: 3,
      stockStatus: 'Low Stock',
      brand: 'ConnectPro',
      model: 'CP-HUB-7',
      color: 'Space Gray',
      material: 'Aluminum Alloy',
      weight: '120g',
      dimensions: '11 x 3.5 x 1.2 cm',
      warranty: '1 Year Warranty',
      sku: 'CP-HUB-003',
      specifications: 'Ports: 2x USB 3.0, 1x HDMI 4K, 1x USB-C PD, 1x SD Card Reader',
      images: [],
      relatedProducts: [
        { id: 1, name: 'Professional Wireless Mouse', category: 'Computer Accessories', price: 89.99 },
        { id: 2, name: 'Mechanical Keyboard', category: 'Computer Accessories', price: 129.99 }
      ]
    }
  };

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      try {
        if (!id) {
          console.error('ProductDetail: Missing product id in URL');
          setError('Invalid product link. Product ID is missing.');
          setLoading(false);
          return;
        }
        setLoading(true);
        
        // Try to fetch from customer API first (includes discount info)
        let data = null;
        try {
          data = await CustomerProductApi.getById(id);
          console.log('Product data loaded from customer API:', data);
        } catch (err) {
          console.warn('Customer API failed, trying admin API:', err);
          // Fallback to dummy data if APIs fail
          data = dummyProducts[id];
          if (data) {
            console.log('Using dummy product data:', data);
          }
        }
        
        if (!active) return;
        
        if (data) {
          setProduct(data);
          setError(null);
        } else {
          setError('Product not found. Please check the product ID.');
        }
      } catch (e) {
        if (!active) return;
        console.error('Failed to load product:', e);
        setError('Product not found or failed to load.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProduct();
    return () => { active = false; };
  }, [id]);
  const resolveImageSrc = (value) => {
    if (!value) return "";
    const v = String(value).trim();
    if (v.startsWith("data:")) return v;
    if (/^https?:\/\//i.test(v)) return v;
    if (/^\/\//.test(v)) return `https:${v}`; // protocol-relative
    if (/^[\w.-]+\.[A-Za-z]{2,}.*$/.test(v)) return `https://${v}`;
    return `${API_BASE}/api/files/products/${encodeURIComponent(v)}`;
  };



  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    const validation = canAddToCart(product, quantity);
    if (!validation.canAdd) {
      showToast(validation.reason, 'error');
      return;
    }
    setAddingToCart(true);
    try {
      // Ensure discounted price is used if present
      const effectivePrice = product.discountPercent != null && product.discountedPrice != null
        ? product.discountedPrice
        : product.price;
      const productForCart = { ...product, price: effectivePrice };
      const result = addToCart(productForCart, validation.maxQuantity);
      if (result.success) {
        if (result.actualQuantity < quantity) {
          showToast(`Added ${result.actualQuantity} (limited by stock)`, 'warning');
        } else {
          showToast(`Added ${result.actualQuantity} to cart`, 'success');
        }
      } else {
        showToast(result.message || 'Could not add to cart', 'error');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const getStockStatus = (product) => {
    // Use the stockStatus from backend if available, otherwise calculate based on stock
    const status = product.stockStatus || (product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'In Stock');
    
    switch (status) {
      case 'Out of Stock':
        return { 
          text: 'Out of Stock', 
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: X
        };
      case 'Low Stock':
        return { 
          text: 'Low Stock', 
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: AlertCircle
        };
      default:
        return { 
          text: 'In Stock', 
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: Check
        };
    }
  };
  
  // Choose layout based on user authentication
  const Layout = user ? CustomerLayout : PublicLayout;

  if (loading) {
    return (
      <Layout>
        {notification && (
          <div className="px-4 pt-4">
            <div className={`flex items-center gap-2 p-3 border rounded-lg ${
              notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
              'bg-green-50 border-green-200 text-green-800'
            }`}>
              <AlertCircle size={16} />
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}
        <div className="min-h-[40vh] bg-gray-50 flex items-center justify-center rounded-xl border">
          <div className="text-center p-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[40vh] bg-gray-50 flex items-center justify-center rounded-xl border">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  const stockStatus = getStockStatus(product);
  const StatusIcon = stockStatus.icon;

  return (
    <Layout>
      {/* Enhanced Toast */}
      {notification && (
        <div className="w-full px-2 py-3">
          <div className={`animate-slide-down flex items-center gap-2 p-3 border rounded-xl shadow-lg backdrop-blur-sm ${
            notification.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800 shadow-red-100' :
            notification.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800 shadow-amber-100' :
            'bg-emerald-50/90 border-emerald-200 text-emerald-800 shadow-emerald-100'
          }`}>
            <div className={`rounded-full p-1.5 ${
              notification.type === 'error' ? 'bg-red-100' :
              notification.type === 'warning' ? 'bg-amber-100' : 'bg-emerald-100'
            }`}>
              <AlertCircle size={18} />
            </div>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      <div className="w-full px-2 py-6 bg-gray-50">
          {/* Enhanced Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium border border-transparent hover:border-blue-200">Home</Link>
            <span className="text-gray-300 font-bold">•</span>
            <Link to="/products" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium border border-transparent hover:border-blue-200">Shop</Link>
            {product.category && (
              <>
                <span className="text-gray-300 font-bold">•</span>
                <button
                  onClick={() => navigate(`/products?category=${encodeURIComponent(product.category)}`)}
                  className="px-3 py-1.5 rounded-lg text-white bg-blue-600 font-bold shadow-md border border-blue-700 text-sm hover:bg-blue-700 transition-all"
                >
                  {product.category}
                </button>
              </>
            )}
            <span className="text-gray-300 font-bold">•</span>
            <span className="px-3 py-1.5 rounded-lg text-gray-900 bg-gray-100 font-bold text-sm line-clamp-1 border border-gray-200">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Premium Product Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden group">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={resolveImageSrc(product.images[selectedImage] || product.images[0])}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const val = product?.images?.[selectedImage] || product?.images?.[0];
                      if (val && !e.currentTarget.dataset.fallback) {
                        e.currentTarget.dataset.fallback = '1';
                        e.currentTarget.src = `${API_BASE}/uploads/products/${encodeURIComponent(val)}`;
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-32 w-32 text-gray-300" />
                  </div>
                )}
                {/* Enhanced Navigation Controls */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                {/* Image counter */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(0, 8).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                        selectedImage === index 
                          ? 'border-blue-500 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <img
                        src={resolveImageSrc(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (image && !e.currentTarget.dataset.fallback) {
                            e.currentTarget.dataset.fallback = '1';
                            e.currentTarget.src = `${API_BASE}/uploads/products/${encodeURIComponent(image)}`;
                          } else {
                            e.currentTarget.style.display = 'none';
                          }
                        }}
                      />
                      {!image && (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
          </div>

            {/* Premium Product Information */}
            <div className="space-y-6">
              {/* Enhanced Title and Price Section */}
              <div className="space-y-3 bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">{product.name}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">{product.category}</span>
                      {product.brand && (
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">{product.brand}</span>
                      )}
                    </div>
                  </div>
                  {product.sku && (
                    <span className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 font-bold">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 flex-wrap">
                  {product.discountPercent != null && product.discountedPrice != null && product.discountedPrice < product.price ? (
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-black text-blue-600">Rs. {(product.discountedPrice).toFixed(2)}</div>
                      <div className="text-lg font-bold text-gray-400 line-through">Rs. {(product.price).toFixed(2)}</div>
                      <span className="inline-flex items-center text-xs font-black text-white bg-red-600 px-3 py-1.5 rounded-lg shadow-lg animate-pulse">-{product.discountPercent}%</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-black text-blue-600">Rs. {parseFloat(product.price).toFixed(2)}</div>
                  )}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${stockStatus.color} shadow-sm`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="font-black text-sm">{stockStatus.text}</span>
                  </div>
                </div>
                
                {product.stock > 0 && product.stock <= 10 && (
                  <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-bold">Only {product.stock} left in stock - Order soon!</span>
                  </div>
                )}
              </div>

              {/* Enhanced Description */}
              <div className="bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-lg">
                <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Info className="h-4 w-4 text-white" />
                  </div>
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
              </div>

              {/* Enhanced Specifications */}
              <div className="bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-lg">
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.brand && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block text-xs mb-1">Brand</span>
                      <span className="text-gray-700 text-sm">{product.brand}</span>
                    </div>
                  )}
                  {product.model && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block text-xs mb-1">Model</span>
                      <span className="text-gray-700 text-sm">{product.model}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block text-xs mb-1">Color</span>
                      <span className="text-gray-700 text-sm">{product.color}</span>
                    </div>
                  )}
                  {product.material && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block text-xs mb-1">Material</span>
                      <span className="text-gray-700 text-sm">{product.material}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block text-xs mb-1">Weight</span>
                      <span className="text-gray-700 text-sm">{product.weight}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block text-xs mb-1">Dimensions</span>
                      <span className="text-gray-700 text-sm">{product.dimensions}</span>
                    </div>
                  )}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-900 block text-xs mb-1">Stock</span>
                    <span className="text-gray-700 text-sm">{product.stock} units</span>
                  </div>
                  {product.warranty && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block text-xs mb-1">Warranty</span>
                      <span className="text-gray-700 text-sm">{product.warranty}</span>
                    </div>
                  )}
                  {product.specifications && (
                    <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block text-xs mb-1">Additional Details</span>
                      <span className="text-gray-700 text-sm">{product.specifications}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Quantity and Actions */}
              {product.stock > 0 && (
                <div className="bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-lg space-y-5">
                  <div>
                    <label className="block text-base font-black text-gray-900 mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-bold text-base"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                          className="w-16 text-center border-0 py-2 font-bold text-base focus:ring-0"
                        />
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-bold text-base"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg font-bold border border-gray-200">
                        {product.stock} available
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || product.stock === 0}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 border border-blue-700"
                    >
                      {addingToCart ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button className="w-12 h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 group">
                      <Heart className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
                    </button>
                    <button className="w-12 h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 group">
                      <Share2 className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Premium Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 flex items-center gap-3 group hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-blue-900 text-sm">Free Shipping</p>
                    <p className="text-xs text-blue-700 font-medium">On all orders</p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200 flex items-center gap-3 group hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-green-900 text-sm">{product.warranty || '1 Year Warranty'}</p>
                    <p className="text-xs text-green-700 font-medium">Protected</p>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200 flex items-center gap-3 group hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <RotateCcw className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-orange-900 text-sm">30-Day Returns</p>
                    <p className="text-xs text-orange-700 font-medium">Easy returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Additional Information */}
          <div className="mt-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Info className="h-4 w-4 text-white" />
              </div>
              Additional Information
            </h3>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p className="text-lg leading-relaxed">
                This product is part of our premium hardware collection, designed to meet the demanding 
                requirements of modern businesses and professionals. Each item undergoes rigorous quality 
                testing to ensure optimal performance and reliability.
              </p>
              <p className="leading-relaxed">
                For technical support or product questions, please contact our customer service team. 
                We're here to help you make the right choice for your hardware needs.
              </p>
            </div>
          </div>

          {/* Enhanced Related Products */}
          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-white" />
                </div>
                Related Products
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {product.relatedProducts.map((relatedProduct, idx) => {
                  const pid = getPid(relatedProduct);
                  const key = pid ?? `related-${idx}`;
                  return (
                  <div key={key} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-300 group-hover:text-gray-400 transition-colors" />
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{relatedProduct.name}</h4>
                      <p className="text-sm text-gray-500 mb-4 bg-gray-100 px-2 py-1 rounded-full inline-block">{relatedProduct.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                          {relatedProduct.discountPercent != null && relatedProduct.discountedPrice != null && relatedProduct.discountedPrice < relatedProduct.price ? (
                            <span>
                              ${parseFloat(relatedProduct.discountedPrice).toFixed(2)}
                              <span className="ml-2 text-sm font-semibold text-gray-400 line-through">${parseFloat(relatedProduct.price).toFixed(2)}</span>
                            </span>
                          ) : (
                            `$${parseFloat(relatedProduct.price).toFixed(2)}`
                          )}
                        </span>
                        <button
                          onClick={() => pid && navigate(`/products/${pid}`)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Premium Sticky Mobile Add-to-Cart */}
          {product.stock > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-white via-white to-gray-50 border-t border-gray-200 shadow-2xl p-4 lg:hidden backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-lg font-bold hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border-l border-r border-gray-200 font-bold text-lg focus:ring-0 focus:border-blue-500"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center text-lg font-bold hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 transform active:scale-95"
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-6 w-6" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
    </Layout>
  );
};

export default ProductDetail;