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

  const supplierId = user?.id || 'supplier-demo';

  useEffect(() => {
    loadData();
  }, [supplierId]);

  const loadData = async () => {
    try {
      const [unmatchedInvRes, unmatchedPORes, matchedRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/suppliers/${supplierId}/invoices/unmatched`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/suppliers/${supplierId}/purchase-orders/unmatched`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/suppliers/${supplierId}/invoices/matched`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/suppliers/${supplierId}/matching/stats`).catch(() => ({ data: {} })),
      ]);

      setUnmatchedInvoices(unmatchedInvRes.data);
      setUnmatchedPOs(unmatchedPORes.data);
      setMatchedInvoices(matchedRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadSuggestions = async (invoiceId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/suppliers/invoices/${invoiceId}/match-suggestions`
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions([]);
    }
  };

  const selectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    if (invoice) {
      loadSuggestions(invoice.id);
    } else {
      setSuggestions([]);
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

  return (
    <SupplierLayout title="Invoice Matching" subtitle="Match invoices with purchase orders automatically or manually">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
    </SupplierLayout>
  );
}
