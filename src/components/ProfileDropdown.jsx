import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, ShoppingBag, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      onClick: () => {
        console.log('Navigate to profile');
        setIsOpen(false);
      }
    },
    {
      icon: ShoppingBag,
      label: 'Order History',
      onClick: () => {
        console.log('Navigate to orders');
        setIsOpen(false);
      }
    },
    {
      icon: Heart,
      label: 'Wishlist',
      onClick: () => {
        console.log('Navigate to wishlist');
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => {
        console.log('Navigate to settings');
        setIsOpen(false);
      }
    }
  ];

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="profile-section flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        {/* Profile Image or Avatar */}
        <div className="relative">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName || user.username}
              className="w-9 h-9 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-all duration-300">
              {(user.fullName || user.username)?.charAt(0)?.toUpperCase()}
            </div>
          )}
          {/* Online Status Indicator */}
          <div className="online-indicator absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        
        {/* User Info */}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold text-gray-900 leading-tight">
            {user.fullName || user.username}
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            {user.email ? (
              <span className="truncate max-w-32 inline-block">{user.email}</span>
            ) : (
              'Customer'
            )}
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
        
        {/* Google Badge (if Google authenticated) */}
        {user.isGoogleAuth && (
          <div className="hidden md:flex items-center justify-center w-5 h-5 bg-white rounded-full shadow-sm border border-gray-200">
            <svg className="w-3 h-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-slideDown">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName || user.username}
                  className="w-12 h-12 rounded-full border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full flex items-center justify-center text-white font-bold">
                  {(user.fullName || user.username)?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900 text-sm">
                  {user.fullName || user.username}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-40">
                  {user.email || 'Customer Account'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom Styles */}
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
        
        @keyframes profileGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-3px);
          }
          60% {
            transform: translateY(-2px);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .profile-section:hover {
          animation: profileGlow 2s ease-in-out infinite;
        }
        
        .online-indicator {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfileDropdown;