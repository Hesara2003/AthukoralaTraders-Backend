import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { CustomerProductApi } from '../../utils/customerProductApi';
import { AdminProductApi } from '../../utils/adminProductApi';
import { createQuickSale } from '../../utils/quickSaleApi';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, User, Barcode } from 'lucide-react';

// Utility helpers
const currency = (n) => (typeof n === 'number' ? n : Number(n || 0)).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export default function QuickSale() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [items, setItems] = useState([]); // {id, name, sku, price, qty, stock}
  const searchInputRef = useRef(null);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [processing, setProcessing] = useState(false);

  // Search products by name/sku/description
  const doSearch = async (term) => {
    const s = term?.trim();
    if (!s) { setResults([]); return; }
    try {
      setSearching(true);
      // Prefer CustomerProductApi to get discount info if available
  const list = await CustomerProductApi.search(s).catch(() => []);
      setResults(list || []);
      setActiveIndex((prev) => (list && list.length ? Math.max(0, Math.min(prev, list.length - 1)) : -1));
    } finally {
      setSearching(false);
    }
  };

  // Add a product as a line item
  const addItem = (p) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === p.id);
      if (exists) {
        // increment if stock allows
        return prev.map((i) => i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, i.stock ?? i.stockQuantity ?? 9999) } : i);
      }
      const price = p.discountedPrice ?? p.price;
      const stock = p.stock ?? p.stockQuantity ?? 0;
      return [
        ...prev,
        { id: p.id, name: p.name, sku: p.sku, price, qty: 1, stock }
      ];
    });
    setQuery('');
    setResults([]);
    setActiveIndex(-1);
  };

  const updateQty = (id, delta) => {
    setItems((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      const next = Math.max(1, Math.min((i.qty + delta), i.stock || 9999));
      return { ...i, qty: next };
    }));
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const taxRate = 0.08; // 8% demo tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);

  const handleProcessSale = async () => {
    setProcessing(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.id, quantity: i.qty })),
        // Use staff username as staffId if available
        staffId: user?.username || undefined,
      };

      const order = await createQuickSale(payload);

      window.alert('Sale processed successfully. Order ID: ' + (order?.id || 'N/A'));
      setItems([]);
      setCustomerName('');
      setPaymentMethod('CASH');
    } catch (e) {
      console.error(e);
      window.alert(e.message || 'Failed to process sale. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Support quick scan by SKU/Barcode field
  const scanAdd = async () => {
    const code = scannedCode.trim();
    if (!code) return;
    try {
  const product = await CustomerProductApi.getById(code).catch(() => AdminProductApi.getById(code));
      if (product) addItem(product);
    } catch (e) {
      window.alert('No product found for code: ' + code);
    } finally {
      setScannedCode('');
    }
  };

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Keyboard navigation and shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      // Global '/' to focus search
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      // Only handle navigation if search has focus or results are open
      const resultsOpen = query && results.length > 0;
      const inSearch = document.activeElement === searchInputRef.current;
      if (!resultsOpen || !inSearch) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const p = results[activeIndex >= 0 ? activeIndex : 0];
        if (p) addItem(p);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setResults([]);
        setActiveIndex(-1);
      } else if (/^[1-9]$/.test(e.key)) {
        // 1-9 hotkeys map to result index 0-8
        const idx = Number(e.key) - 1;
        if (idx < results.length) {
          e.preventDefault();
          const p = results[idx];
          if (p) addItem(p);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [query, results, activeIndex]);

  return (
    <AdminLayout title="Quick Sale" subtitle="Process in-store sales on a single page">
      {/* Search and Scan Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                ref={searchInputRef}
                placeholder="Search by name, SKU, category..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Results dropdown */}
              {query && results.length > 0 && (
                <div className="absolute z-10 mt-2 w-full max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                  {results.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => addItem(p)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between ${idx === activeIndex ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs w-5 h-5 inline-flex items-center justify-center rounded bg-gray-100 text-gray-700">
                          {idx < 9 ? idx + 1 : '•'}
                        </span>
                        <div>
                          <div className="font-medium text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-500">SKU: {p.sku} • {currency(p.discountedPrice ?? p.price)}</div>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
              {query && !searching && results.length === 0 && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow p-3 text-sm text-gray-500">
                  No results found
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">Tip: type at least 2 characters to search. Use ↓/↑ and Enter to add. Press 1–9 to pick quickly. Press / to focus search.</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
            <Barcode className="h-4 w-4" /> Quick Scan (SKU)
          </div>
          <div className="flex gap-2">
            <input
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && scanAdd()}
              placeholder="Enter or scan SKU"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={scanAdd} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Order Items</h3>
        </div>
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No items added yet. Search or scan to add products.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Subtotal</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t text-sm">
                    <td className="px-6 py-3 font-medium text-gray-800">{i.name}</td>
                    <td className="px-6 py-3 text-gray-600">{i.sku}</td>
                    <td className="px-6 py-3">{currency(i.price)}</td>
                    <td className="px-6 py-3">
                      <div className="inline-flex items-center gap-2 border rounded-lg">
                        <button
                          className="px-2 py-1 hover:bg-gray-50"
                          onClick={() => updateQty(i.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center">{i.qty}</span>
                        <button
                          className="px-2 py-1 hover:bg-gray-50"
                          onClick={() => updateQty(i.id, +1)}
                          aria-label="Increase quantity"
                          disabled={i.stock && i.qty >= i.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{i.stock ?? '—'}</td>
                    <td className="px-6 py-3 font-semibold">{currency(i.price * i.qty)}</td>
                    <td className="px-6 py-3">
                      <button className="p-2 rounded-md hover:bg-red-50 text-red-600" onClick={() => removeItem(i.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer and Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-2 mb-1"><User className="h-4 w-4" /> Customer (optional)</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in customer"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-2 mb-1"><CreditCard className="h-4 w-4" /> Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{currency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>{currency(totals.tax)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-gray-900 font-semibold">
              <span>Total</span>
              <span>{currency(totals.total)}</span>
            </div>
          </div>
          <button
            onClick={handleProcessSale}
            disabled={items.length === 0 || processing}
            className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold shadow-md transition-colors ${items.length === 0 || processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {processing ? 'Processing…' : 'Process Sale'}
          </button>
          <div className="text-xs text-gray-500 mt-2">Stock updates will reflect instantly after confirmed sale.</div>
        </div>
      </div>
    </AdminLayout>
  );
}
