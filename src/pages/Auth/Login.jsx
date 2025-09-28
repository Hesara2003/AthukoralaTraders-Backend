import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { User, Lock, AlertCircle, Loader2, LogIn, Eye, EyeOff, Mail, Shield } from "lucide-react";
import GoogleOAuthButton from "../../components/GoogleOAuthButton";
import AuthLayout from "../../components/AuthLayout";

const InputField = ({ icon: Icon, label, error, type = "text", showPassword, onTogglePassword, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className={`h-5 w-5 transition-colors duration-200 ${
          error 
            ? 'text-red-500' 
            : 'text-gray-400 group-focus-within:text-blue-600'
        }`} />
      </div>
      <input
        type={type}
        {...props}
        className={`
          block w-full pl-12 pr-4 py-4 border-2 rounded-xl shadow-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          transition-all duration-200 placeholder-gray-400
          hover:border-gray-400 hover:shadow-md
          ${error 
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30' 
            : 'border-gray-200 focus:bg-blue-50/30'
          }
        `}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
      
      {/* Focus ring effect */}
      <div className={`absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-200 ${
        error ? '' : 'group-focus-within:border-blue-200 group-focus-within:shadow-lg'
      } pointer-events-none`}></div>
    </div>
    {error && (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  // Intended destination from PrivateRoute (could include params or query string)
  const fromLocation = location.state?.from;

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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Google OAuth success
  const handleGoogleSuccess = (data) => {
    try {
      // Use the auth context to login with Google data
      login(
        data.token, 
        data.user.username, 
        data.user.role,
        {
          email: data.user.email,
          profileImage: data.user.profileImage,
          fullName: data.user.fullName,
          isGoogleAuth: true
        }
      );
      
      showNotification("success", "Google login successful! Redirecting...");
      
      // Check user role and redirect accordingly
      if (data.user.role === 'ADMIN' || data.user.role === 'STAFF' || data.user.role === 'SUPPLIER') {
        showNotification('error', 'Please use Business Login for Admin/Staff/Supplier. Redirecting...');
        setTimeout(() => navigate('/business-login', { replace: true }), 1200);
        return;
      }
      
      setTimeout(() => {
        navigate(fromLocation || '/products', { replace: true });
      }, 1500);
    } catch (error) {
      showNotification("error", "Failed to process Google login");
    }
  };

  // Handle Google OAuth error
  const handleGoogleError = (error) => {
    showNotification("error", error || "Google login failed");
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
        // Use the auth context to login
        login(data.token, formData.username);
        
        showNotification("success", "Login successful! Redirecting...");
        
        // Get user role from the decoded token to determine redirect path
        const base64Url = data.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);
        const userRole = decodedToken?.role || 'CUSTOMER';
        
        // Redirect based on user role
        // Customer login should be used only by CUSTOMER accounts.
        if (userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'SUPPLIER') {
          // Warn and guide to business login if a business role tries here.
          showNotification('error', 'Please use Business Login for Admin/Staff/Supplier. Redirecting...');
          setTimeout(() => navigate('/business-login', { replace: true }), 1200);
          return;
        }
        
        setTimeout(() => {
          // Honor the original requested route if present (e.g., /products/:id)
          navigate(fromLocation || '/products', { replace: true });
        }, 1500);
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
    <AuthLayout 
      mode="signin"
      title="Welcome Back"
      subtitle="Sign in to continue shopping for quality hardware"
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Create Account"
    >
      {/* Notification */}
      {notification && (
        <div className={`
          mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 border
          ${notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800'
          }
        `}>
          {notification.type === 'success' ? (
            <div className="p-1 bg-green-100 rounded-full">
              <LogIn className="h-4 w-4 text-green-600" />
            </div>
          ) : (
            <div className="p-1 bg-red-100 rounded-full">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          )}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          icon={User}
          label="Username or Email"
          type="text"
          name="username"
          placeholder="Enter your username or email"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
        />
        
        <InputField
          icon={Lock}
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
            />
            <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700">
              Keep me signed in
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-blue-600 hover:text-purple-600 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-white
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl
            ${isLoading 
              ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed transform-none' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing you in...</span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              <span>Sign In Securely</span>
            </>
          )}
        </button>

        {/* Enhanced Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 bg-white text-sm font-medium text-gray-500 border border-gray-200 rounded-full">
              or continue with
            </span>
          </div>
        </div>

        {/* Enhanced Google OAuth Button */}
        <div className="transform transition-all duration-200 hover:scale-[1.01]">
          <GoogleOAuthButton
            type="signin"
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={isLoading}
            className="shadow-md hover:shadow-lg"
          />
        </div>
      </form>

      {/* Trust Indicators */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="h-4 w-4" />
          <span>256-bit SSL encrypted</span>
          <span>•</span>
          <span>GDPR compliant</span>
        </div>
      </div>
    </AuthLayout>
  );
}