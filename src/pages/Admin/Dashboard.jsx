import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
  Package, 
  Percent, 
  Activity, 
  Calendar, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Star,
  ShoppingCart,
  Target
} from 'lucide-react';
import { PromotionApi } from '../../utils/promotionApi';
import { ReferenceApi } from '../../utils/referenceApi';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return <span>{count}</span>;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);

  useEffect(()=> {
    Promise.all([ReferenceApi.products().catch(()=>[]), PromotionApi.list().catch(()=>[])])
      .then(([prod, promos]) => { setProducts(prod); setPromotions(promos); })
      .finally(()=> setLoading(false));
  }, []);

  const now = new Date();
  const activePromos = promotions.filter(p => p.active && p.startDate && p.endDate && now >= new Date(p.startDate) && now <= new Date(p.endDate));
  const upcomingPromos = promotions.filter(p => p.active && p.startDate && new Date(p.startDate) > now);
  const expiredPromos = promotions.filter(p => p.endDate && new Date(p.endDate) < now);

  // Get current hour for personalized greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const cards = [
    { 
      label: 'Total Products', 
      value: products.length, 
      icon: <Package className='h-6 w-6' />, 
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      trend: { value: '+12%', isPositive: true },
      description: 'Active inventory items'
    },
    { 
      label: 'All Promotions', 
      value: promotions.length, 
      icon: <Percent className='h-6 w-6' />, 
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      trend: { value: '+8%', isPositive: true },
      description: 'Marketing campaigns'
    },
    { 
      label: 'Active Promotions', 
      value: activePromos.length, 
      icon: <Activity className='h-6 w-6' />, 
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      trend: { value: activePromos.length > 3 ? '+5%' : '-2%', isPositive: activePromos.length > 3 },
      description: 'Currently running'
    },
    { 
      label: 'Upcoming Deals', 
      value: upcomingPromos.length, 
      icon: <Calendar className='h-6 w-6' />, 
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      trend: { value: `${upcomingPromos.length} scheduled`, isPositive: upcomingPromos.length > 0 },
      description: 'Scheduled promotions'
    },
  ];

  const quickActions = [
    { label: 'Add Product', icon: <Plus className="h-5 w-5" />, href: '/admin/products/new', color: 'blue' },
    { label: 'Create Promotion', icon: <Percent className="h-5 w-5" />, href: '/admin/promotions/new', color: 'purple' },
    { label: 'View Analytics', icon: <BarChart3 className="h-5 w-5" />, href: '/admin/analytics', color: 'green' },
    { label: 'Manage Users', icon: <Users className="h-5 w-5" />, href: '/admin/users', color: 'indigo' },
  ];

  const recentActivity = [
    { action: 'New product added', item: 'Premium Coffee Beans', time: '2 hours ago', type: 'product', status: 'success' },
    { action: 'Promotion activated', item: 'Summer Sale 2024', time: '4 hours ago', type: 'promotion', status: 'success' },
    { action: 'Low stock alert', item: 'Organic Tea Leaves', time: '6 hours ago', type: 'alert', status: 'warning' },
    { action: 'Order processed', item: 'Bulk Order #1234', time: '1 day ago', type: 'order', status: 'success' },
  ];

  // Mock analytics data for visualization
  const salesData = [
    { month: 'Jan', sales: 65, orders: 24 },
    { month: 'Feb', sales: 78, orders: 31 },
    { month: 'Mar', sales: 90, orders: 38 },
    { month: 'Apr', sales: 81, orders: 35 },
    { month: 'May', sales: 95, orders: 42 },
    { month: 'Jun', sales: 88, orders: 37 }
  ];

  const categoryData = [
    { category: 'Coffee', count: Math.floor(products.length * 0.4), color: 'bg-blue-500' },
    { category: 'Tea', count: Math.floor(products.length * 0.3), color: 'bg-green-500' },
    { category: 'Snacks', count: Math.floor(products.length * 0.2), color: 'bg-yellow-500' },
    { category: 'Others', count: Math.floor(products.length * 0.1), color: 'bg-purple-500' }
  ];

  return (
    <AdminLayout>
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <div className='text-gray-600 text-lg'>Loading your dashboard...</div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Welcome Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/5 blur-2xl"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">{greeting}, Admin!</h1>
              <p className="text-blue-100 mb-4">Here's what's happening with your business today</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>System Status: Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-300" />
                  <span>Last updated: Just now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'>
            {cards.map((c, index) => (
              <div key={c.label} 
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bgGradient} border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105`}
                style={{ animationDelay: `${index * 100}ms` }}
              > 
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/20 blur-xl group-hover:bg-white/30 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      {c.icon}
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 text-sm font-medium ${c.trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {c.trend.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {typeof c.trend.value === 'string' && c.trend.value.includes('%') ? c.trend.value : c.trend.value}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-medium text-gray-600 mb-1'>{c.label}</div>
                    <div className='text-3xl font-bold text-gray-900 mb-1'>
                      <AnimatedCounter value={c.value} />
                    </div>
                    <div className='text-xs text-gray-500'>{c.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
                  <Target className="h-6 w-6 text-blue-600" />
                  Quick Actions
                </h2>
                <div className='space-y-3'>
                  {quickActions.map((action, index) => (
                    <button key={action.label}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r hover:shadow-lg transition-all duration-300 hover:scale-105 group ${
                        action.color === 'blue' ? 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700' :
                        action.color === 'purple' ? 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700' :
                        action.color === 'green' ? 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700' :
                        'from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                        {action.icon}
                      </div>
                      <span className='font-medium'>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
                  <Activity className="h-6 w-6 text-green-600" />
                  Recent Activity
                </h2>
                <div className='space-y-4'>
                  {recentActivity.map((activity, index) => (
                    <div key={index} 
                      className='flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 group'
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-green-100 text-green-600' :
                        activity.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-gray-100 text-gray-600'
                      } group-hover:scale-110 transition-transform duration-300`}>
                        {activity.status === 'success' ? <CheckCircle className="h-5 w-5" /> :
                         activity.status === 'warning' ? <AlertCircle className="h-5 w-5" /> :
                         activity.type === 'product' ? <Package className="h-5 w-5" /> :
                         activity.type === 'promotion' ? <Percent className="h-5 w-5" /> :
                         <ShoppingCart className="h-5 w-5" />}
                      </div>
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900'>{activity.action}</div>
                        <div className='text-sm text-blue-600 font-medium'>{activity.item}</div>
                      </div>
                      <div className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Sales Trend Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
              <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Sales Trend (Last 6 Months)
              </h2>
              <div className="space-y-4">
                {salesData.map((data, index) => (
                  <div key={data.month} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 relative"
                        style={{ 
                          width: `${data.sales}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm font-bold text-gray-700">{data.sales}k</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
              <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
                <Package className="h-6 w-6 text-green-600" />
                Product Categories
              </h2>
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${category.color} group-hover:scale-125 transition-transform duration-300`}></div>
                      <span className="font-medium text-gray-700">{category.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-900">
                        <AnimatedCounter value={category.count} />
                      </div>
                      <div className="text-sm text-gray-500">items</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Promotions */}
          {activePromos.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                  <Star className="h-6 w-6 text-yellow-500" />
                  Active Promotions
                </h2>
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  {activePromos.length} running
                </span>
              </div>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {activePromos.slice(0,6).map((p, index) => (
                  <div key={p.id} 
                    className='group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden'
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-xl group-hover:from-green-400/30 group-hover:to-emerald-500/30 transition-all duration-500"></div>
                    <div className="relative z-10">
                      <div className='flex justify-between items-start mb-3'>
                        <h3 className='font-bold text-gray-900 text-lg'>{p.name}</h3>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-md'>
                            {p.discountPercent}% OFF
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className='text-sm text-gray-600 flex items-center gap-2'>
                          <Target className="h-4 w-4 text-blue-500" />
                          Scope: <span className="font-medium text-blue-600">{p.scope.toLowerCase()}</span>
                        </p>
                        <p className='text-sm text-gray-600 flex items-center gap-2'>
                          <Calendar className="h-4 w-4 text-amber-500" />
                          Ends: <span className="font-medium text-amber-600">{new Date(p.endDate).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
