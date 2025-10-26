import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Target,
  PackageCheck,
  ClipboardList
} from 'lucide-react';
import { PromotionApi } from '../../utils/promotionApi';
import { ReferenceApi } from '../../utils/referenceApi';
import { StaffPoApi } from '../../utils/mockStaffPoApi';
import DeliveryTimelineWidget from '../../components/DeliveryTimelineWidget';

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  
  // Delivery timeline states
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [timelineUpdates, setTimelineUpdates] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({});
  const [overduePos, setOverduePos] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);

  useEffect(()=> {
    Promise.all([ReferenceApi.products().catch(()=>[]), PromotionApi.list().catch(()=>[])])
      .then(([prod, promos]) => { setProducts(prod); setPromotions(promos); })
      .finally(()=> setLoading(false));
  }, []);

  // Load delivery timeline data
  useEffect(() => {
    const loadDeliveryData = async () => {
      try {
        setDeliveryLoading(true);
        const [updates, stats, overdue, upcoming] = await Promise.all([
          StaffPoApi.getRecentTimelineUpdates(5),
          StaffPoApi.getDeliveryStatistics(),
          StaffPoApi.getOverduePos(),
          StaffPoApi.getUpcomingDeliveries(7)
        ]);
        
        setTimelineUpdates(updates);
        setDeliveryStats(stats);
        setOverduePos(overdue);
        setUpcomingDeliveries(upcoming);
      } catch (error) {
        console.error('Failed to load delivery timeline data:', error);
      } finally {
        setDeliveryLoading(false);
      }
    };

    loadDeliveryData();
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
    { label: 'Receive Goods', icon: <PackageCheck className="h-5 w-5" />, href: '/admin/receive-goods', color: 'green' },
    { label: 'View GRNs', icon: <ClipboardList className="h-5 w-5" />, href: '/admin/grn-list', color: 'indigo' },
    { label: 'View Reports', icon: <BarChart3 className="h-5 w-5" />, href: '/admin/reports', color: 'green' },
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
            <div className='text-gray-600 text-lg font-bold'>Loading your dashboard...</div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Hero Section - Compact */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-lg border-2 border-blue-700">
            <div className="relative z-10">
              <h1 className="text-2xl font-black mb-1">{greeting}, Admin!</h1>
              <p className="text-blue-100 mb-3 text-sm">Here's what's happening with your business today</p>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>System Online</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-300" />
                  <span>Updated: Just now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards - Compact */}
          <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'>
            {cards.map((c, index) => (
              <div key={c.label} 
                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              > 
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-md border-2 border-white`}>
                      {c.icon}
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 text-xs font-black ${c.trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {c.trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {typeof c.trend.value === 'string' && c.trend.value.includes('%') ? c.trend.value : c.trend.value}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className='text-xs font-black text-gray-600 mb-1'>{c.label}</div>
                    <div className='text-2xl font-black text-gray-900 mb-0.5'>
                      <AnimatedCounter value={c.value} />
                    </div>
                    <div className='text-xs text-gray-600'>{c.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Actions - Compact */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-lg">
                <h2 className='text-lg font-black text-gray-900 mb-4 flex items-center gap-2'>
                  <Target className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </h2>
                <div className='space-y-2'>
                  {quickActions.map((action, index) => (
                    <button key={action.label}
                      onClick={() => navigate(action.href)}
                      className={`w-full flex items-center gap-2 p-3 rounded-xl bg-white border-2 hover:shadow-md transition-all duration-200 group ${
                        action.color === 'blue' ? 'border-blue-200 hover:border-blue-400 text-blue-700' :
                        action.color === 'purple' ? 'border-purple-200 hover:border-purple-400 text-purple-700' :
                        action.color === 'green' ? 'border-green-200 hover:border-green-400 text-green-700' :
                        'border-indigo-200 hover:border-indigo-400 text-indigo-700'
                      }`}
                    >
                      <div className="group-hover:scale-110 transition-transform duration-200">
                        {action.icon}
                      </div>
                      <span className='font-black text-sm'>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity - Compact */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-lg">
                <h2 className='text-lg font-black text-gray-900 mb-4 flex items-center gap-2'>
                  <Activity className="h-5 w-5 text-green-600" />
                  Recent Activity
                </h2>
                <div className='space-y-2'>
                  {recentActivity.map((activity, index) => (
                    <div key={index} 
                      className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-gray-200 hover:shadow-md transition-all duration-200 group'
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-green-600 text-white border-2 border-green-700' :
                        activity.status === 'warning' ? 'bg-amber-600 text-white border-2 border-amber-700' :
                        'bg-gray-600 text-white border-2 border-gray-700'
                      }`}>
                        {activity.status === 'success' ? <CheckCircle className="h-4 w-4" /> :
                         activity.status === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                         activity.type === 'product' ? <Package className="h-4 w-4" /> :
                         activity.type === 'promotion' ? <Percent className="h-4 w-4" /> :
                         <ShoppingCart className="h-4 w-4" />}
                      </div>
                      <div className='flex-1'>
                        <div className='font-black text-gray-900 text-sm'>{activity.action}</div>
                        <div className='text-xs text-blue-600 font-bold'>{activity.item}</div>
                      </div>
                      <div className='text-xs text-gray-600 bg-white px-2 py-1 rounded-lg font-bold border border-gray-200'>
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section - Compact */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sales Trend Chart */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-lg">
              <h2 className='text-lg font-black text-gray-900 mb-4 flex items-center gap-2'>
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Sales Trend (Last 6 Months)
              </h2>
              <div className="space-y-3">
                {salesData.map((data, index) => (
                  <div key={data.month} className="flex items-center gap-3">
                    <div className="w-10 text-xs font-black text-gray-600">{data.month}</div>
                    <div className="flex-1 bg-gray-200 rounded-lg h-5 relative overflow-hidden border-2 border-gray-300">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg transition-all duration-1000"
                        style={{ 
                          width: `${data.sales}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      >
                      </div>
                    </div>
                    <div className="w-12 text-xs font-black text-gray-700">{data.sales}k</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-lg">
              <h2 className='text-lg font-black text-gray-900 mb-4 flex items-center gap-2'>
                <Package className="h-5 w-5 text-green-600" />
                Product Categories
              </h2>
              <div className="space-y-2">
                {categoryData.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm font-black text-gray-700">{category.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-black text-gray-900">
                        <AnimatedCounter value={category.count} />
                      </div>
                      <div className="text-xs text-gray-500">items</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Promotions */}
          {activePromos.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className='text-lg font-black text-gray-900 flex items-center gap-2'>
                  <Star className="h-5 w-5 text-yellow-500" />
                  Active Promotions
                </h2>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-black border-2 border-green-200">
                  {activePromos.length} running
                </span>
              </div>
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {activePromos.slice(0,6).map((p, index) => (
                  <div key={p.id} 
                    className='bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm'
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='font-black text-gray-900 text-sm'>{p.name}</h3>
                      <span className='text-xs px-2 py-1 rounded-lg bg-green-500 text-white font-black border-2 border-green-600'>
                        {p.discountPercent}% OFF
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className='text-xs text-gray-600 flex items-center gap-1'>
                        <Target className="h-3 w-3 text-blue-500" />
                        Scope: <span className="font-black text-blue-600">{p.scope.toLowerCase()}</span>
                      </p>
                      <p className='text-xs text-gray-600 flex items-center gap-1'>
                        <Calendar className="h-3 w-3 text-amber-500" />
                        Ends: <span className="font-black text-amber-600">{new Date(p.endDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Timeline Updates Section */}
          <DeliveryTimelineWidget
            timelineUpdates={timelineUpdates}
            deliveryStats={deliveryStats}
            overduePos={overduePos}
            upcomingDeliveries={upcomingDeliveries}
            loading={deliveryLoading}
          />
        </div>
      )}
    </AdminLayout>
  );
}
