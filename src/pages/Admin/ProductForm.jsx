import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Package, Tag, FileText, DollarSign, Hash, Upload, Check, AlertCircle, Loader2, ArrowLeft, User, LogOut, X, Image } from "lucide-react";
import AdminLayout from '../../components/AdminLayout';
import { ProductApi } from "../../utils/productApi";

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    stock: 0,
    images: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id, isEditing]);

  const fetchProduct = async () => {
    try {
      setIsLoadingProduct(true);
      // Use ProductApi.get() with Bearer token authentication
      const product = await ProductApi.get(id);
      
      setFormData({
        name: product.name || "",
        category: product.category || "",
        description: product.description || "",
        price: product.price || 0,
        stock: product.stock || 0,
        images: product.images || []
      });
    } catch (err) {
      console.error('Failed to fetch product:', err);
      showNotification("error", "Failed to load product data: " + err.message);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  // Resolve image source: use as-is for absolute URLs/data URIs, otherwise treat as stored filename on backend
  const resolveImageSrc = (value) => {
    if (!value) return "";
    const v = String(value).trim();
    if (v.startsWith("data:")) return v;
    if (/^https?:\/\//i.test(v)) return v;
    if (/^\/\//.test(v)) return `https:${v}`; // protocol-relative
    // looks like a domain/path, add https
    if (/^[\w.-]+\.[A-Za-z]{2,}.*$/.test(v)) return `https://${v}`;
    return `${API_BASE}/api/files/products/${encodeURIComponent(v)}`;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (formData.stock < 0) newErrors.stock = "Stock cannot be negative";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== fileArray.length) {
      showNotification("error", "Only image files are allowed");
      return;
    }

    setSelectedFiles(prev => [...prev, ...imageFiles]);
    
    // Create preview URLs
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, { file: file.name, url: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    // Basic URL format check; allow data URIs too
    const isLikelyUrl = /^(https?:\/\/|data:|\/\/)/i.test(url) || /^[\w.-]+\.[A-Za-z]{2,}.*$/.test(url);
    if (!isLikelyUrl) {
      // still allow adding non-URL string, it will be treated as filename
      // but nudge user with a soft notification
      showNotification("warning", "Added as filename (not a full URL).");
    }
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
    setImageUrlInput("");
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    setIsUploadingImages(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/products/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload images');
      }

      return result.fileNames || [];
    } catch (error) {
      console.error('Image upload error:', error);
      showNotification("error", "Failed to upload images: " + error.message);
      return [];
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      showNotification("error", "Please fix the errors below");
      return;
    }

    setIsLoading(true);

    try {
      // Upload new images first if any
      const uploadedImageNames = await uploadImages();
      
      // Combine existing images with newly uploaded ones
      const allImages = [...formData.images, ...uploadedImageNames];
      
      const productData = {
        ...formData,
        images: allImages
      };

      // Use ProductApi with proper authentication
      let data;
      if (isEditing) {
        data = await ProductApi.update(id, productData);
      } else {
        data = await ProductApi.create(productData);
      }

      showNotification("success", `Product ${isEditing ? 'updated' : 'created'} successfully!`);
      
      if (!isEditing) {
        setFormData({
          name: "",
          category: "",
          description: "",
          price: 0,
          stock: 0,
          images: []
        });
        setSelectedFiles([]);
        setImagePreviewUrls([]);
      }
      
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
      
      console.log(data);
    } catch (err) {
      console.error('Submit error:', err);
      showNotification("error", err.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ icon: Icon, label, error, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
        <input
          {...props}
          className={`
            block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-all duration-200
            ${error 
              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400'
            }
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );

  const TextAreaField = ({ icon: Icon, label, error, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute top-3 left-3 pointer-events-none">
          <Icon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
        <textarea
          {...props}
          rows={4}
          className={`
            block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-all duration-200 resize-none
            ${error 
              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400'
            }
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );

  if (isEditing && isLoadingProduct) {
    return <AdminLayout title="Edit Product"><div className="text-gray-600">Loading product data...</div></AdminLayout>;
  }

  return (
    <AdminLayout title={isEditing ? 'Edit Product' : 'Add New Product'} subtitle={isEditing ? 'Update product details' : 'Create a new catalog entry'}>
      <div className="max-w-3xl mx-auto space-y-6">
        {notification && (
          <div className={`mb-2 p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {notification.type === 'success' ? <Check className="h-5 w-5 text-green-600"/> : <AlertCircle className="h-5 w-5 text-red-600"/>}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
            <p className="text-xs text-gray-500 mt-1">{isEditing ? 'Update existing product fields' : 'Enter details for the new product'}</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField icon={Package} label="Product Name" type="text" name="name" placeholder="Enter product name" value={formData.name} onChange={handleChange} error={errors.name} />
              <InputField icon={Tag} label="Category" type="text" name="category" placeholder="Enter category" value={formData.category} onChange={handleChange} error={errors.category} />
            </div>
            <TextAreaField icon={FileText} label="Description" name="description" placeholder="Enter product description" value={formData.description} onChange={handleChange} error={errors.description} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField icon={DollarSign} label="Price" type="number" name="price" placeholder="0.00" step="0.01" min="0" value={formData.price} onChange={handleChange} error={errors.price} />
              <InputField icon={Hash} label="Stock Quantity" type="number" name="stock" placeholder="0" min="0" value={formData.stock} onChange={handleChange} error={errors.stock} />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Product Images</label>
              
              {/* Existing Images (filenames or URLs) */}
              {formData.images && formData.images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Current Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={resolveImageSrc(img)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-1 left-1 right-1 text-[10px] text-white bg-black/50 rounded px-1 py-0.5 truncate opacity-0 group-hover:opacity-100">
                          {String(img)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Previews for New Uploads */}
              {imagePreviewUrls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">New Images to Upload:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add by URL */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Add Image by URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg or data:image/png;base64,..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500">Tip: You can paste direct image links from your CDN, Cloudinary, or any public URL. Mixed with uploaded images.</p>
              </div>

              {/* Upload Area (optional) */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                {isUploadingImages ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                    <span className="text-blue-600">Uploading images...</span>
                  </div>
                ) : (
                  <>
                    <Upload className={`h-10 w-10 mx-auto mb-2 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className={`text-sm ${dragActive ? 'text-blue-600' : 'text-gray-600'}`}>
                      {dragActive ? 'Drop images here' : 'Click to upload images or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <button type="button" onClick={handleSubmit} disabled={isLoading || isLoadingProduct} className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'} text-white`}>
                {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> {isEditing ? 'Updating...' : 'Creating...'}</> : <><Package className="h-5 w-5" /> {isEditing ? 'Update Product' : 'Save Product'}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}