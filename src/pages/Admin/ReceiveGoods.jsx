import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const ReceiveGoods = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    purchaseOrderId: '',
    supplierId: '',
    items: [],
    notes: '',
    receivedDate: new Date().toISOString().split('T')[0]
  });
  
  const [selectedPO, setSelectedPO] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    productId: '',
    productName: '',
    orderedQuantity: 0,
    receivedQuantity: 0,
    unitPrice: 0,
    discrepancyReason: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/purchase-orders`, {
        headers: getAuthHeaders()
      });
      // Filter only approved POs that haven't been fully received
      const pendingPOs = response.data.filter(po => 
        po.status === 'APPROVED' || po.status === 'PARTIAL'
      );
      setPurchaseOrders(pendingPOs);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/suppliers`, {
        headers: getAuthHeaders()
      });
      setSuppliers(response.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handlePOChange = (e) => {
    const poId = e.target.value;
    setFormData({ ...formData, purchaseOrderId: poId, items: [] });
    
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      setSelectedPO(po);
      setFormData(prev => ({
        ...prev,
        supplierId: po.supplierId,
        purchaseOrderId: poId
      }));
    }
  };

  const openAddItemModal = () => {
    setCurrentItem({
      productId: '',
      productName: '',
      orderedQuantity: 0,
      receivedQuantity: 0,
      unitPrice: 0,
      discrepancyReason: ''
    });
    setShowItemModal(true);
  };

  const openEditItemModal = (index) => {
    const item = formData.items[index];
    setCurrentItem({ ...item, editIndex: index });
    setShowItemModal(true);
  };

  const handleItemChange = (field, value) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
    
    // If product is selected, populate details
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        setCurrentItem(prev => ({
          ...prev,
          productName: product.name,
          unitPrice: product.price
        }));
        
        // Check if this product is in the PO
        if (selectedPO) {
          const poItem = selectedPO.items?.find(item => item.productId === value);
          if (poItem) {
            setCurrentItem(prev => ({
              ...prev,
              orderedQuantity: poItem.quantity,
              unitPrice: poItem.unitPrice
            }));
          }
        }
      }
    }
  };

  const addOrUpdateItem = () => {
    if (!currentItem.productId || currentItem.receivedQuantity <= 0) {
      setError('Please fill in all required item fields');
      return;
    }

    const newItem = {
      productId: currentItem.productId,
      productName: currentItem.productName,
      orderedQuantity: parseFloat(currentItem.orderedQuantity),
      receivedQuantity: parseFloat(currentItem.receivedQuantity),
      unitPrice: parseFloat(currentItem.unitPrice),
      discrepancyReason: currentItem.discrepancyReason || ''
    };

    if (currentItem.editIndex !== undefined) {
      // Update existing item
      const updatedItems = [...formData.items];
      updatedItems[currentItem.editIndex] = newItem;
      setFormData({ ...formData, items: updatedItems });
    } else {
      // Add new item
      setFormData({ ...formData, items: [...formData.items, newItem] });
    }

    setShowItemModal(false);
    setError('');
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.purchaseOrderId) {
      setError('Please select a Purchase Order');
      return;
    }

    if (formData.items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const grnData = {
        purchaseOrderId: formData.purchaseOrderId,
        supplierId: formData.supplierId,
        receivedDate: formData.receivedDate,
        items: formData.items.map(item => ({
          productId: item.productId,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          unitPrice: item.unitPrice,
          discrepancyReason: item.discrepancyReason
        })),
        notes: formData.notes
      };

      const response = await axios.post(
        `${API_BASE_URL}/admin/grn`,
        grnData,
        { headers: getAuthHeaders() }
      );

      setSuccess(`GRN created successfully! ID: ${response.data.id}`);
      
      // Reset form
      setFormData({
        purchaseOrderId: '',
        supplierId: '',
        items: [],
        notes: '',
        receivedDate: new Date().toISOString().split('T')[0]
      });
      setSelectedPO(null);
      
      // Refresh PO list
      fetchPurchaseOrders();
      
      // Navigate to GRN list after 2 seconds
      setTimeout(() => {
        navigate('/admin/grn-list');
      }, 2000);

    } catch (err) {
      console.error('Error creating GRN:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. You do not have permission to create GRNs.');
      } else {
        setError(err.response?.data?.error || 'Failed to create GRN. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return formData.items.reduce((sum, item) => 
      sum + (item.receivedQuantity * item.unitPrice), 0
    ).toFixed(2);
  };

  const getDiscrepancyCount = () => {
    return formData.items.filter(item => 
      item.receivedQuantity !== item.orderedQuantity
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Receive Goods (GRN)</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a Goods Receipt Note to record received items from suppliers
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Information Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">GRN Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Purchase Order Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Order <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.purchaseOrderId}
                  onChange={handlePOChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Purchase Order</option>
                  {purchaseOrders.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.id} - {suppliers.find(s => s.id === po.supplierId)?.name || po.supplierId} 
                      ({po.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier (Auto-filled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  value={suppliers.find(s => s.id === formData.supplierId)?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  disabled
                  placeholder="Auto-filled from PO"
                />
              </div>

              {/* Received Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Received Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Received By (Auto-tracked from JWT) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Received By
                </label>
                <input
                  type="text"
                  value={localStorage.getItem('username') || 'Auto-tracked from login'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  disabled
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes about this receipt..."
              />
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Received Items</h2>
              <button
                type="button"
                onClick={openAddItemModal}
                disabled={!formData.purchaseOrderId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                + Add Item
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-2">No items added yet</p>
                <p className="text-sm">Select a Purchase Order and click "Add Item" to begin</p>
              </div>
            ) : (
              <>
                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ordered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Received
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                            <div className="text-sm text-gray-500">{item.productId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.orderedQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.receivedQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rs. {item.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rs. {(item.receivedQuantity * item.unitPrice).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.receivedQuantity === item.orderedQuantity ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Match
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Discrepancy
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => openEditItemModal(index)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="mt-6 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-blue-600">{formData.items.length}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Discrepancies</p>
                      <p className="text-2xl font-bold text-yellow-600">{getDiscrepancyCount()}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-green-600">Rs. {calculateTotalValue()}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.items.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating GRN...' : 'Create GRN'}
            </button>
          </div>
        </form>
      </div>

      {/* Add/Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentItem.editIndex !== undefined ? 'Edit Item' : 'Add Item'}
              </h3>

              <div className="space-y-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentItem.productId}
                    onChange={(e) => handleItemChange('productId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Rs. {product.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Ordered Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordered Quantity
                    </label>
                    <input
                      type="number"
                      value={currentItem.orderedQuantity}
                      onChange={(e) => handleItemChange('orderedQuantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Received Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Received Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={currentItem.receivedQuantity}
                      onChange={(e) => handleItemChange('receivedQuantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={currentItem.unitPrice}
                    onChange={(e) => handleItemChange('unitPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Discrepancy Reason (if quantities don't match) */}
                {currentItem.receivedQuantity != currentItem.orderedQuantity && currentItem.receivedQuantity > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discrepancy Reason
                    </label>
                    <textarea
                      value={currentItem.discrepancyReason}
                      onChange={(e) => handleItemChange('discrepancyReason', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain why received quantity differs from ordered..."
                    />
                  </div>
                )}

                {/* Item Total */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Item Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      Rs. {(currentItem.receivedQuantity * currentItem.unitPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addOrUpdateItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {currentItem.editIndex !== undefined ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiveGoods;
