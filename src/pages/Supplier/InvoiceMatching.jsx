import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import SupplierLayout from '../../components/SupplierLayout';

const API_BASE = 'http://localhost:8080/api';

export default function InvoiceMatching() {
  const { user } = useAuth();
  const [unmatchedInvoices, setUnmatchedInvoices] = useState([]);
  const [unmatchedPOs, setUnmatchedPOs] = useState([]);
  const [matchedInvoices, setMatchedInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('unmatched'); // unmatched, matched, stats
  const [priceEntries, setPriceEntries] = useState({});
  const [mismatchedEntries, setMismatchedEntries] = useState([]);

  const supplierId = user?.id || 'supplier-demo';

  useEffect(() => {
    // Initialize mock data on first load
    initializeMockData();
    loadData();
    loadPriceDashboard();
  }, [supplierId]);

  const initializeMockData = () => {
    // Check if mock data already exists
    const existingData = localStorage.getItem('invoicePrices');
    if (!existingData) {
      // Create mock invoice price data
      const mockPriceData = {
        'inv-001': {
          invoiceNumber: 'INV-2025-001',
          supplierPrice: 15000.00,
          invoicePrice: 15000.00,
          lastUpdated: new Date('2025-11-15T10:30:00').toISOString(),
        },
        'inv-002': {
          invoiceNumber: 'INV-2025-002',
          supplierPrice: 25000.00,
          invoicePrice: 26500.00,
          lastUpdated: new Date('2025-11-16T14:20:00').toISOString(),
        },
        'inv-003': {
          invoiceNumber: 'INV-2025-003',
          supplierPrice: 8500.00,
          invoicePrice: 8500.00,
          lastUpdated: new Date('2025-11-17T09:15:00').toISOString(),
        },
        'inv-004': {
          invoiceNumber: 'INV-2025-004',
          supplierPrice: 42000.00,
          invoicePrice: 39800.00,
          lastUpdated: new Date('2025-11-18T11:45:00').toISOString(),
        },
        'inv-005': {
          invoiceNumber: 'INV-2025-005',
          supplierPrice: 12300.00,
          invoicePrice: 12300.00,
          lastUpdated: new Date('2025-11-18T16:30:00').toISOString(),
        },
        'inv-006': {
          invoiceNumber: 'INV-2025-006',
          supplierPrice: 18750.00,
          invoicePrice: 19200.00,
          lastUpdated: new Date('2025-11-19T08:00:00').toISOString(),
        },
        'inv-007': {
          invoiceNumber: 'INV-2025-007',
          supplierPrice: 31000.00,
          invoicePrice: 31000.00,
          lastUpdated: new Date('2025-11-19T10:20:00').toISOString(),
        },
        'inv-008': {
          invoiceNumber: 'INV-2025-008',
          supplierPrice: 9500.00,
          invoicePrice: 9200.00,
          lastUpdated: new Date('2025-11-19T12:00:00').toISOString(),
        },
      };
      
      localStorage.setItem('invoicePrices', JSON.stringify(mockPriceData));
      console.log('Mock invoice price data initialized');
    }
  };

  const loadData = async () => {
    try {
      const [unmatchedInvRes, unmatchedPORes, matchedRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/suppliers/${supplierId}/invoices/unmatched`).catch(() => ({ 
          data: [
            { id: 'inv-001', invoiceNumber: 'INV-2025-001', date: '2025-11-15', amount: 15000.00 },
            { id: 'inv-002', invoiceNumber: 'INV-2025-002', date: '2025-11-16', amount: 26500.00 },
            { id: 'inv-003', invoiceNumber: 'INV-2025-003', date: '2025-11-17', amount: 8500.00 },
            { id: 'inv-004', invoiceNumber: 'INV-2025-004', date: '2025-11-18', amount: 39800.00 },
            { id: 'inv-005', invoiceNumber: 'INV-2025-005', date: '2025-11-18', amount: 12300.00 },
            { id: 'inv-006', invoiceNumber: 'INV-2025-006', date: '2025-11-19', amount: 19200.00 },
            { id: 'inv-007', invoiceNumber: 'INV-2025-007', date: '2025-11-19', amount: 31000.00 },
            { id: 'inv-008', invoiceNumber: 'INV-2025-008', date: '2025-11-19', amount: 9200.00 },
          ] 
        })),
        axios.get(`${API_BASE}/suppliers/${supplierId}/purchase-orders/unmatched`).catch(() => ({ 
          data: [
            { id: 'po-101', amount: 15000.00 },
            { id: 'po-102', amount: 25000.00 },
            { id: 'po-103', amount: 8500.00 },
            { id: 'po-104', amount: 42000.00 },
            { id: 'po-105', amount: 12300.00 },
          ] 
        })),
        axios.get(`${API_BASE}/suppliers/${supplierId}/invoices/matched`).catch(() => ({ 
          data: [
            { 
              id: 'inv-m-001', 
              invoiceNumber: 'INV-2025-M-001', 
              poNumber: 'PO-2025-001',
              poId: 'po-001',
              amount: 22000.00, 
              matchedOn: '2025-11-10' 
            },
            { 
              id: 'inv-m-002', 
              invoiceNumber: 'INV-2025-M-002', 
              poNumber: 'PO-2025-002',
              poId: 'po-002',
              amount: 17500.00, 
              matchedOn: '2025-11-12' 
            },
          ] 
        })),
        axios.get(`${API_BASE}/suppliers/${supplierId}/matching/stats`).catch(() => ({ 
          data: {
            totalInvoices: 10,
            matched: 2,
            unmatched: 8,
          } 
        })),
      ]);

      setUnmatchedInvoices(unmatchedInvRes.data);
      setUnmatchedPOs(unmatchedPORes.data);
      setMatchedInvoices(matchedRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadPriceDashboard = () => {
    try {
      // Load from localStorage instead of backend
      const storedData = localStorage.getItem('invoicePrices');
      const priceData = storedData ? JSON.parse(storedData) : {};
      setPriceEntries(priceData);
      
      // Calculate mismatches
      const mismatches = [];
      Object.keys(priceData).forEach((invoiceId) => {
        const entry = priceData[invoiceId];
        if (entry.supplierPrice != null && entry.invoicePrice != null) {
          const difference = entry.invoicePrice - entry.supplierPrice;
          if (Math.abs(difference) > 0.01) {
            mismatches.push({
              invoiceId,
              invoiceNumber: entry.invoiceNumber,
              supplierPrice: entry.supplierPrice,
              invoicePrice: entry.invoicePrice,
              difference,
              lastUpdated: entry.lastUpdated ? new Date(entry.lastUpdated).toLocaleString() : 'N/A',
            });
          }
        }
      });
      setMismatchedEntries(mismatches);
    } catch (error) {
      console.error('Failed to load price data from localStorage:', error);
      setMismatchedEntries([]);
    }
  };

  const loadSuggestions = async (invoiceId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/suppliers/invoices/${invoiceId}/match-suggestions`
      ).catch(() => {
        // Mock suggestions based on invoice ID
        const mockSuggestions = {
          'inv-001': [{ poId: 'po-101', amount: 15000.00, score: 100 }],
          'inv-002': [{ poId: 'po-102', amount: 25000.00, score: 94 }],
          'inv-003': [{ poId: 'po-103', amount: 8500.00, score: 100 }],
          'inv-004': [{ poId: 'po-104', amount: 42000.00, score: 95 }],
          'inv-005': [{ poId: 'po-105', amount: 12300.00, score: 100 }],
          'inv-006': [{ poId: 'po-102', amount: 25000.00, score: 77 }],
          'inv-007': [{ poId: 'po-104', amount: 42000.00, score: 74 }],
          'inv-008': [{ poId: 'po-103', amount: 8500.00, score: 92 }],
        };
        return { data: mockSuggestions[invoiceId] || [] };
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions([]);
    }
  };

  const fetchInvoicePrice = (invoiceId) => {
    if (!invoiceId) return;
    try {
      // Load from localStorage
      const storedData = localStorage.getItem('invoicePrices');
      const priceData = storedData ? JSON.parse(storedData) : {};
      setPriceEntries(priceData);
    } catch (error) {
      console.error('Failed to fetch invoice price entry from localStorage:', error);
    }
  };

  const selectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    if (invoice) {
      loadSuggestions(invoice.id);
      fetchInvoicePrice(invoice.id);
    } else {
      setSuggestions([]);
    }
  };

  const handlePriceEntry = (invoice, type) => {
    if (!invoice) return;
    const key = type === 'supplier' ? 'supplierPrice' : 'invoicePrice';
    const label = type === 'supplier' ? 'supplier' : 'invoice';
    const currentValue = priceEntries[invoice.id]?.[key] ?? '';
    const input = window.prompt(
      `Enter the ${label} price for invoice #${
        invoice.invoiceNumber || invoice.id?.slice(-8) || 'N/A'
      }`,
      currentValue
    );

    if (input === null) return;

    const value = parseFloat(input);
    if (Number.isNaN(value) || value < 0) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      // Save to localStorage instead of backend
      const storedData = localStorage.getItem('invoicePrices');
      const priceData = storedData ? JSON.parse(storedData) : {};
      
      const existingEntry = priceData[invoice.id] || {};
      const updatedEntry = {
        ...existingEntry,
        invoiceNumber: invoice.invoiceNumber || invoice.id?.slice(-8) || 'N/A',
        [key]: value,
        lastUpdated: new Date().toISOString(),
      };
      
      priceData[invoice.id] = updatedEntry;
      localStorage.setItem('invoicePrices', JSON.stringify(priceData));
      
      setPriceEntries(priceData);
      loadPriceDashboard();
      
      alert(`${label.charAt(0).toUpperCase() + label.slice(1)} price saved successfully!`);
    } catch (error) {
      alert(`Failed to save ${label} price: ${error.message}`);
    }
  };

  const autoMatch = async (invoiceId) => {
    try {
      const response = await axios.post(
        `${API_BASE}/suppliers/invoices/${invoiceId}/auto-match`
      );
      
      if (response.data.matched) {
        alert(`Invoice auto-matched to PO ${response.data.poId}!`);
        await loadData();
        setSelectedInvoice(null);
        setSuggestions([]);
      } else {
        alert('No suitable match found. Please try manual matching.');
      }
    } catch (error) {
      alert('Failed to auto-match: ' + error.message);
    }
  };

  const manualMatch = async (invoiceId, poId) => {
    try {
      await axios.post(`${API_BASE}/suppliers/invoices/${invoiceId}/match`, { poId });
      alert('Invoice matched successfully!');
      await loadData();
      setSelectedInvoice(null);
      setSuggestions([]);
    } catch (error) {
      alert('Failed to match invoice: ' + error.message);
    }
  };

  const unmatch = async (invoiceId) => {
    try {
      await axios.post(`${API_BASE}/suppliers/invoices/${invoiceId}/unmatch`);
      alert('Invoice unmatched successfully');
      await loadData();
    } catch (error) {
      alert('Failed to unmatch invoice: ' + error.message);
    }
  };

  const selectedPriceRecord = selectedInvoice ? priceEntries[selectedInvoice.id] : null;

  return (
    <SupplierLayout title="Invoice Matching" subtitle="Match invoices with purchase orders automatically or manually">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.totalInvoices || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Matched</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {stats?.matched || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Unmatched</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {stats?.unmatched || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Price Mismatches</p>
                <p className={`text-2xl font-bold mt-2 ${mismatchedEntries.length ? 'text-red-600' : 'text-gray-900'}`}>
                  {mismatchedEntries.length}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${mismatchedEntries.length ? 'bg-red-100' : 'bg-green-100'}`}>
                <svg
                  className={`h-6 w-6 ${mismatchedEntries.length ? 'text-red-600' : 'text-green-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mismatchedEntries.length ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
            </div>
            {mismatchedEntries.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {mismatchedEntries.slice(0, 3).map((entry) => (
                  <li key={entry.invoiceId} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="font-medium">#{entry.invoiceNumber}</span>
                    <span className="text-red-600 font-semibold">
                      Δ Rs. {Math.abs(entry.difference).toFixed(2)}
                    </span>
                  </li>
                ))}
                {mismatchedEntries.length > 3 && (
                  <li className="text-xs text-gray-500 text-center pt-1">+ {mismatchedEntries.length - 3} more mismatches</li>
                )}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-green-600 font-medium">✓ All prices match</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('unmatched')}
              className={`${
                activeTab === 'unmatched'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Unmatched Invoices ({unmatchedInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('matched')}
              className={`${
                activeTab === 'matched'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Matched Invoices ({matchedInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('mismatches')}
              className={`${
                activeTab === 'mismatches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              Price Mismatches ({mismatchedEntries.length})
              {mismatchedEntries.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {mismatchedEntries.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Unmatched Tab */}
        {activeTab === 'unmatched' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoices List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Unmatched Invoices</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {unmatchedInvoices.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No unmatched invoices
                  </div>
                ) : (
                  unmatchedInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedInvoice?.id === invoice.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                      onClick={() => selectInvoice(invoice)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Invoice #{invoice.invoiceNumber || invoice.id?.slice(-8) || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Date: {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            Rs. {invoice.amount?.toFixed(2) || '0.00'}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              autoMatch(invoice.id);
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            Auto Match
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Matching Panel */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedInvoice ? 'Suggested Matches' : 'Select an Invoice'}
                </h2>
              </div>
              <div className="p-6">
                {!selectedInvoice ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                    <p>Select an invoice to see matching suggestions</p>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No matching suggestions found</p>
                    <p className="text-sm mt-2">Try manual matching with available POs</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-blue-900">Selected Invoice</p>
                      <p className="text-lg font-bold text-blue-900 mt-1">
                        #{selectedInvoice.invoiceNumber || selectedInvoice.id?.slice(-8)}
                      </p>
                      <p className="text-sm text-blue-700">
                        Amount: Rs. {selectedInvoice.amount?.toFixed(2) || '0.00'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="border rounded-lg p-3 bg-blue-50">
                        <p className="text-xs uppercase text-gray-500 font-semibold">Supplier Price</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {selectedPriceRecord?.supplierPrice != null
                            ? `Rs. ${selectedPriceRecord.supplierPrice.toFixed(2)}`
                            : 'Not set'}
                        </p>
                        <button
                          onClick={() => handlePriceEntry(selectedInvoice, 'supplier')}
                          className="mt-2 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          {selectedPriceRecord?.supplierPrice != null ? 'Update' : 'Add'} Supplier Price
                        </button>
                      </div>
                      <div className="border rounded-lg p-3 bg-green-50">
                        <p className="text-xs uppercase text-gray-500 font-semibold">Invoice Price</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {selectedPriceRecord?.invoicePrice != null
                            ? `Rs. ${selectedPriceRecord.invoicePrice.toFixed(2)}`
                            : 'Not set'}
                        </p>
                        <button
                          onClick={() => handlePriceEntry(selectedInvoice, 'invoice')}
                          className="mt-2 w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          {selectedPriceRecord?.invoicePrice != null ? 'Update' : 'Add'} Invoice Price
                        </button>
                      </div>
                    </div>

                    {selectedPriceRecord?.supplierPrice != null &&
                      selectedPriceRecord?.invoicePrice != null &&
                      Math.abs(selectedPriceRecord.invoicePrice - selectedPriceRecord.supplierPrice) > 0.01 && (
                        <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <h3 className="text-sm font-semibold text-red-800">⚠️ Price Mismatch Detected</h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>Supplier Price: Rs. {selectedPriceRecord.supplierPrice.toFixed(2)}</p>
                                <p>Invoice Price: Rs. {selectedPriceRecord.invoicePrice.toFixed(2)}</p>
                                <p className="font-bold mt-1">
                                  Difference: Rs. {Math.abs(
                                    selectedPriceRecord.invoicePrice - selectedPriceRecord.supplierPrice
                                  ).toFixed(2)}
                                  {selectedPriceRecord.invoicePrice > selectedPriceRecord.supplierPrice ? ' (Overcharge)' : ' (Undercharge)'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    <h3 className="font-semibold text-gray-900 mb-3">Matching POs:</h3>
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.poId}
                        className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              PO #{suggestion.poId || 'N/A'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {suggestion.score || 0}% Match
                              </span>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900">
                            Rs. {suggestion.amount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <button
                          onClick={() => manualMatch(selectedInvoice.id, suggestion.poId)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Match with this PO
                        </button>
                      </div>
                    ))}

                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-3">Or select from all available POs:</p>
                      <select
                        className="w-full px-4 py-2 border rounded-lg mb-3"
                        onChange={(e) => {
                          if (e.target.value) {
                            manualMatch(selectedInvoice.id, e.target.value);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">Select a PO...</option>
                        {unmatchedPOs.map((po) => (
                          <option key={po.id} value={po.id}>
                            PO #{po.id?.slice(-8)} - Rs. {po.amount?.toFixed(2) || '0.00'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Matched Tab */}
        {activeTab === 'matched' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Matched Invoices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      PO #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Matched On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matchedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No matched invoices
                      </td>
                    </tr>
                  ) : (
                    matchedInvoices.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.invoiceNumber || item.id?.slice(-8) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.poNumber || item.poId?.slice(-8) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rs. {item.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.matchedOn
                            ? new Date(item.matchedOn).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => unmatch(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Unmatch
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Price Mismatches Tab */}
        {activeTab === 'mismatches' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Price Mismatches Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1">
                Invoices where supplier price and invoice price don't match
              </p>
            </div>
            <div className="p-6">
              {mismatchedEntries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <svg
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Price Mismatches</h3>
                  <p className="text-gray-500">
                    All invoices with both supplier and invoice prices match perfectly!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mismatchedEntries.map((entry) => (
                    <div
                      key={entry.invoiceId}
                      className="border-2 border-red-200 rounded-lg p-6 bg-red-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Invoice #{entry.invoiceNumber}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Last updated: {entry.lastUpdated || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                            MISMATCH
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                            Supplier Price
                          </p>
                          <p className="text-xl font-bold text-blue-600">
                            Rs. {entry.supplierPrice.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                            Invoice Price
                          </p>
                          <p className="text-xl font-bold text-green-600">
                            Rs. {entry.invoicePrice.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-red-300">
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                            Difference
                          </p>
                          <p className={`text-xl font-bold ${entry.difference > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                            {entry.difference > 0 ? '+' : ''}Rs. {entry.difference.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {entry.difference > 0 ? '(Overcharged)' : '(Undercharged)'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-red-200">
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Percentage Difference:</span>{' '}
                          {((Math.abs(entry.difference) / entry.supplierPrice) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
    </SupplierLayout>
  );
}
