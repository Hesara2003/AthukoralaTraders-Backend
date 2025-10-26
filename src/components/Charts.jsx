import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Simple Bar Chart Component
export const BarChart = ({ data, title, xKey, yKey, color = 'blue' }) => {
  if (!data || data.length === 0) return <div>No data available</div>;

  const maxValue = Math.max(...data.map(item => item[yKey]));
  
  const colorClasses = {
    blue: { bar: 'bg-blue-500', light: 'bg-blue-100' },
    green: { bar: 'bg-green-500', light: 'bg-green-100' },
    purple: { bar: 'bg-purple-500', light: 'bg-purple-100' },
    red: { bar: 'bg-red-500', light: 'bg-red-100' },
    yellow: { bar: 'bg-yellow-500', light: 'bg-yellow-100' }
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-gray-600 truncate">
              {item[xKey]}
            </div>
            <div className="flex-1 relative">
              <div className={`h-8 ${colorClasses[color].light} rounded-full relative overflow-hidden`}>
                <div 
                  className={`h-full ${colorClasses[color].bar} rounded-full transition-all duration-1000 relative`}
                  style={{ 
                    width: `${(item[yKey] / maxValue) * 100}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="absolute right-2 top-1 text-xs font-bold text-gray-700">
                {typeof item[yKey] === 'number' ? item[yKey].toLocaleString() : item[yKey]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Line Chart Component (using CSS for visualization)
export const LineChart = ({ data, title, xKey, yKey, color = 'blue' }) => {
  if (!data || data.length === 0) return <div>No data available</div>;

  const maxValue = Math.max(...data.map(item => item[yKey]));
  const minValue = Math.min(...data.map(item => item[yKey]));
  const range = maxValue - minValue;

  const colorClasses = {
    blue: 'text-blue-500 border-blue-500',
    green: 'text-green-500 border-green-500',
    purple: 'text-purple-500 border-purple-500',
    red: 'text-red-500 border-red-500',
    yellow: 'text-yellow-500 border-yellow-500'
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <div className="flex h-full items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = range > 0 ? ((item[yKey] - minValue) / range) * 100 : 50;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-full max-w-8 bg-gradient-to-t from-${color}-500 to-${color}-300 rounded-t transition-all duration-1000 relative group`}
                  style={{ 
                    height: `${height}%`,
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item[yKey]}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 truncate max-w-12">
                  {item[xKey]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
export const MetricCard = ({ title, value, subtitle, icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-600 bg-gradient-to-r from-blue-50 to-cyan-50',
    green: 'from-green-500 to-emerald-600 bg-gradient-to-r from-green-50 to-emerald-50',
    purple: 'from-purple-500 to-pink-600 bg-gradient-to-r from-purple-50 to-pink-50',
    red: 'from-red-500 to-rose-600 bg-gradient-to-r from-red-50 to-rose-50',
    yellow: 'from-amber-500 to-orange-600 bg-gradient-to-r from-amber-50 to-orange-50',
  };

  return (
    <div className={`p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${colorClasses[color].split('bg-gradient-to-r')[1]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClasses[color].split('bg-gradient-to-r')[0]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {trend.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  );
};

// Simple Donut Chart Component
export const DonutChart = ({ data, title, centerText }) => {
  if (!data || data.length === 0) return <div>No data available</div>;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    return {
      ...item,
      percentage,
      angle,
      startAngle,
      color: colors[index % colors.length]
    };
  });

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <div className="flex items-center gap-6">
        {/* Chart */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
            <circle 
              cx="21" cy="21" r="15.5" 
              fill="transparent" 
              stroke="#e5e7eb" 
              strokeWidth="3"
            />
            {segments.map((segment, index) => {
              const circumference = 2 * Math.PI * 15.5;
              const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((segment.startAngle / 360) * circumference);
              
              return (
                <circle
                  key={index}
                  cx="21" cy="21" r="15.5"
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                  style={{ animationDelay: `${index * 200}ms` }}
                />
              );
            })}
          </svg>
          {centerText && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{centerText.value}</div>
                <div className="text-xs text-gray-500">{centerText.label}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">{segment.label}</span>
                <span className="text-gray-500 ml-2">({segment.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
export const ChartSkeleton = ({ type = 'bar' }) => {
  if (type === 'metric') {
    return (
      <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-gray-300"></div>
          <div className="h-4 w-12 bg-gray-300 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          <div className="h-6 w-16 bg-gray-300 rounded"></div>
          <div className="h-3 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-gray-50 rounded-lg animate-pulse">
      <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-20 h-4 bg-gray-300 rounded"></div>
            <div className="flex-1 h-8 bg-gray-300 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
