import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, LogOut, Package, Calculator, Receipt } from 'lucide-react';

export default function SupplierLayout({ title, subtitle, children, actions }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/supplier/purchase-orders', label: 'Purchase Orders', icon: <FileText className="h-4 w-4" /> },
    { to: '/supplier/catalog', label: 'Catalog Management', icon: <Package className="h-4 w-4" /> },
    { to: '/supplier/invoices/matching', label: 'Invoice Matching', icon: <Receipt className="h-4 w-4" /> },
    { to: '/supplier/reconciliation', label: 'Reconciliation', icon: <Calculator className="h-4 w-4" /> },
  ];

  const linkBase = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <aside className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 hidden md:flex flex-col shadow-xl relative overflow-hidden">
        {/* Sidebar Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-600/20 to-emerald-800/20"></div>
          <div className="absolute top-10 -left-10 w-32 h-32 bg-green-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="h-20 px-6 flex items-center border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-800 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Supplier Portal</h2>
                <p className="text-xs text-gray-600">Purchase Orders</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-6 space-y-2">
            {navItems.map((n, index) => (
              <NavLink key={n.to} to={n.to}
                className={({isActive}) => `${linkBase} ${isActive ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg transform scale-105' : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700'} transition-all duration-300 rounded-xl relative group overflow-hidden`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {n.icon}
                  </div>
                  <span className="font-medium">{n.label}</span>
                </div>
              </NavLink>
            ))}
          </nav>
          
          <div className="p-6 border-t border-gray-200/50">
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate">{user?.username}</div>
                  <div className="text-xs text-gray-500">Supplier</div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <button 
                onClick={()=> { logout(); navigate('/login'); }} 
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 rounded-xl py-3 text-sm font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 relative z-10" /> 
                <span className="relative z-10">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-6 md:hidden flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Supplier</span>
          </div>
          <div className="relative group">
            <button 
              onClick={()=> { logout(); navigate('/login'); }} 
              className="text-sm text-red-600 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-300"
            >
              <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12"/>
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="p-6 md:p-10 space-y-8 bg-gradient-to-br from-white to-gray-50/50">
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-600 mt-1 text-sm">{subtitle}</p>}
              </div>
              {actions && <div className="flex gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
