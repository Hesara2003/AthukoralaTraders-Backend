import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import returnExchangeApi from '../../services/returnExchangeApi';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowLeft,
  Calendar,
  User,
  Mail,
  FileText,
  DollarSign,
  Box,
  Truck,
  ClipboardCheck
} from 'lucide-react';

const ProcessReturnExchange = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [returnExchanges, setReturnExchanges] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'ALL',
    type: 'ALL',
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
  });

  // Available status options
  const statusOptions = [
    { value: 'PENDING', label: 'Pending', icon: Clock, color: 'yellow' },
    { value: 'APPROVED', label: 'Approved', icon: CheckCircle, color: 'blue' },
    { value: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'red' },
    { value: 'IN_TRANSIT', label: 'In Transit', icon: Truck, color: 'purple' },
    { value: 'RECEIVED', label: 'Received', icon: Box, color: 'indigo' },
    { value: 'INSPECTING', label: 'Inspecting', icon: ClipboardCheck, color: 'orange' },
    { value: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'green' },
    { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, color: 'gray' }
  ];

  useEffect(() => {
    fetchReturnExchanges();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [returnExchanges, filters]);

  const fetchReturnExchanges = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await returnExchangeApi.getAllReturnExchanges();
      if (response.success) {
        setReturnExchanges(response.returns || []);
      } else {
        setError('Failed to fetch return/exchange requests');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch return/exchange requests');
      if (err.message.includes('Authentication')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...returnExchanges];

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(ret => ret.status === filters.status);
    }

    // Type filter
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(ret => ret.type === filters.type);
    }

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(ret =>
        ret.id?.toLowerCase().includes(term) ||
        ret.orderId?.toLowerCase().includes(term) ||
        ret.customerId?.toLowerCase().includes(term) ||
        ret.customerEmail?.toLowerCase().includes(term)
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(ret =>
        new Date(ret.requestedAt) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(ret =>
        new Date(ret.requestedAt) <= new Date(filters.dateTo)
      );
    }

    // Sort by requested date (most recent first)
    filtered.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

    setFilteredReturns(filtered);
  };

  const calculateStats = () => {
    const newStats = {
      total: returnExchanges.length,
      pending: returnExchanges.filter(r => r.status === 'PENDING').length,
      approved: returnExchanges.filter(r => r.status === 'APPROVED').length,
      completed: returnExchanges.filter(r => r.status === 'COMPLETED').length,
      rejected: returnExchanges.filter(r => r.status === 'REJECTED').length
    };
    setStats(newStats);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    setFilters({
      status: 'ALL',
      type: 'ALL',
      searchTerm: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const viewDetails = async (returnId) => {
    try {
      const response = await returnExchangeApi.getReturnExchangeById(returnId);
      if (response.success) {
        setSelectedReturn(response.returnExchange);
        setShowDetailModal(true);
      } else {
        setError('Failed to load return/exchange details');
      }
    } catch (err) {
      setError(err.message || 'Failed to load return/exchange details');
    }
  };

  const handleProcessReturn = async (returnId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await returnExchangeApi.processReturnExchange(returnId, newStatus);
      if (response.success) {
        setSuccess(`Return/Exchange ${newStatus.toLowerCase()} successfully`);
        setShowDetailModal(false);
        fetchReturnExchanges();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to process return/exchange');
      }
    } catch (err) {
      setError(err.message || 'Failed to process return/exchange');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = statusOptions.find(s => s.value === status) || statusOptions[0];
    const Icon = statusInfo.icon;
    
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[statusInfo.color]}`}>
        <Icon className="w-4 h-4 mr-1" />
        {statusInfo.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
        type === 'RETURN' ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'
      }`}>
        {type}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Process Return/Exchange</h1>
                <p className="text-gray-600 mt-1">Manage and process return/exchange requests</p>
              </div>
            </div>
            <button
              onClick={fetchReturnExchanges}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="RETURN">Return</option>
                <option value="EXCHANGE">Exchange</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ID, Order ID, Customer..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Return/Exchange List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Return/Exchange Requests ({filteredReturns.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No return/exchange requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Refund Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReturns.map((returnItem) => (
                    <tr key={returnItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {returnItem.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getTypeBadge(returnItem.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {returnItem.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {returnItem.customerEmail || returnItem.customerId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(returnItem.requestedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(returnItem.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(returnItem.refundAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewDetails(returnItem.id)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">Return/Exchange Details</h3>
                    <p className="text-blue-100 mt-1">ID: {selectedReturn.id}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <div className="mt-1">
                        {getTypeBadge(selectedReturn.type)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedReturn.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order ID</label>
                      <p className="mt-1 text-gray-900 font-medium">{selectedReturn.orderId}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Customer ID</label>
                      <p className="mt-1 text-gray-900">{selectedReturn.customerId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Customer Email</label>
                      <p className="mt-1 text-gray-900">{selectedReturn.customerEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Refund Amount</label>
                      <p className="mt-1 text-gray-900 font-bold text-lg">
                        {formatCurrency(selectedReturn.refundAmount || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason</label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedReturn.reason || 'No reason provided'}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Items</label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedReturn.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.productId}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-500">Requested At</label>
                    <p className="mt-1 text-gray-900">{formatDate(selectedReturn.requestedAt)}</p>
                  </div>
                  {selectedReturn.processedAt && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">Processed At</label>
                      <p className="mt-1 text-gray-900">{formatDate(selectedReturn.processedAt)}</p>
                    </div>
                  )}
                  {selectedReturn.completedAt && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">Completed At</label>
                      <p className="mt-1 text-gray-900">{formatDate(selectedReturn.completedAt)}</p>
                    </div>
                  )}
                  {selectedReturn.processedBy && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-sm font-medium text-gray-500">Processed By</label>
                      <p className="mt-1 text-gray-900">{selectedReturn.processedBy}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Update Status</label>
                  <div className="grid grid-cols-4 gap-2">
                    {statusOptions
                      .filter(s => s.value !== selectedReturn.status)
                      .map(status => {
                        const Icon = status.icon;
                        return (
                          <button
                            key={status.value}
                            onClick={() => handleProcessReturn(selectedReturn.id, status.value)}
                            disabled={processing}
                            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50
                              ${status.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                status.color === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                status.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                status.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                                status.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                                status.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                                status.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' :
                                'bg-gray-600 hover:bg-gray-700 text-white'
                              }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{status.label}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProcessReturnExchange;
