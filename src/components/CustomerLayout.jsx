import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Package, Home, Info, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CartButton from './CartButton';
import ProfileDropdown from './ProfileDropdown';
import ShoppingCartModal from './ShoppingCartModal';
import FloatingActionButtons from './FloatingActionButtons';
import { Navbar1 } from './ui/navbar-1';
import { ModernFooter } from './ModernFooter';

const Container = ({ children }) => (
  <div className="max-w-7xl mx-auto px-4">{children}</div>
);

export default function CustomerLayout({ children }) {
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setShowNavbar(true);
      } else {
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

  const userProfileComponent = user ? (
    <ProfileDropdown />
  ) : (
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
                <span className="font-semibold">info@athukoralatraders.lk</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 hover:text-blue-200 transition-colors duration-300 group">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-semibold">123 Hardware Street, Colombo 03</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar1 
        logo={logoComponent}
        navLinks={navLinks}
        ctaButton={userProfileComponent}
        showNavbar={showNavbar}
      />

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <ModernFooter />

      {/* Floating Action Buttons */}
      <FloatingActionButtons />

      {/* Shopping Cart Modal */}
      <ShoppingCartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
