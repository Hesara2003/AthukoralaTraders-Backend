import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Users, Shield, Truck, Heart } from 'lucide-react';

const AuthLayout = ({ 
  children, 
  mode = 'signin', 
  title, 
  subtitle, 
  footerText, 
  footerLink, 
  footerLinkText 
}) => {
  const isSignup = mode === 'signup';
  
  const features = [
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      text: "Premium Hardware & Tools"
    },
    {
      icon: <Star className="h-6 w-6" />,
      text: "Trusted by 10,000+ Customers"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      text: "Secure & Reliable Shopping"
    },
    {
      icon: <Truck className="h-6 w-6" />,
      text: "Fast Island-wide Delivery"
    },
    {
      icon: <Users className="h-6 w-6" />,
      text: "Expert Customer Support"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      text: "Quality Guaranteed"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="max-w-6xl w-full min-h-screen sm:min-h-0 sm:h-[90vh] bg-white sm:rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        
        <div className="relative flex flex-col lg:flex-row h-full">
          
          {/* Image Panel */}
          <div className={`
            relative w-full lg:w-1/2 h-64 sm:h-80 lg:h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 
            flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 text-white overflow-hidden
            transition-all duration-1000 ease-in-out transform flex-shrink-0
            ${isSignup ? 'lg:order-2' : 'lg:order-1'}
          `}>
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-300/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/10 rounded-full blur-xl animate-pulse delay-500"></div>
            </div>
            
            <div className="relative z-10 text-center">
              
              {/* Logo */}
              <div className="mb-3 sm:mb-4 lg:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl backdrop-blur-sm mb-2 sm:mb-4">
                  <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Athukorala Traders</h1>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base">Sri Lanka's Premier Hardware Store</p>
              </div>

              {/* Welcome Message - Hidden on mobile to save space */}
              <div className="hidden sm:block mb-4 lg:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 lg:mb-4">
                  {isSignup ? 'Join Our Community!' : 'Welcome Back!'}
                </h2>
                <p className="text-blue-100 leading-relaxed max-w-sm mx-auto text-xs sm:text-sm lg:text-base">
                  {isSignup 
                    ? 'Discover premium quality tools and hardware supplies for all your construction and renovation needs.'
                    : 'Continue your journey with us and explore our extensive collection of quality hardware products.'
                  }
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
                {features.slice(0, isSignup ? (window.innerWidth < 640 ? 4 : 6) : (window.innerWidth < 640 ? 2 : 4)).map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 p-2 lg:p-3 bg-white/10 rounded-lg backdrop-blur-sm transform transition-all duration-300 hover:scale-105"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="text-blue-200 flex-shrink-0">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                        {React.cloneElement(feature.icon, { className: "w-full h-full" })}
                      </div>
                    </div>
                    <span className="text-xs sm:text-xs lg:text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Decorative Elements - Hidden on small mobile */}
              <div className="hidden sm:block">
                <div className="mt-3 sm:mt-6 lg:mt-8 flex justify-center space-x-1 sm:space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-yellow-300 fill-current animate-pulse" 
                      style={{ animationDelay: `${i * 200}ms` }} 
                    />
                  ))}
                </div>
                <p className="text-xs text-blue-200 mt-1 sm:mt-2">Rated 4.9/5 by our customers</p>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className={`
            relative w-full lg:w-1/2 flex-1 flex items-start justify-center p-3 sm:p-6 lg:p-8 xl:p-12 overflow-y-auto
            transition-all duration-1000 ease-in-out
            ${isSignup ? 'lg:order-1' : 'lg:order-2'}
          `}>
            
            {/* Hardware Background Images */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Tools Pattern Background */}
              <div className="absolute inset-0 opacity-5">
                <div className="grid grid-cols-8 gap-4 h-full w-full p-4 rotate-12 transform scale-110">
                  {/* Hardware Icons Pattern */}
                  {[...Array(64)].map((_, i) => (
                    <div key={i} className="flex items-center justify-center text-gray-600">
                      {i % 8 === 0 && <div className="w-6 h-6 border-2 border-current rounded"></div>}
                      {i % 8 === 1 && <div className="w-6 h-1 bg-current rounded-full"></div>}
                      {i % 8 === 2 && <div className="w-1 h-6 bg-current rounded-full"></div>}
                      {i % 8 === 3 && <div className="w-5 h-5 border-2 border-current rounded-full"></div>}
                      {i % 8 === 4 && <div className="w-6 h-6 border-2 border-current transform rotate-45"></div>}
                      {i % 8 === 5 && <div className="w-4 h-4 bg-current rounded-full"></div>}
                      {i % 8 === 6 && <div className="w-6 h-2 bg-current rounded"></div>}
                      {i % 8 === 7 && <div className="w-5 h-5 border-2 border-current"></div>}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating Hardware Elements */}
              <div className="absolute top-10 left-10 opacity-10 animate-pulse">
                <div className="w-16 h-16 border-4 border-gray-400 rounded-lg transform rotate-12"></div>
              </div>
              <div className="absolute top-20 right-16 opacity-10 animate-pulse delay-500">
                <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
              </div>
              <div className="absolute bottom-20 left-20 opacity-10 animate-pulse delay-1000">
                <div className="w-8 h-20 bg-gray-400 rounded transform -rotate-12"></div>
              </div>
              <div className="absolute bottom-32 right-12 opacity-10 animate-pulse delay-700">
                <div className="w-14 h-14 border-4 border-gray-400 transform rotate-45"></div>
              </div>
              <div className="absolute top-1/2 left-8 opacity-10 animate-pulse delay-300">
                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
              </div>
              <div className="absolute top-1/3 right-8 opacity-10 animate-pulse delay-800">
                <div className="w-10 h-3 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            
            {/* Form Container with Glass Effect */}
            <div className="relative w-full max-w-md slide-content py-4 sm:py-8 my-auto z-10">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
              
              {/* Header */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-3 sm:mb-4 shadow-lg">
                  <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{title}</h2>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base px-2">{subtitle}</p>
              </div>

                {/* Form Content */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {children}
                </div>

                {/* Footer */}
                <div className="mt-4 sm:mt-6 lg:mt-8 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {footerText}{" "}
                    <Link
                      to={footerLink}
                      className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-200"
                    >
                      {footerLinkText}
                    </Link>
                  </p>
                  
                  {/* Business Login Link */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Admin/Staff/Supplier?{" "}
                      <Link 
                        to="/business-login" 
                        className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        Business Login
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .slide-content {
          animation: ${isSignup ? 'slideInLeft' : 'slideInRight'} 0.8s ease-out 0.5s both;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .slide-content {
            animation: slideInUp 0.8s ease-out 0.3s both;
          }
        }
        
        /* Mobile specific adjustments */
        @media (max-width: 640px) {
          .slide-content {
            animation: fadeInUp 0.6s ease-out 0.2s both;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;