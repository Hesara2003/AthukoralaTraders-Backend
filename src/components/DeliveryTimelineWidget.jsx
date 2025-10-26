import React from 'react';
import { 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Package,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

// Simple date formatting function
const formatDate = (dateStr, options = {}) => {
  const date = new Date(dateStr);
  if (options.format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (options.format === 'relative') {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  }
  return date.toLocaleDateString();
};

export default function DeliveryTimelineWidget({ 
  timelineUpdates = [], 
  deliveryStats = {}, 
  overduePos = [],
  upcomingDeliveries = [],
  loading = false 
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
          <h2 className="text-lg font-black text-gray-900">Delivery Timeline Updates</h2>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status, isDelay) => {
    switch (status) {
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'DELAYED':
        return <TrendingDown className="h-4 w-4 text-amber-600" />;
      case 'ADVANCED':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Delivery Statistics Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Active POs */}
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-blue-600">Active POs</p>
              <p className="text-xl font-black text-blue-900">{deliveryStats.totalPos || 0}</p>
            </div>
            <Package className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Overdue Count */}
        <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-red-600">Overdue</p>
              <p className="text-xl font-black text-red-900">{deliveryStats.overduePos || 0}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>

        {/* Timeline Updates */}
        <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-amber-600">Updated</p>
              <p className="text-xl font-black text-amber-900">{deliveryStats.updatedPos || 0}</p>
            </div>
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
        </div>

        {/* On Time */}
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-green-600">On Time</p>
              <p className="text-xl font-black text-green-900">{deliveryStats.onTimePos || 0}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Timeline Updates */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Timeline Updates
            </h2>
            {timelineUpdates.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-black border-2 border-blue-200">
                {timelineUpdates.length} updates
              </span>
            )}
          </div>

          <div className="space-y-2">
            {timelineUpdates.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent timeline updates</p>
              </div>
            ) : (
              timelineUpdates.slice(0, 5).map((update, index) => (
                <div
                  key={update.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white border-2 border-gray-200"
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    update.status === 'OVERDUE' ? 'bg-red-100 border-2 border-red-200' :
                    update.status === 'DELAYED' ? 'bg-amber-100 border-2 border-amber-200' :
                    update.status === 'ADVANCED' ? 'bg-green-100 border-2 border-green-200' :
                    'bg-blue-100 border-2 border-blue-200'
                  }`}>
                    {getStatusIcon(update.status, update.isDelay)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-black text-gray-900">
                          {update.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{update.message}</p>
                        
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-gray-500">
                            Original: {formatDate(update.originalDate, { format: 'short' })}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className={`font-black ${
                            update.isDelay ? 'text-red-600' : 'text-green-600'
                          }`}>
                            New: {formatDate(update.newDate, { format: 'short' })}
                          </span>
                        </div>
                        
                        {update.reason && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{update.reason}"
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-1 rounded-lg border-2 font-black ${getPriorityColor(update.priority)}`}>
                          {update.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(update.timestamp, { format: 'relative' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {timelineUpdates.length > 5 && (
            <div className="mt-3 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-xs font-black flex items-center gap-1 mx-auto">
                View all updates
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Deliveries */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Upcoming Deliveries
            </h2>
            {upcomingDeliveries.length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-black border-2 border-green-200">
                Next 7 days
              </span>
            )}
          </div>

          <div className="space-y-2">
            {upcomingDeliveries.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No upcoming deliveries</p>
              </div>
            ) : (
              upcomingDeliveries.slice(0, 4).map((po, index) => (
                <div
                  key={po.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50 border-2 border-green-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-black text-gray-900">{po.id}</p>
                    <p className="text-xs text-gray-600">{po.supplierName}</p>
                    <p className="text-xs text-gray-500">
                      ${po.totalValue?.toLocaleString()} • {po.items?.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-green-700">
                      {formatDate(po.expectedDeliveryDate, { format: 'short' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(po.expectedDeliveryDate, { format: 'relative' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {upcomingDeliveries.length > 4 && (
            <div className="mt-3 text-center">
              <button className="text-green-600 hover:text-green-700 text-xs font-black flex items-center gap-1 mx-auto">
                View full schedule
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overdue POs Alert */}
      {overduePos.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 border-2 border-red-200">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-black text-red-800">
                {overduePos.length} Purchase Order{overduePos.length !== 1 ? 's' : ''} Overdue
              </h3>
              <p className="text-xs text-red-700 mt-1">
                Requires immediate attention from suppliers
              </p>
            </div>
            <div className="ml-auto">
              <button className="bg-red-100 hover:bg-red-200 text-red-800 text-xs px-3 py-1 rounded-lg font-black border-2 border-red-300 transition-colors">
                Review Overdue POs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}