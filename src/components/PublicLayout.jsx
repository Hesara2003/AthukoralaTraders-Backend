import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone, Mail, MapPin, User, LogIn, Package, Home, Info, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CartButton from './CartButton';
import ShoppingCartModal from './ShoppingCartModal';
import FloatingActionButtons from './FloatingActionButtons';
import { Navbar1 } from './ui/navbar-1';
import { ModernFooter } from './ModernFooter';

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or at top
        setShowNavbar(true);
      } else {
        // Scrolling down
        setShowNavbar(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Shop', icon: Package },
    { to: '/about', label: 'About', icon: Info },
    { to: '/contact', label: 'Contact', icon: MessageCircle },
  ];

  const logoComponent = (
    <Link to="/" className="flex items-center space-x-3 group">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 shadow-lg">
          <Package className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="transition-all duration-300">
        <h1 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 tracking-tight">Athukorala</h1>
        <p className="text-xs text-gray-600 -mt-0.5 group-hover:text-gray-800 transition-colors duration-300 font-medium">Hardware Traders</p>
      </div>
    </Link>
  );

  const ctaButtonComponent = (
    <Link
      to="/login"
      className="inline-flex items-center justify-center px-6 py-2.5 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-colors font-medium shadow-md hover:shadow-lg"
    >
      Login
    </Link>
  );

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

      {/* New Modern Navbar */}
      <div className={`sticky top-0 z-50 bg-gray-50 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        <Navbar1 
          navLinks={navLinks}
          logo={logoComponent}
          ctaButton={ctaButtonComponent}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <ModernFooter />

      {/* Shopping Cart Modal */}
      <ShoppingCartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Floating Action Buttons */}
      <FloatingActionButtons />

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