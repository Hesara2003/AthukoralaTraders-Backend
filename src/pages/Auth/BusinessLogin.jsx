import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { User, Lock, AlertCircle, Loader2, LogIn, Eye, EyeOff, Shield } from "lucide-react";

const InputField = ({ icon: Icon, label, error, type = "text", showPassword, onTogglePassword, ...props }) => (
  <div className="space-y-1 sm:space-y-2">
    <label className="block text-xs sm:text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
      </div>
      <input
        type={type}
        {...props}
        className={`
          block w-full pl-9 sm:pl-10 pr-3 py-3 border rounded-lg shadow-sm text-sm sm:text-base
          focus:outline-none focus:ring-2 focus:border-transparent
          transition-all duration-200
          ${error 
            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400'
          }
        `}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center min-w-[44px] justify-center"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
    </div>
    {error && (
      <p className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
        {error}
      </p>
    )}
  </div>
);

export default function BusinessLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const from = location.state?.from?.pathname || "/admin/dashboard";

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification("error", "Please fix the errors below");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        login(data.token, formData.username);
        const base64Url = data.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);
        const userRole = decodedToken?.role || 'CUSTOMER';

        if (userRole === 'CUSTOMER') {
          showNotification('error', 'This portal is for Admin/Staff/Supplier. Please use Customer Login.');
          return;
        }

        const redirectPath = userRole === 'SUPPLIER' ? '/supplier/purchase-orders' : (from || '/admin/dashboard');
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full mb-3 sm:mb-4">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Business Login</h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">Admin, Staff and Suppliers sign in here</p>
        </div>

        {notification && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 ${notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium text-sm sm:text-base">{notification.message}</span>
          </div>
        )}

        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Sign In</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Use credentials provided by the Admin</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <InputField icon={User} label="Username" type="text" name="username" placeholder="Enter your username" value={formData.username} onChange={handleChange} error={errors.username} autoComplete="username" />
            <InputField icon={Lock} label="Password" type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} error={errors.password} autoComplete="current-password" showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />
            <button type="submit" disabled={isLoading} className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] text-sm sm:text-base ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black focus:ring-gray-700'} text-white shadow-lg`}>{isLoading ? (<><Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> Signing In...</>) : (<><LogIn className="h-4 w-4 sm:h-5 sm:w-5" /> Sign In</>)}</button>
          </form>

          <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-t border-gray-100 text-xs sm:text-sm text-gray-600 text-center">
            Are you a customer? <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">Go to Customer Login</Link>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 px-4 leading-relaxed">
          Staff and Supplier credentials are issued by Admin. Customers should use Customer Login/Signup.
        </p>
      </div>
    </div>
  );
}
