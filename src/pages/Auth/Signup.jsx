import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Shield, AlertCircle, Loader2, UserPlus, Eye, EyeOff, Check, Star } from "lucide-react";
import GoogleOAuthButton from "../../components/GoogleOAuthButton";
import AuthLayout from "../../components/AuthLayout";

const InputField = ({ icon: Icon, label, error, type = "text", showPassword, onTogglePassword, ...props }) => (
  <div className="space-y-1 sm:space-y-2">
    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
          error 
            ? 'text-red-500' 
            : 'text-gray-400 group-focus-within:text-blue-600'
        }`} />
      </div>
      <input
        type={type}
        {...props}
        className={`
          block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl shadow-sm bg-white text-sm sm:text-base
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
          className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:bg-gray-100 rounded-r-lg sm:rounded-r-xl transition-colors min-w-[44px] justify-center"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
      
      {/* Focus ring effect */}
      <div className={`absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-200 ${
        error ? '' : 'group-focus-within:border-blue-200 group-focus-within:shadow-lg'
      } pointer-events-none`}></div>
    </div>
    {error && (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 px-2 sm:px-3 py-2 rounded-lg">
        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);



export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  // Customer-only signup. Business roles are created by Admin.

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Role is fixed to CUSTOMER
    
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
      showNotification("success", "Google account created successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      showNotification("error", "Failed to process Google signup");
    }
  };

  // Handle Google OAuth error
  const handleGoogleError = (error) => {
    showNotification("error", error || "Google signup failed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification("error", "Please fix the errors below");
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'CUSTOMER'
      };

      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok && data.message) {
        showNotification("success", "Account created successfully! Redirecting to login...");
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      mode="signup"
      title="Join Athukorala Traders"
      subtitle="Create your account and start shopping premium hardware"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign In"
    >
      {/* Notification */}
      {notification && (
        <div className={`
          mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 animate-in slide-in-from-top-2 duration-300 border
          ${notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800'
          }
        `}>
          {notification.type === 'success' ? (
            <div className="p-1 bg-green-100 rounded-full">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
          ) : (
            <div className="p-1 bg-red-100 rounded-full">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            </div>
          )}
          <span className="font-semibold text-xs sm:text-sm">{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
        <InputField
          icon={User}
          label="Username"
          type="text"
          name="username"
          placeholder="Choose a unique username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
        />

        <InputField
          icon={Mail}
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <InputField
            icon={Lock}
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <InputField
            icon={Lock}
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        {/* Account Type Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-3 sm:p-4 rounded-lg sm:rounded-xl">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1 bg-blue-100 rounded-full flex-shrink-0">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">Customer Account</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Perfect for shopping our extensive hardware collection. Business accounts (Admin/Staff/Supplier) are created through Business Portal.
              </p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-2 sm:gap-3">
          <input
            id="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors flex-shrink-0"
          />
          <label htmlFor="terms" className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            I agree to the{" "}
            <Link to="/terms" className="font-semibold text-blue-600 hover:text-purple-600 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-semibold text-blue-600 hover:text-purple-600 transition-colors">
              Privacy Policy
            </Link>
            , and consent to receive promotional emails about new products and offers.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-white text-sm sm:text-base
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
            transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl min-h-[44px]
            ${isLoading 
              ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed transform-none' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <Star className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Create My Account</span>
            </>
          )}
        </button>

        {/* Enhanced Divider */}
        <div className="relative my-4 sm:my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 sm:px-6 bg-white text-xs sm:text-sm font-medium text-gray-500 border border-gray-200 rounded-full">
              or sign up with
            </span>
          </div>
        </div>

        {/* Enhanced Google OAuth Button */}
        <div className="transform transition-all duration-200 hover:scale-[1.01]">
          <GoogleOAuthButton
            type="signup"
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={isLoading}
            className="shadow-md hover:shadow-lg"
          />
        </div>
      </form>

      {/* Trust Indicators */}
      <div className="mt-4 sm:mt-6 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Your data is protected</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>No spam guarantee</span>
        </div>
      </div>
    </AuthLayout>
  );
}