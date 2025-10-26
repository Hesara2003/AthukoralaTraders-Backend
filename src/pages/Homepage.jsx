import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Package, Users, Award, TrendingUp, ShoppingCart, Eye, Plus, ChevronLeft, ChevronRight, Truck, Shield, HeadphonesIcon, Clock, CheckCircle, Wrench, Hammer, Zap, ThumbsUp } from 'lucide-react';
import { CustomerProductApi } from '../utils/customerProductApi';
import { useCart } from '../contexts/CartContext';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import PublicLayout from '../components/PublicLayout';
import ScrollReveal from '../components/ScrollReveal';
import LoadingSpinner from '../components/LoadingSpinner';
import RecentlyViewedSection from '../components/RecentlyViewedSection';
import ProductQuickView from '../components/ProductQuickView';
import EnhancedProductCard from '../components/EnhancedProductCard';

const Homepage = () => {
  const navigate = useNavigate();
  const { addToCart, canAddToCart } = useCart();
  const { recentlyViewed } = useRecentlyViewed();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [discountData, setDiscountData] = useState(new Map());
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0);
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const [currentTestimonialSlide, setCurrentTestimonialSlide] = useState(0);
  // brands list used for the brands carousel (rendered twice for seamless looping)
  const brands = [
    { src: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3ABosch-logo.svg&psig=AOvVaw2EkMoxduAgPhtQFZWONpwH&ust=1761378839411000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCIik09GtvJADFQAAAAAdAAAAABAE', alt: 'Bosch' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/DeWalt_Logo.svg/957px-DeWalt_Logo.svg.png', alt: 'DeWalt' },
    { src: 'https://images.seeklogo.com/logo-png/50/2/stanley-logo-png_seeklogo-502839.png', alt: 'Stanley' },
    { src: 'https://images.seeklogo.com/logo-png/29/1/black-decker-logo-png_seeklogo-294137.png', alt: 'Black & Decker' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Milwaukee_Logo.svg/1280px-Milwaukee_Logo.svg.png', alt: 'Milwaukee' },
    { src: 'https://1000logos.net/wp-content/uploads/2017/12/Makita-logo.png', alt: 'Makita' }
  ];
  const productsScrollRef = useRef(null);
  const brandsScrollRef = useRef(null);
  
  const heroSlides = [
    {
      title: "Your Trusted Hardware Partner",
      subtitle: "Quality Products for Every Project",
      description: "Premium tools, equipment, and materials for construction and industrial needs",
      cta: "Shop Now",
      ctaLink: "/products"
    },
    {
      title: "Professional Grade Tools",
      subtitle: "Built to Last",
      description: "Industry-leading brands with manufacturer warranties and expert support",
      cta: "Explore Tools",
      ctaLink: "/products?category=Tools"
    },
    {
      title: "Fast Delivery Across Sri Lanka",
      subtitle: "Get What You Need, When You Need It",
      description: "Quick and reliable delivery service with real-time tracking",
      cta: "Learn More",
      ctaLink: "/about"
    }
  ];

  const banners = [
    { text: "🎉 Free Delivery on Orders Over Rs. 10,000", color: "bg-blue-600" },
    { text: "⭐ Up to 30% Off on Selected Items This Week", color: "bg-red-600" },
    { text: "🛠️ Expert Advice Available - Call +94 11 234 5678", color: "bg-green-600" },
    { text: "🏆 25+ Years of Excellence in Hardware Solutions", color: "bg-purple-600" }
  ];

  const stats = [
    { icon: Package, value: '1000+', label: 'Products' },
    { icon: Users, value: '5000+', label: 'Happy Customers' },
    { icon: Award, value: '25+', label: 'Years Experience' },
    { icon: TrendingUp, value: '99%', label: 'Satisfaction Rate' },
  ];

  const getDiscountInfo = (product) => {
    const discountInfo = discountData.get(product.name);
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
        // Use only CustomerProductApi for public homepage - no admin access needed
        const customerData = await CustomerProductApi.list();
        
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
        
        const normalized = (Array.isArray(customerData) ? customerData : []).map((p) => {
          const pid = p?.id ?? p?.productId ?? p?._id ?? p?.sku ?? p?.code ?? null;
          return pid != null ? { ...p, id: pid } : p;
        });
        
        setFeaturedProducts(normalized.slice(0, 12));
        const uniqueCategories = [...new Set(normalized.map(product => product.category).filter(cat => cat))].slice(0, 6);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setFeaturedProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Auto-scroll hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Auto-scroll banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Auto-scroll products carousel
  useEffect(() => {
    if (featuredProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentProductSlide((prev) => (prev + 1) % Math.ceil(featuredProducts.length / 4));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [featuredProducts.length]);

  // Auto-scroll testimonials carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialSlide((prev) => (prev + 1) % 3); // 3 testimonials
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Continuous infinite scroll for brands carousel (seamless loop)
  useEffect(() => {
    const el = brandsScrollRef.current;
    if (!el) return;

    // ensure we render duplicated content width-wise before starting
    // We'll use requestAnimationFrame to increment scrollLeft for a smooth continuous effect
    let rafId = null;
    const speed = 0.5; // px per frame, tweak for faster/slower movement

    const step = () => {
      if (!el) return;
      // if content is not overflowed, just loop the RAF
      if (el.scrollWidth <= el.clientWidth) {
        rafId = requestAnimationFrame(step);
        return;
      }

      el.scrollLeft += speed;

      // when we've scrolled past half (we render items twice), jump back seamlessly
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = el.scrollLeft - el.scrollWidth / 2;
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Sync scroll position with currentProductSlide
  useEffect(() => {
    if (productsScrollRef.current && featuredProducts.length > 0) {
      const cardWidth = 320; // w-80 = 320px
      const gap = 16; // gap-4 = 16px
      const scrollPosition = currentProductSlide * 4 * (cardWidth + gap);
      productsScrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentProductSlide, featuredProducts.length]);

  // (Removed discrete brand slide sync) - continuous scroll implemented above

  const handleAddToCart = (product) => {
    const discountInfo = getDiscountInfo(product);
    const effectivePrice = discountInfo.hasDiscount ? discountInfo.discountedPrice : product.price;
    const productForCart = { ...product, price: effectivePrice };

    const validation = canAddToCart(productForCart, 1);
    if (validation.canAdd) {
      addToCart(productForCart, 1);
    }
  };

  const scrollProducts = (direction) => {
    const maxSlide = Math.ceil(featuredProducts.length / 4) - 1;
    if (direction === 'left') {
      setCurrentProductSlide((prev) => (prev > 0 ? prev - 1 : maxSlide));
    } else {
      setCurrentProductSlide((prev) => (prev < maxSlide ? prev + 1 : 0));
    }
  };

  const scrollBrands = (direction) => {
    // Manual scroll by one view (3 logos) when arrows are clicked
    const el = brandsScrollRef.current;
    if (!el) return;
    const cardWidth = 256; // w-64
    const gap = 32; // gap-8
    const scrollAmount = 3 * (cardWidth + gap);
    const left = direction === 'left' ? -scrollAmount : scrollAmount;
    el.scrollBy({ left, behavior: 'smooth' });
  };

  return (
    <PublicLayout>
      {/* Sliding Banner */}
      <div className="bg-blue-600 text-white overflow-hidden shadow-md">
        <div className="relative h-12">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                index === currentBannerSlide ? 'opacity-100' : 'opacity-0'
              } ${banner.color}`}
            >
              <p className="text-sm font-semibold tracking-wide">{banner.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Carousel */}
      <section className="relative bg-blue-900 text-white overflow-hidden shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 opacity-20">
          <Wrench className="w-32 h-32 text-white animate-spin" style={{animationDuration: '20s'}} />
        </div>
        <div className="absolute bottom-10 left-10 opacity-20">
          <Hammer className="w-28 h-28 text-white" />
        </div>
        
        <div className="relative container mx-auto px-4">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-700 ${
                index === currentHeroSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            >
              <div className="py-28 lg:py-36">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                    <p className="text-sm font-semibold text-white tracking-wide">🏆 Sri Lanka's #1 Hardware Store</p>
                  </div>
                  <h1 className="heading text-5xl lg:text-8xl font-black mb-6 animate-fade-in-up drop-shadow-2xl tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="heading text-2xl lg:text-4xl text-blue-50 mb-8 animate-fade-in-up drop-shadow-lg font-bold" style={{animationDelay: '0.1s'}}>
                    {slide.subtitle}
                  </p>
                  <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto animate-fade-in-up leading-relaxed" style={{animationDelay: '0.2s'}}>
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                    <Link
                      to={slide.ctaLink}
                      className="inline-flex items-center gap-3 bg-white text-blue-900 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-50 hover:shadow-2xl transition-all duration-300 shadow-2xl transform hover:scale-110 hover:-translate-y-1"
                    >
                      {slide.cta}
                      <ArrowRight className="w-6 h-6" />
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-3 bg-transparent border-2 border-white text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-blue-900 transition-all duration-300 shadow-2xl transform hover:scale-110 hover:-translate-y-1"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentHeroSlide ? 'bg-white w-12 shadow-lg' : 'bg-white/40 w-3 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <ScrollReveal>
        <section className="py-20 bg-white border-b-2 border-gray-100 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-500 animate-fade-in-up bg-white rounded-3xl p-10 border-2 border-gray-100 hover:border-blue-500 hover:shadow-2xl relative overflow-hidden" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-3xl mb-6 group-hover:bg-blue-700 transition-all duration-500 shadow-xl group-hover:shadow-2xl transform group-hover:rotate-6">
                    <stat.icon className="w-12 h-12 text-white transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="heading text-6xl font-black text-blue-600 mb-4 group-hover:text-blue-700 transition-colors duration-300">{stat.value}</div>
                  <div className="text-lg font-bold text-gray-700 group-hover:text-gray-900 transition-colors duration-300 uppercase tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Featured Products Carousel */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-block mb-3 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                ⭐ FEATURED
              </div>
              <h2 className="heading text-5xl font-black text-gray-900 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600 max-w-2xl">Discover our most popular items handpicked for you</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => scrollProducts('left')}
                className="p-4 bg-blue-600 text-white border-2 border-blue-600 rounded-2xl hover:bg-blue-700 hover:border-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl group transform hover:scale-110"
              >
                <ChevronLeft className="w-7 h-7 transition-transform group-hover:-translate-x-1" />
              </button>
              <button
                onClick={() => scrollProducts('right')}
                className="p-4 bg-blue-600 text-white border-2 border-blue-600 rounded-2xl hover:bg-blue-700 hover:border-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl group transform hover:scale-110"
              >
                <ChevronRight className="w-7 h-7 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div 
              ref={productsScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {loading ? (
                <LoadingSpinner text="Loading featured products..." />
              ) : (
                featuredProducts.map((product, index) => {
                  const discountInfo = getDiscountInfo(product);
                  return (
                    <div key={product.id} className="flex-shrink-0 w-80">
                      <ScrollReveal delay={index * 0.05}>
                        <EnhancedProductCard
                          product={product}
                          discountInfo={discountInfo}
                          onQuickView={setQuickViewProduct}
                        />
                      </ScrollReveal>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Carousel Indicators */}
          {!loading && featuredProducts.length > 4 && (
            <div className="flex justify-center gap-3 mt-10">
              {Array.from({ length: Math.ceil(featuredProducts.length / 4) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentProductSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentProductSlide ? 'bg-blue-600 w-12 shadow-lg' : 'bg-gray-300 w-3 hover:bg-gray-400 hover:w-6'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
              📦 CATEGORIES
            </div>
            <h2 className="heading text-5xl font-black text-gray-900 mb-5">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our extensive range of hardware products organized by category
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="group p-10 bg-white rounded-3xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 text-center animate-fade-in-up relative overflow-hidden transform hover:scale-105 hover:-translate-y-2"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-blue-700 transition-all duration-500 shadow-xl group-hover:shadow-2xl transform group-hover:rotate-12">
                    <Package className="w-10 h-10 text-white transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="font-black text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300 uppercase tracking-wide">{category}</h3>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ArrowRight className="w-5 h-5 text-blue-600 mx-auto" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
              ⭐ WHY CHOOSE US
            </div>
            <h2 className="heading text-5xl font-black text-gray-900 mb-5">Why Choose Athukorala Traders?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We've been serving Sri Lanka's construction and industrial sectors for over 25 years with dedication and excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-3xl p-12 border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 group transform hover:scale-110 hover:-translate-y-3 animate-fade-in-up relative overflow-hidden" style={{animationDelay: '0s'}}>
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-700 transition-all duration-500 shadow-xl group-hover:shadow-2xl mx-auto transform group-hover:rotate-12 group-hover:scale-110">
                  <Truck className="w-12 h-12 text-white transition-transform duration-500" />
                </div>
                <h3 className="heading text-2xl font-black text-gray-900 mb-5 group-hover:text-blue-600 transition-colors text-center">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed text-center text-base">
                  Island-wide delivery with real-time tracking. Get your orders delivered quickly and safely to your doorstep.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 group-hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-blue-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Same Day Available</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-12 border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 group transform hover:scale-110 hover:-translate-y-3 animate-fade-in-up relative overflow-hidden" style={{animationDelay: '0.1s'}}>
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-green-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-green-700 transition-all duration-500 shadow-xl group-hover:shadow-2xl mx-auto transform group-hover:rotate-12 group-hover:scale-110">
                  <Shield className="w-12 h-12 text-white transition-transform duration-500" />
                </div>
                <h3 className="heading text-2xl font-black text-gray-900 mb-5 group-hover:text-green-600 transition-colors text-center">Quality Guaranteed</h3>
                <p className="text-gray-600 leading-relaxed text-center text-base">
                  All products come with manufacturer warranties and our quality assurance guarantee for your peace of mind.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 group-hover:border-green-300 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>100% Authentic</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-12 border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 group transform hover:scale-110 hover:-translate-y-3 animate-fade-in-up relative overflow-hidden" style={{animationDelay: '0.2s'}}>
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-orange-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-700 transition-all duration-500 shadow-xl group-hover:shadow-2xl mx-auto transform group-hover:rotate-12 group-hover:scale-110">
                  <HeadphonesIcon className="w-12 h-12 text-white transition-transform duration-500" />
                </div>
                <h3 className="heading text-2xl font-black text-gray-900 mb-5 group-hover:text-orange-600 transition-colors text-center">Expert Support</h3>
                <p className="text-gray-600 leading-relaxed text-center text-base">
                  Our knowledgeable team is always ready to help you find the right products for your specific needs.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 group-hover:border-orange-300 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-orange-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>24/7 Available</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-12 border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 group transform hover:scale-110 hover:-translate-y-3 animate-fade-in-up relative overflow-hidden" style={{animationDelay: '0.3s'}}>
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-purple-700 transition-all duration-500 shadow-xl group-hover:shadow-2xl mx-auto transform group-hover:rotate-12 group-hover:scale-110">
                  <Award className="w-12 h-12 text-white transition-transform duration-500" />
                </div>
                <h3 className="heading text-2xl font-black text-gray-900 mb-5 group-hover:text-purple-600 transition-colors text-center">Trusted Brand</h3>
                <p className="text-gray-600 leading-relaxed text-center text-base">
                  25+ years of excellence serving thousands of satisfied customers across Sri Lanka with reliability.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 group-hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-purple-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Since 1995</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-yellow-500 text-white text-sm font-bold rounded-full">
              💬 TESTIMONIALS
            </div>
            <h2 className="heading text-5xl font-black text-gray-900 mb-5">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          
          {/* Testimonials Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              {[
                {
                  name: 'Sunil Perera',
                  role: 'Construction Manager',
                  initials: 'SP',
                  color: 'bg-blue-600',
                  text: 'Excellent service and top-quality products! I\'ve been buying from Athukorala Traders for my construction projects for years. Never disappointed.'
                },
                {
                  name: 'Nimal Fernando',
                  role: 'Workshop Owner',
                  initials: 'NF',
                  color: 'bg-green-600',
                  text: 'Fast delivery and great prices! The team is always helpful in recommending the right tools for my workshop. Highly recommended!'
                },
                {
                  name: 'Ravi Jayasinghe',
                  role: 'Factory Manager',
                  initials: 'RJ',
                  color: 'bg-purple-600',
                  text: 'Professional service and authentic products. Their warranty support is excellent. Best hardware supplier in Sri Lanka!'
                }
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-opacity duration-700 ${
                    index === currentTestimonialSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
                  }`}
                >
                  <div className="bg-white rounded-3xl p-16 border-2 border-gray-200 hover:border-yellow-400 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                    {/* Hover background effect */}
                    <div className="absolute inset-0 bg-yellow-50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                      {/* Star rating */}
                      <div className="flex items-center justify-center gap-1 mb-8">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      {/* Quote icon */}
                      <div className="text-center mb-8">
                        <span className="text-8xl text-yellow-400 font-serif leading-none">"</span>
                      </div>
                      
                      <p className="text-gray-700 text-2xl mb-12 leading-relaxed italic text-center max-w-3xl mx-auto">
                        {testimonial.text}
                      </p>
                      
                      {/* Author info */}
                      <div className="flex flex-col items-center gap-5 pt-8 border-t-2 border-gray-200">
                        <div className={`w-20 h-20 ${testimonial.color} rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl`}>
                          {testimonial.initials}
                        </div>
                        <div className="text-center">
                          <h4 className="font-black text-gray-900 text-2xl">{testimonial.name}</h4>
                          <p className="text-base text-gray-600 font-medium mt-2">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center gap-3 mt-10">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonialSlide ? 'bg-yellow-500 w-12 shadow-lg' : 'bg-gray-300 w-3 hover:bg-gray-400 hover:w-6'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
              🛠️ OUR SERVICES
            </div>
            <h2 className="heading text-5xl font-black text-gray-900 mb-5">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              More than just a hardware store - we're your complete solution partner
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-12 border-2 border-gray-200 hover:border-green-500 hover:shadow-2xl transition-all duration-500 group animate-fade-in-up transform hover:scale-105 hover:-translate-y-3 relative overflow-hidden" style={{animationDelay: '0s'}}>
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Wrench className="w-10 h-10 text-white" />
                </div>
                <h3 className="heading text-2xl font-black text-gray-900 mb-5 group-hover:text-green-600 transition-colors">Technical Consultation</h3>
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  Free expert advice on product selection, usage, and maintenance. Our experienced team helps you make the right choices.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Product recommendations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Usage guidelines</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Maintenance tips</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-12 border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 group animate-fade-in-up transform hover:scale-105 hover:-translate-y-3 relative overflow-hidden" style={{animationDelay: '0.1s'}}>
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <h3 className="heading text-2xl font-black text-gray-900 mb-5 group-hover:text-blue-600 transition-colors">Bulk Orders</h3>
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  Special pricing and dedicated support for large-scale projects and commercial clients with flexible payment terms.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Volume discounts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Flexible payment options</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-12 border-2 border-gray-200 hover:border-orange-500 hover:shadow-2xl transition-all duration-500 group animate-fade-in-up transform hover:scale-105 hover:-translate-y-3 relative overflow-hidden" style={{animationDelay: '0.2s'}}>
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="heading text-2xl font-black text-gray-900 mb-5 group-hover:text-orange-600 transition-colors">Express Delivery</h3>
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  Need it urgently? We offer same-day delivery for Colombo and express shipping island-wide with real-time tracking.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Same-day delivery (Colombo)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Real-time order tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Secure packaging</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
              🏆 TRUSTED PARTNERS
            </div>
            <h2 className="heading text-5xl font-black text-gray-900 mb-5">Trusted Brands We Carry</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We partner with world-leading manufacturers to bring you the best quality products
            </p>
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-10">
              <div className="flex-1"></div>
              <div className="flex gap-3">
                <button
                  onClick={() => scrollBrands('left')}
                  className="p-4 bg-blue-600 text-white border-2 border-blue-600 rounded-2xl hover:bg-blue-700 hover:border-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl group transform hover:scale-110"
                >
                  <ChevronLeft className="w-7 h-7 transition-transform group-hover:-translate-x-1" />
                </button>
                <button
                  onClick={() => scrollBrands('right')}
                  className="p-4 bg-blue-600 text-white border-2 border-blue-600 rounded-2xl hover:bg-blue-700 hover:border-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl group transform hover:scale-110"
                >
                  <ChevronRight className="w-7 h-7 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                ref={brandsScrollRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                aria-hidden={false}
              >
                {[...brands, ...brands].map((b, idx) => (
                  <div key={`brand-${idx}`} className="flex-shrink-0 w-64 bg-transparent p-8 transition-all duration-500 group transform hover:scale-125">
                    <div className="relative z-10 flex items-center justify-center h-40">
                      <img
                        src={b.src}
                        alt={b.alt}
                        className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-blue-600"></div>
        </div>
        <div className="absolute top-10 right-10 opacity-10">
          <Zap className="w-64 h-64 text-blue-600" />
        </div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-blue-600 rounded-3xl p-16 lg:p-20 text-center text-white shadow-2xl border-8 border-blue-700 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-white text-blue-600 rounded-full font-black text-sm shadow-xl">
                <Zap className="w-5 h-5" />
                SPECIAL OFFER
              </div>
              <h2 className="heading text-6xl font-black mb-8 drop-shadow-lg">Ready to Start Your Project?</h2>
              <p className="text-2xl text-blue-50 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                Explore our full range of products and find everything you need for your next project with expert guidance
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 bg-white text-blue-600 px-14 py-6 rounded-2xl font-black text-xl hover:bg-blue-50 hover:shadow-2xl transition-all duration-300 shadow-2xl transform hover:scale-110 hover:-translate-y-1"
                >
                  Browse All Products
                  <ArrowRight className="w-7 h-7" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-3 bg-transparent border-4 border-white text-white px-14 py-6 rounded-2xl font-black text-xl hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-2xl transform hover:scale-110 hover:-translate-y-1"
                >
                  Get Expert Help
                  <HeadphonesIcon className="w-7 h-7" />
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap justify-center gap-8 text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold">Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold">Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold">Expert Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && <RecentlyViewedSection />}

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        getDiscountInfo={getDiscountInfo}
      />
    </PublicLayout>
  );
};

export default Homepage;
