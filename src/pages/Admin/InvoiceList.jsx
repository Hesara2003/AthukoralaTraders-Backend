import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, FileText, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function InvoiceList() {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const handlePrintClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowReceiptModal(true);
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedInvoice(null);
  };

  const handlePrint = () => {
    window.print();
  };
  const { getToken } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken && getToken();
  const res = await fetch('http://localhost:8080/api/staff/invoices/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      setError('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Invoices</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={fetchInvoices} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Try again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-medium text-gray-900">Invoice List</h2>
            <p className="text-sm text-gray-600">View all invoices</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No invoices found.</td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id || inv._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.id || inv._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.customerName || inv.userId || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.date ? new Date(inv.date).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${inv.total || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.status || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handlePrintClick(inv)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                        title="Print Receipt"
                      >
                        <Printer className="h-4 w-4" /> Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Receipt Modal */}
      {showReceiptModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Receipt Preview</h2>
            <div className="mb-4">
              <p><strong>Store:</strong> Athukorala Traders</p>
              <p><strong>Date:</strong> {selectedInvoice.date ? new Date(selectedInvoice.date).toLocaleString() : '-'}</p>
              <hr className="my-2" />
              <p><strong>Invoice ID:</strong> {selectedInvoice.id || selectedInvoice._id}</p>
              <p><strong>Customer:</strong> {selectedInvoice.customerName || selectedInvoice.userId || '-'}</p>
              <p><strong>Total:</strong> ${selectedInvoice.total || '0.00'}</p>
              <p><strong>Status:</strong> {selectedInvoice.status || '-'}</p>
              <p className="mt-2"><strong>Thank you for your business!</strong></p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Print</button>
              <button onClick={handleCloseReceiptModal} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}