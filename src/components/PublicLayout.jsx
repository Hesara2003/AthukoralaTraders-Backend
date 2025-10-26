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
      <div className="bg-blue-900 text-white text-sm shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center gap-2 hover:text-blue-200 transition-colors duration-300 group">
                <div className="p-1.5 bg-blue-800 rounded-lg group-hover:bg-blue-700 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">+94 11 234 5678</span>
              </div>
              <div className="hidden md:flex items-center gap-2 hover:text-blue-200 transition-colors duration-300 group">
                <div className="p-1.5 bg-blue-800 rounded-lg group-hover:bg-blue-700 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">info@athukolaratraders.lk</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 hover:text-blue-200 transition-colors duration-300 group">
              <div className="p-1.5 bg-blue-800 rounded-lg group-hover:bg-blue-700 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">Colombo, Sri Lanka</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-2xl border-b-2 border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl group-hover:shadow-2xl">
                  <Package className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -inset-1 bg-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <div className="transition-all duration-300">
                <h1 className="text-3xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 tracking-tight">Athukorala</h1>
                <p className="text-sm text-gray-600 -mt-1 group-hover:text-gray-800 transition-colors duration-300 font-medium">Hardware Traders</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 group rounded-2xl hover:bg-blue-50"
                >
                  <link.icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110" />
                  <span className="relative">
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative group">
                <CartButton 
                  onClick={() => setIsCartOpen(true)} 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-4 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg" 
                />
              </div>
              <div className="relative">
                <Link
                  to="/login"
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-4 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300 hover:scale-110"
            >
              {isMobileMenuOpen ? 
                <X className="w-7 h-7" /> : 
                <Menu className="w-7 h-7" />
              }
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t-2 border-gray-100 bg-white">
              <nav className="py-6 space-y-2">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 mx-4 px-5 py-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300 font-semibold group"
                  >
                    <link.icon className="w-6 h-6 transition-all duration-300 group-hover:scale-110" />
                    <span>{link.label}</span>
                  </Link>
                ))}
                <div className="mx-4 px-5 pt-4 border-t-2 border-gray-100 flex items-center justify-between gap-4">
                  <CartButton 
                    onClick={() => {
                      setIsCartOpen(true);
                      setIsMobileMenuOpen(false);
                    }} 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-4 rounded-2xl transition-all duration-300" 
                  />
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-bold shadow-lg flex-1 justify-center"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
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