import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CartButton from './CartButton';
import ProfileDropdown from './ProfileDropdown';

const Container = ({ children }) => (
  <div className="max-w-7xl mx-auto px-4">{children}</div>
);

export default function CustomerLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 bg-white/95 border-b border-gray-100/50 shadow-lg transition-all duration-500">
        <Container>
          <div className="h-20 flex items-center justify-between">
            {/* Left: Logo */}
            <Link to="/products" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                  A
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <div className="transition-all duration-300 group-hover:translate-x-1">
                <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Athukorala</span>
                <p className="text-sm text-gray-600 -mt-1 group-hover:text-gray-700 transition-colors duration-300">Hardware Store</p>
              </div>
            </Link>

            {/* Center: Search (visual only) */}
            <div className="hidden lg:flex items-center gap-2 w-1/2 max-w-xl">
              <div className="relative flex-1 group">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:text-blue-600 group-focus-within:scale-110" />
                <input
                  type="search"
                  placeholder="Search for tools, hardware, materials..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg placeholder:text-gray-400"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <CartButton className="border border-gray-200 hover:border-blue-300 p-3 rounded-xl hover:bg-blue-50/80 transition-all duration-300 hover:scale-105 hover:shadow-lg relative z-10" />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {user ? (
                <ProfileDropdown />
              ) : (
                <div className="relative group">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-300 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-105 relative z-10"
                  >
                    <User className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" /> 
                    Sign in
                  </Link>
                  <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-blue-300 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </header>

      {/* Hero strip */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-300/15 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>
        <Container>
          <div className="py-12 flex items-center justify-between relative z-10">
            <div className="animate-slideInLeft">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {user ? (
                  <>Welcome back, {user.fullName?.split(' ')[0] || user.username}! 👋</>
                ) : (
                  'Quality Hardware, Better Prices'
                )}
              </h1>
              <p className="text-white/90 text-lg leading-relaxed">
                {user ? (
                  'Continue shopping for premium tools and hardware supplies.'
                ) : (
                  'Browse our catalog and add items to your cart in seconds.'
                )}
              </p>
              <div className="mt-4 flex items-center gap-4 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Over 10,000+ products available</span>
                </div>
                {user && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Welcome back, valued customer!</span>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden lg:block animate-float">
              <div className="relative">
                <ShoppingCart className="w-16 h-16 text-white/90 transform rotate-12" />
                <div className="absolute -inset-2 bg-white/20 rounded-full blur-lg opacity-50"></div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main content */}
      <main className="py-8">
        <Container>{children}</Container>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} Athukorala Traders</footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(12deg);
          }
          50% {
            transform: translateY(-10px) rotate(12deg);
          }
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
