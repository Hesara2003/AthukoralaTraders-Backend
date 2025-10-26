import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  Package, 
  Edit3, 
  Save, 
  X, 
  Eye,
  Download,
  Link,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import FinanceLayout from '../../components/FinanceLayout';
import { invoiceApi } from '../../utils/invoiceApi';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch invoice details on component mount
  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const data = await invoiceApi.getInvoiceById(id);
      setInvoice(data);
      setEditedInvoice(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditedInvoice({ ...invoice });
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedInvoice({ ...invoice });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Update invoice with edited details
      const updatedInvoice = await invoiceApi.updateInvoice(id, editedInvoice);
      setInvoice(updatedInvoice);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedInvoice(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...(editedInvoice.items || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setEditedInvoice(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addNewItem = () => {
    const newItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    setEditedInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const removeItem = (index) => {
    const updatedItems = (editedInvoice.items || []).filter((_, i) => i !== index);
    setEditedInvoice(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const calculateTotal = (items) => {
    return (items || []).reduce((total, item) => {
      const amount = parseFloat(item.amount) || (parseFloat(item.quantity) * parseFloat(item.unitPrice));
      return total + amount;
    }, 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <FinanceLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </FinanceLayout>
    );
  }

  if (error) {
    return (
      <FinanceLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Invoice</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate('/finance/invoices')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Invoice List
            </button>
          </div>
        </div>
      </FinanceLayout>
    );
  }

  if (!invoice) {
    return (
      <FinanceLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Not Found</h3>
            <p className="text-gray-600">The requested invoice could not be found.</p>
            <button
              onClick={() => navigate('/finance/invoices')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Invoice List
            </button>
          </div>
        </div>
      </FinanceLayout>
    );
  }

  const displayInvoice = editMode ? editedInvoice : invoice;

  return (
    <FinanceLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
            <p className="text-gray-600">
              {invoice.source === 'parsed' ? 'Automatically parsed from uploaded file' : 'Manually entered invoice'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!editMode ? (
              <>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Details
                </button>
                <button
                  onClick={() => navigate('/finance/invoices')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Invoices
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Invoice Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Invoice Number
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={displayInvoice.invoiceNumber || ''}
                        onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{displayInvoice.invoiceNumber || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Invoice Date
                    </label>
                    {editMode ? (
                      <input
                        type="date"
                        value={displayInvoice.invoiceDate ? new Date(displayInvoice.invoiceDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {displayInvoice.invoiceDate 
                          ? new Date(displayInvoice.invoiceDate).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Vendor/Supplier
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={displayInvoice.vendorName || ''}
                        onChange={(e) => handleInputChange('vendorName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{displayInvoice.vendorName || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Due Date
                    </label>
                    {editMode ? (
                      <input
                        type="date"
                        value={displayInvoice.dueDate ? new Date(displayInvoice.dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {displayInvoice.dueDate 
                          ? new Date(displayInvoice.dueDate).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description/Notes
                  </label>
                  {editMode ? (
                    <textarea
                      value={displayInvoice.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter invoice description or notes..."
                    />
                  ) : (
                    <p className="text-gray-900">
                      {displayInvoice.description || 'No description provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  <Package className="h-5 w-5 inline mr-2" />
                  Line Items
                </h3>
                {editMode && (
                  <button
                    onClick={addNewItem}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add Item
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      {editMode && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(displayInvoice.items || []).length === 0 ? (
                      <tr>
                        <td colSpan={editMode ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                          No line items found. {editMode && 'Click "Add Item" to add items.'}
                        </td>
                      </tr>
                    ) : (
                      (displayInvoice.items || []).map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editMode ? (
                              <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Item description"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">
                                {item.description || 'No description'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editMode ? (
                              <input
                                type="number"
                                value={item.quantity || ''}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">{item.quantity || 0}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editMode ? (
                              <input
                                type="number"
                                value={item.unitPrice || ''}
                                onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                ${parseFloat(item.unitPrice || 0).toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${(parseFloat(item.amount) || (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0))).toFixed(2)}
                            </div>
                          </td>
                          {editMode && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status and Total */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  {editMode ? (
                    <select
                      value={displayInvoice.status || 'pending'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayInvoice.status)}`}>
                      {getStatusIcon(displayInvoice.status)}
                      <span className="ml-2">{displayInvoice.status || 'Unknown'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Total Amount
                  </label>
                  <div className="text-2xl font-bold text-gray-900">
                    ${calculateTotal(displayInvoice.items).toFixed(2)}
                  </div>
                </div>

                {displayInvoice.poId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Link className="h-4 w-4 inline mr-1" />
                      Linked PO
                    </label>
                    <p className="text-blue-600 font-medium">{displayInvoice.poId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* File Information */}
            {displayInvoice.fileName && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Source File</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{displayInvoice.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {displayInvoice.fileSize && `${(displayInvoice.fileSize / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                  </div>
                  
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Download Original
                  </button>
                </div>
              </div>
            )}

            {/* Processing Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Source:</span>
                  <span className="font-medium text-gray-900">
                    {displayInvoice.source === 'parsed' ? 'Auto-parsed' : 'Manual Entry'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium text-gray-900">
                    {displayInvoice.createdAt 
                      ? new Date(displayInvoice.createdAt).toLocaleDateString()
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Modified:</span>
                  <span className="font-medium text-gray-900">
                    {displayInvoice.updatedAt 
                      ? new Date(displayInvoice.updatedAt).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
};

export default InvoiceDetails;