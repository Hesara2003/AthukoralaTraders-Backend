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
import { HardwareHero } from '../components/HardwareHero';
import { ProductCard } from '../components/ui/product-card';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { Testimonials } from '../components/Testimonials';
import { OurServices } from '../components/OurServices';
import { CTASection } from '../components/CTASection';
import { Awards } from '../components/ui/award';

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

      {/* Hardware Hero Section */}
      <HardwareHero />

      {/* Stats Section */}
      <ScrollReveal>
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group cursor-pointer transform hover:scale-105 transition-all duration-300 animate-fade-in-up bg-white rounded-2xl p-6 shadow-md hover:shadow-xl relative overflow-hidden" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl mb-4 shadow-lg">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600">{stat.label}</div>
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
                        <ProductCard
                          name={product.name}
                          description={product.description || "Quality hardware product for your needs"}
                          image={product.imageUrl || product.image || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop&auto=format&q=80"}
                          price={`Rs. ${discountInfo.hasDiscount ? discountInfo.discountedPrice.toLocaleString() : product.price.toLocaleString()}`}
                          originalPrice={discountInfo.hasDiscount ? `Rs. ${product.price.toLocaleString()}` : null}
                          discount={discountInfo.hasDiscount ? Math.round(discountInfo.discountPercent) : null}
                          rating={4.5}
                          inStock={product.stockQuantity > 0}
                          onAddToCart={() => handleAddToCart(product)}
                          onQuickView={() => setQuickViewProduct(product)}
                          isInCart={false}
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
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Shop by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our extensive range of hardware products
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="group relative h-48 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105 hover:-translate-y-1"
              >
                {/* Category image placeholder with gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700"></div>
                
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl mb-3 mx-auto border border-white/20">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base text-white">{category}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Our Services Section */}
      <OurServices />

      {/* Awards & Recognition Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-50 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-3 px-4 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-bold rounded-full shadow-lg">
              🏆 AWARDS & RECOGNITION
            </div>
            <h2 className="heading text-5xl font-black text-gray-900 mb-4">Our Achievements</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Recognized for excellence and commitment to quality</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ScrollReveal delay={0.1}>
              <Awards
                variant="badge"
                title="Best Quality"
                subtitle="Hardware Excellence Award"
                date="2024"
                className="transform hover:scale-105 transition-transform duration-300"
              />
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <Awards
                variant="badge"
                title="Top Rated"
                subtitle="Customer Choice Award"
                recipient="5000+ Reviews"
                date="2024"
                className="transform hover:scale-105 transition-transform duration-300"
              />
            </ScrollReveal>
            
            <ScrollReveal delay={0.3}>
              <Awards
                variant="badge"
                title="Industry Leader"
                subtitle="25 Years of Excellence"
                date="1999-2024"
                className="transform hover:scale-105 transition-transform duration-300"
              />
            </ScrollReveal>
            
            <ScrollReveal delay={0.4}>
              <Awards
                variant="badge"
                title="Trusted Partner"
                subtitle="Authorized Dealer"
                recipient="Leading Brands"
                date="2024"
                className="transform hover:scale-105 transition-transform duration-300"
              />
            </ScrollReveal>
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
      <CTASection />

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
