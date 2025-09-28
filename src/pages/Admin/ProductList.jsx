import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from '../../components/AdminLayout';
import { 
  Search, 
  Filter, 
  Package, 
  Tag, 
  DollarSign, 
  Hash,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Plus,
  SortAsc,
  SortDesc,
  LogOut,
  User
} from "lucide-react";

export default function ProductList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortConfig]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/admin/products");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (productId) => {
   
    const product = products.find(p => p.id === productId);
    if (product) {
      alert(`Product Details:\nName: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price}\nStock: ${product.stock}\nDescription: ${product.description}`);
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(productId);
      const response = await fetch(`http://localhost:8080/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setProducts(products.filter(p => p.id !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAddProduct = () => {
    navigate('/admin/products/new');
  };

  const handleChangeRoles = () => {
    navigate('/admin/users');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredProducts(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.filter(Boolean);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (stock < 10) return { text: "Low Stock", color: "text-yellow-600 bg-yellow-50" };
    return { text: "In Stock", color: "text-green-600 bg-green-50" };
  };

  const SortButton = ({ sortKey, children }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
    >
      {children}
      {sortConfig.key === sortKey && (
        sortConfig.direction === 'asc' ? 
        <SortAsc className="h-4 w-4" /> : 
        <SortDesc className="h-4 w-4" />
      )}
    </button>
  );

  if (loading) {
    return <AdminLayout title="Products"><div className="text-gray-600">Loading products...</div></AdminLayout>;
  }
  if (error) {
    return <AdminLayout title="Products"><div className="text-red-600">{error}</div></AdminLayout>;
  }

  return (
    <AdminLayout
      title="Product Catalog"
      subtitle={`Manage and view all products (${filteredProducts.length})`}
      actions={<button onClick={handleAddProduct} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"><Plus className="h-5 w-5" />Add Product</button>}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="lg:w-64">
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start by adding your first product'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton sortKey="name">
                      <Package className="h-4 w-4" />
                      Product
                    </SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton sortKey="category">
                      <Tag className="h-4 w-4" />
                      Category
                    </SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton sortKey="price">
                      <DollarSign className="h-4 w-4" />
                      Price
                    </SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton sortKey="stock">
                      <Hash className="h-4 w-4" />
                      Stock
                    </SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <button 
                            onClick={() => handleViewProduct(product.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                            title="View Product"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product.id)}
                            className="text-green-600 hover:text-green-900 transition-colors p-1"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteLoading === product.id}
                            className="text-red-600 hover:text-red-900 transition-colors p-1 disabled:opacity-50"
                            title="Delete Product"
                          >
                            {deleteLoading === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-4 p-4">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleViewProduct(product.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                        title="View Product"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product.id)}
                        className="text-green-600 hover:text-green-900 transition-colors p-1"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteLoading === product.id}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 disabled:opacity-50"
                        title="Delete Product"
                      >
                        {deleteLoading === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-gray-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}