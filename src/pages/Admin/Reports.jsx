import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Activity,
  Clock,
  Target
} from 'lucide-react';
import { ReportsApi } from '../../utils/reportsApi';
import { BarChart, LineChart, MetricCard, DonutChart, ChartSkeleton } from '../../components/Charts';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exporting, setExporting] = useState(false);

  // Load initial data
  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let salesReport;
      
      // Fetch sales data based on selected period
      switch (selectedPeriod) {
        case 'weekly':
          salesReport = await ReportsApi.getWeeklySalesReport();
          break;
        case 'monthly':
          salesReport = await ReportsApi.getMonthlySalesReport();
          break;
        case 'yearly':
          salesReport = await ReportsApi.getYearlySalesReport();
          break;
        case 'custom':
          if (customDateRange.startDate && customDateRange.endDate) {
            salesReport = await ReportsApi.getSalesReport(customDateRange.startDate, customDateRange.endDate);
          } else {
            salesReport = await ReportsApi.getMonthlySalesReport();
          }
          break;
        default:
          salesReport = await ReportsApi.getMonthlySalesReport();
      }
      
      // Fetch inventory data
      const inventoryReport = await ReportsApi.getInventoryReport();
      
      setSalesData(salesReport);
      setInventoryData(inventoryReport);
      
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setSelectedPeriod('custom');
      loadReports();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case 'weekly': return 'Last 7 Days';
      case 'monthly': return 'Last 30 Days';
      case 'yearly': return 'This Year';
      case 'custom': return 'Custom Range';
      default: return 'Last 30 Days';
    }
  };

  // Export helper function to trigger file download
  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sales Report Export Functions
  const exportSalesReportToCsv = async () => {
    setExporting(true);
    try {
      let csvContent;
      let filename;
      
      switch (selectedPeriod) {
        case 'weekly':
          csvContent = await ReportsApi.exportWeeklySalesReportToCsv();
          filename = 'weekly-sales-report.csv';
          break;
        case 'monthly':
          csvContent = await ReportsApi.exportMonthlySalesReportToCsv();
          filename = 'monthly-sales-report.csv';
          break;
        case 'yearly':
          csvContent = await ReportsApi.exportYearlySalesReportToCsv();
          filename = 'yearly-sales-report.csv';
          break;
        case 'custom':
          if (customDateRange.startDate && customDateRange.endDate) {
            csvContent = await ReportsApi.exportSalesReportToCsv(customDateRange.startDate, customDateRange.endDate);
            filename = `sales-report-${customDateRange.startDate}-to-${customDateRange.endDate}.csv`;
          } else {
            csvContent = await ReportsApi.exportMonthlySalesReportToCsv();
            filename = 'monthly-sales-report.csv';
          }
          break;
        default:
          csvContent = await ReportsApi.exportMonthlySalesReportToCsv();
          filename = 'monthly-sales-report.csv';
      }
      
      downloadFile(csvContent, filename, 'text/csv');
    } catch (err) {
      console.error('Error exporting sales report to CSV:', err);
      alert('Failed to export sales report to CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportSalesReportToPdf = async () => {
    setExporting(true);
    try {
      let pdfBlob;
      let filename;
      
      switch (selectedPeriod) {
        case 'weekly':
          pdfBlob = await ReportsApi.exportWeeklySalesReportToPdf();
          filename = 'weekly-sales-report.pdf';
          break;
        case 'monthly':
          pdfBlob = await ReportsApi.exportMonthlySalesReportToPdf();
          filename = 'monthly-sales-report.pdf';
          break;
        case 'yearly':
          pdfBlob = await ReportsApi.exportYearlySalesReportToPdf();
          filename = 'yearly-sales-report.pdf';
          break;
        case 'custom':
          if (customDateRange.startDate && customDateRange.endDate) {
            pdfBlob = await ReportsApi.exportSalesReportToPdf(customDateRange.startDate, customDateRange.endDate);
            filename = `sales-report-${customDateRange.startDate}-to-${customDateRange.endDate}.pdf`;
          } else {
            pdfBlob = await ReportsApi.exportMonthlySalesReportToPdf();
            filename = 'monthly-sales-report.pdf';
          }
          break;
        default:
          pdfBlob = await ReportsApi.exportMonthlySalesReportToPdf();
          filename = 'monthly-sales-report.pdf';
      }
      
      downloadFile(pdfBlob, filename, 'application/pdf');
    } catch (err) {
      console.error('Error exporting sales report to PDF:', err);
      alert('Failed to export sales report to PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Inventory Report Export Functions
  const exportInventoryReportToCsv = async () => {
    setExporting(true);
    try {
      const csvContent = await ReportsApi.exportInventoryReportToCsv();
      downloadFile(csvContent, 'inventory-report.csv', 'text/csv');
    } catch (err) {
      console.error('Error exporting inventory report to CSV:', err);
      alert('Failed to export inventory report to CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportInventoryReportToPdf = async () => {
    setExporting(true);
    try {
      const pdfBlob = await ReportsApi.exportInventoryReportToPdf();
      downloadFile(pdfBlob, 'inventory-report.pdf', 'application/pdf');
    } catch (err) {
      console.error('Error exporting inventory report to PDF:', err);
      alert('Failed to export inventory report to PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reports</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadReports}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/5 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
                <p className="text-purple-100 mb-4">Comprehensive business insights for {getPeriodTitle()}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span>Data Updated: {loading ? 'Loading...' : 'Just now'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-300" />
                    <span>Period: {getPeriodTitle()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={loadReports}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Report Period
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'weekly', label: 'Last 7 Days' },
                  { key: 'monthly', label: 'Last 30 Days' },
                  { key: 'yearly', label: 'This Year' },
                  { key: 'custom', label: 'Custom Range' }
                ].map(period => (
                  <button
                    key={period.key}
                    onClick={() => handlePeriodChange(period.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedPeriod === period.key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            {selectedPeriod === 'custom' && (
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCustomDateSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Export Buttons Section */}
        {!loading && (salesData || inventoryData) && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  Export Reports
                </h2>
                <p className="text-gray-600 text-sm">Download your reports in CSV or PDF format</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Sales Report Export */}
                {salesData && (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">Sales Report ({getPeriodTitle()})</div>
                    <div className="flex gap-2">
                      <button
                        onClick={exportSalesReportToCsv}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        {exporting ? 'Exporting...' : 'CSV'}
                      </button>
                      <button
                        onClick={exportSalesReportToPdf}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileText className="h-4 w-4" />
                        {exporting ? 'Exporting...' : 'PDF'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Inventory Report Export */}
                {inventoryData && (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">Inventory Report</div>
                    <div className="flex gap-2">
                      <button
                        onClick={exportInventoryReportToCsv}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        {exporting ? 'Exporting...' : 'CSV'}
                      </button>
                      <button
                        onClick={exportInventoryReportToPdf}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileText className="h-4 w-4" />
                        {exporting ? 'Exporting...' : 'PDF'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <ChartSkeleton key={i} type="metric" />
            ))}
          </div>
        ) : (
          <>
            {/* Sales Metrics */}
            {salesData && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Total Revenue"
                  value={formatCurrency(salesData.totalRevenue || 0)}
                  subtitle="Sales revenue"
                  icon={<DollarSign className="h-6 w-6" />}
                  color="green"
                  trend={{ value: '+12%', isPositive: true }}
                />
                <MetricCard
                  title="Total Orders"
                  value={salesData.totalOrders || 0}
                  subtitle="Completed orders"
                  icon={<ShoppingCart className="h-6 w-6" />}
                  color="blue"
                  trend={{ value: '+8%', isPositive: true }}
                />
                <MetricCard
                  title="Products Sold"
                  value={salesData.totalProducts || 0}
                  subtitle="Units sold"
                  icon={<Package className="h-6 w-6" />}
                  color="purple"
                  trend={{ value: '+15%', isPositive: true }}
                />
                <MetricCard
                  title="Average Order"
                  value={formatCurrency((salesData.totalRevenue || 0) / (salesData.totalOrders || 1))}
                  subtitle="Per order value"
                  icon={<TrendingUp className="h-6 w-6" />}
                  color="yellow"
                  trend={{ value: '+5%', isPositive: true }}
                />
              </div>
            )}

            {/* Inventory Metrics */}
            {inventoryData && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Total Products"
                  value={inventoryData.totalProducts || 0}
                  subtitle="In inventory"
                  icon={<Package className="h-6 w-6" />}
                  color="blue"
                />
                <MetricCard
                  title="Stock Value"
                  value={formatCurrency(inventoryData.totalStockValue || 0)}
                  subtitle="Total inventory value"
                  icon={<DollarSign className="h-6 w-6" />}
                  color="green"
                />
                <MetricCard
                  title="Low Stock Items"
                  value={inventoryData.lowStockCount || 0}
                  subtitle="Need restocking"
                  icon={<AlertTriangle className="h-6 w-6" />}
                  color="yellow"
                  trend={{ value: `${inventoryData.lowStockCount || 0} items`, isPositive: false }}
                />
                <MetricCard
                  title="Out of Stock"
                  value={inventoryData.outOfStockCount || 0}
                  subtitle="Currently unavailable"
                  icon={<AlertTriangle className="h-6 w-6" />}
                  color="red"
                  trend={{ value: `${inventoryData.outOfStockCount || 0} items`, isPositive: false }}
                />
              </div>
            )}

            {/* Charts Section */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Daily Sales Chart */}
              {salesData?.dailySales && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Daily Sales Trend
                  </h2>
                  <LineChart
                    data={salesData.dailySales.map(item => ({
                      date: formatDate(item.date),
                      sales: item.totalSales || item.revenue || 0
                    }))}
                    xKey="date"
                    yKey="sales"
                    color="blue"
                  />
                </div>
              )}

              {/* Top Selling Products */}
              {salesData?.topSellingProducts && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="h-6 w-6 text-green-600" />
                    Top Selling Products
                  </h2>
                  <BarChart
                    data={salesData.topSellingProducts.slice(0, 10)}
                    xKey="productName"
                    yKey="quantitySold"
                    color="green"
                  />
                </div>
              )}
            </div>

            {/* Inventory Details */}
            {inventoryData?.inventoryItems && (
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Stock Status Distribution */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                  <DonutChart
                    title="Stock Status"
                    data={[
                      { 
                        label: 'In Stock', 
                        value: (inventoryData.totalProducts || 0) - (inventoryData.lowStockCount || 0) - (inventoryData.outOfStockCount || 0)
                      },
                      { label: 'Low Stock', value: inventoryData.lowStockCount || 0 },
                      { label: 'Out of Stock', value: inventoryData.outOfStockCount || 0 }
                    ]}
                    centerText={{
                      value: inventoryData.totalProducts || 0,
                      label: 'Total Items'
                    }}
                  />
                </div>

                {/* Low Stock Items */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    Low Stock Alerts
                  </h2>
                  {inventoryData.lowStockItems && inventoryData.lowStockItems.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {inventoryData.lowStockItems.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.productName || item.name}</h4>
                            <p className="text-sm text-gray-600">SKU: {item.sku || item.id}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-600">{item.currentStock || item.quantity}</div>
                            <div className="text-xs text-gray-500">units left</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No low stock items at this time</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
