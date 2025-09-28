import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Package, Users, Award, TrendingUp, ShoppingCart, Eye, Plus, Search, Filter, ChevronRight } from 'lucide-react';
import { ProductApi } from '../utils/productApi';
import { CustomerProductApi } from '../utils/customerProductApi';
import { useCart } from '../contexts/CartContext';
import PublicLayout from '../components/PublicLayout';

const Homepage = () => {
  const navigate = useNavigate();
  const { addToCart, canAddToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
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
        // Fetch both admin products (for complete data) and customer products (for discount info)
        const [adminData, customerData] = await Promise.all([
          ProductApi.list(),
          CustomerProductApi.list().catch(() => []) // Don't fail if customer API is down
        ]);
        
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
        
        // Normalize IDs for consistent linking
        const normalized = (Array.isArray(adminData) ? adminData : []).map((p) => {
          const pid = p?.id ?? p?.productId ?? p?._id ?? p?.sku ?? p?.code ?? null;
          return pid != null ? { ...p, id: pid } : p;
        });
        // Get first 8 products as featured
        setFeaturedProducts(normalized.slice(0, 8));
        
        // Extract unique categories
        const uniqueCategories = [...new Set(normalized.map(product => product.category).filter(cat => cat))].slice(0, 6);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    // Use discounted price if available
    const discountInfo = getDiscountInfo(product);
    const effectivePrice = discountInfo.hasDiscount ? discountInfo.discountedPrice : product.price;
    const productForCart = { ...product, price: effectivePrice };

    const validation = canAddToCart(productForCart, 1);
    if (validation.canAdd) {
      addToCart(productForCart, 1);
    }
  };

  const stats = [
    { icon: Package, value: '1000+', label: 'Products' },
    { icon: Users, value: '5000+', label: 'Happy Customers' },
    { icon: Award, value: '25+', label: 'Years Experience' },
    { icon: TrendingUp, value: '99%', label: 'Satisfaction Rate' },
  ];

  // Category to image mapping
  const getCategoryImage = (category) => {
    const categoryMap = {
      'Tools': '/images/category-tools.svg',
      'Construction': '/images/category-construction.svg',
      'Plumbing': '/images/category-plumbing.svg',
      'Electrical': '/images/category-electrical.svg',
      'Hardware': '/images/category-hardware.svg',
      'Safety': '/images/category-safety.svg',
      'Garden': '/images/category-garden.svg',
    };
    
    // Try exact match first
    if (categoryMap[category]) {
      return categoryMap[category];
    }
    
    // Try partial matches
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('tool')) return categoryMap['Tools'];
    if (categoryLower.includes('construct') || categoryLower.includes('build')) return categoryMap['Construction'];
    if (categoryLower.includes('plumb') || categoryLower.includes('pipe')) return categoryMap['Plumbing'];
    if (categoryLower.includes('electric') || categoryLower.includes('wire')) return categoryMap['Electrical'];
    if (categoryLower.includes('hardware') || categoryLower.includes('screw') || categoryLower.includes('nail')) return categoryMap['Hardware'];
    if (categoryLower.includes('safety') || categoryLower.includes('protect')) return categoryMap['Safety'];
    if (categoryLower.includes('garden') || categoryLower.includes('outdoor')) return categoryMap['Garden'];
    
    // Default fallback
    return categoryMap['Hardware'];
  };

  const features = [
    {
      title: 'Quality Guaranteed',
      description: 'All our products meet the highest quality standards with manufacturer warranties.',
      icon: Award,
      image: '/images/feature-quality.svg'
    },
    {
      title: 'Expert Support',
      description: 'Our knowledgeable team provides professional advice and technical support.',
      icon: Users,
      image: '/images/feature-support.svg'
    },
    {
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery service across Sri Lanka with tracking.',
      icon: Package,
      image: '/images/feature-delivery.svg'
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
             style={{backgroundImage: 'url(/images/hero-bg.jpg)'}}></div>
        {/* Hardware-themed SVG overlay */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60" 
             style={{backgroundImage: 'url(/images/hero-hardware-bg.svg)'}}></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-blue-800/40"></div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Your Trusted
                  <span className="block text-yellow-400">Hardware Partner</span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed mb-8">
                  Discover premium tools, equipment, and materials for all your construction, 
                  industrial, and domestic needs. Quality products, expert service, competitive prices.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-lg mb-2">
                      <stat.icon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-400">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Store Information Card with Background */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 relative overflow-hidden">
                {/* Decorative hardware tools illustration */}
                <div className="absolute -right-6 -top-6 opacity-10">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center transform rotate-12">
                    <Package className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Now Open</span>
                  </div>
                  <h3 className="text-2xl font-bold">Visit Our Store</h3>
                  <p className="text-blue-100">
                    Experience our products firsthand at our Colombo showroom. 
                    Expert staff ready to assist you.
                  </p>
                  <div className="space-y-2 text-sm text-blue-200">
                    <p>📍 123 Hardware Street, Colombo 03</p>
                    <p>📞 +94 11 234 5678</p>
                    <p>🕒 Mon-Fri: 8AM-6PM, Sat: 8AM-4PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 relative">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 gap-4 h-full">
            {Array.from({length: 64}).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-gray-400 rounded-full"></div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl mb-4 shadow-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse our extensive range of hardware products organized by category
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/products`}
                className="group bg-gray-50 hover:bg-blue-50 rounded-xl p-6 text-center transition-all duration-200 hover:shadow-lg border border-gray-100 hover:border-blue-200 transform hover:scale-105"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:scale-110">
                  <img 
                    src={getCategoryImage(category)} 
                    alt={category}
                    className="w-12 h-12 transition-transform duration-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-full items-center justify-center transition-colors hidden">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-sm">
                  {category}
                </h3>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              View All Categories
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 relative">
        {/* Decorative background elements */}
        <div className="absolute top-8 left-8 w-20 h-20 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 bg-yellow-100 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-green-100 rounded-full opacity-40 animate-ping"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 relative">
            {/* Decorative icon above title */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4 shadow-lg transform rotate-12">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular and high-quality hardware products
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100">
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                      {Array.isArray(product.images) && product.images.length > 0 ? (
                        <img
                          src={`http://localhost:8080/api/files/products/${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Package className="w-16 h-16 text-gray-300" />
                      )}
                    </div>
                    
                    {/* Stock Badge */}
                    <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full backdrop-blur ${
                      (product.stock != null ? Number(product.stock) : 0) > 0 ? 'bg-green-100/80 text-green-800' : 'bg-red-100/80 text-red-800'
                    }`}>
                      {(product.stock != null ? Number(product.stock) : 0) > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>

                    {/* Discount Badge */}
                    {(() => {
                      const discountInfo = getDiscountInfo(product);
                      return discountInfo.hasDiscount && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full bg-red-500 text-white shadow-md">
                          -{discountInfo.discountPercent}%
                        </span>
                      );
                    })()}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { if (product?.id != null) navigate(`/products/${product.id}`); }}
                          className="p-3 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {(product.stock != null ? Number(product.stock) : 0) > 0 && (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                            title="Add to Cart"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {product.brand && (
                        <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">{product.brand}</span>
                      )}
                      {product.category && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between">
                      <div>
                        {/* Price with discount support */}
                        {(() => {
                          const discountInfo = getDiscountInfo(product);
                          return discountInfo.hasDiscount ? (
                            <div className="flex items-baseline gap-2">
                              <p className="text-xl font-bold text-gray-900">${parseFloat(discountInfo.discountedPrice).toFixed(2)}</p>
                              <p className="text-sm font-semibold text-gray-400 line-through">${parseFloat(product.price).toFixed(2)}</p>
                            </div>
                          ) : (
                            <p className="text-xl font-bold text-gray-900">${product.price ? parseFloat(product.price).toFixed(2) : '0.00'}</p>
                          );
                        })()}
                        <p className="text-xs text-gray-500">{product.stock != null ? Number(product.stock) : 0} in stock</p>
                      </div>
                      
                      <button
                        onClick={() => { if (product?.id != null) navigate(`/products/${product.id}`); }}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-white to-blue-50 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-0 w-24 h-24 bg-yellow-400 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best hardware solutions with exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group transform hover:scale-105 transition-all duration-200">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-200 group-hover:scale-110">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-16 h-16 transition-transform duration-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-2xl items-center justify-center transition-colors hidden">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        {/* Background decorative pattern */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" 
             style={{backgroundImage: 'url(/images/cta-background.svg)'}}></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-bounce">
          <Package className="w-8 h-8 text-white/70" />
        </div>
        <div className="absolute bottom-10 right-10 w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center animate-pulse">
          <Award className="w-6 h-6 text-yellow-300" />
        </div>
        <div className="absolute top-1/2 left-20 w-8 h-8 bg-white/5 rounded-full animate-ping"></div>
        <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-blue-300/20 rounded-full animate-bounce delay-300"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their hardware needs. 
            Browse our extensive catalog or visit our showroom today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <ShoppingCart className="w-5 h-5" />
              Start Shopping
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Homepage;