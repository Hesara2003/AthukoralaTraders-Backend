import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone, Mail, MapPin, User, LogIn, Package, Home, Info, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CartButton from './CartButton';
import ShoppingCartModal from './ShoppingCartModal';

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Shop', icon: Package },
    { to: '/about', label: 'About', icon: Info },
    { to: '/contact', label: 'Contact', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white text-sm relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-2 -left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-2 -right-10 w-16 h-16 bg-purple-300/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 py-2 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2 hover:text-blue-200 transition-colors duration-300 group">
                <Phone className="w-3 h-3 group-hover:animate-bounce" />
                <span className="font-medium">+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-200 transition-colors duration-300 group">
                <Mail className="w-3 h-3 group-hover:animate-bounce" />
                <span className="font-medium">info@athukolaratraders.lk</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 hover:text-blue-200 transition-colors duration-300 group">
              <MapPin className="w-3 h-3 group-hover:animate-bounce" />
              <span className="font-medium">Colombo, Sri Lanka</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-2xl border-b border-gray-100/50 sticky top-0 z-40 transition-all duration-500">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <div className="transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Athukorala</h1>
                <p className="text-sm text-gray-600 -mt-1 group-hover:text-gray-700 transition-colors duration-300">Hardware Traders</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 group rounded-xl hover:bg-blue-50/80"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <link.icon className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <span className="relative">
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="relative group">
                <CartButton 
                  onClick={() => setIsCartOpen(true)} 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg" 
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <div className="relative group">
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-900 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 relative z-10"
                >
                  <LogIn className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Login</span>
                </Link>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-800 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
              {isMobileMenuOpen ? 
                <X className="w-6 h-6 transition-transform duration-300 rotate-90" /> : 
                <Menu className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" />
              }
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t bg-white/95 backdrop-blur-md animate-slideDown">
              <nav className="py-6 space-y-3">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 mx-4 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 rounded-xl transition-all duration-300 transform hover:scale-102 hover:shadow-lg group"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'slideInFromLeft 0.3s ease-out forwards'
                    }}
                  >
                    <link.icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
                <div className="mx-4 px-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="relative group">
                    <CartButton 
                      onClick={() => {
                        setIsCartOpen(true);
                        setIsMobileMenuOpen(false);
                      }} 
                      className="text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 p-3 rounded-xl transition-all duration-300 hover:scale-110" 
                    />
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <div className="relative group">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-800 hover:from-blue-700 hover:to-indigo-900 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 relative z-10"
                    >
                      <LogIn className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                      <span>Login</span>
                    </Link>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-800 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Athukorala Hardware Traders</h3>
                  <p className="text-gray-400 text-sm">Your trusted hardware partner</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 leading-relaxed">
                We are a leading hardware trading company in Sri Lanka, providing quality tools, 
                equipment, and materials for construction, industrial, and domestic needs since 1995.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Links */}
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold">f</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold">t</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold">in</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">123 Hardware Street, Colombo 03, Sri Lanka</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">+94 11 234 5678</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">info@athukolaratraders.lk</span>
                </li>
              </ul>
              
              <div className="mt-4">
                <h5 className="font-medium mb-2">Business Hours</h5>
                <p className="text-gray-400 text-sm">Mon - Fri: 8:00 AM - 6:00 PM</p>
                <p className="text-gray-400 text-sm">Sat: 8:00 AM - 4:00 PM</p>
                <p className="text-gray-400 text-sm">Sun: Closed</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Athukorala Hardware Traders. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Modal */}
      <ShoppingCartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default PublicLayout;