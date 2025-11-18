import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AlertCircle, Loader2, Shield, Hammer } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Auto-fill username if coming from signup
  const [formData, setFormData] = useState({
    username: location.state?.username || "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Intended destination from PrivateRoute
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

  // Handle Google OAuth - simplified for new design
  const handleGoogleLogin = async () => {
    try {
      showNotification("info", "Google OAuth coming soon!");
    } catch (error) {
      showNotification("error", "Google login failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification("error", "Please fix the errors below");
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
      console.log('Login attempt:', { username: formData.username, hasPassword: !!formData.password });
      console.log('API URL:', `${API_BASE}/api/auth/login`);
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok && data.token) {
        // Use the auth context to login with all user data from backend
        login(data.token, formData.username, data.role, {
          userId: data.userId,
          email: data.email
        });
        
        showNotification("success", "Login successful! Redirecting...");
        
        // Get user role from response or decode token
        const userRole = data.role || (() => {
          const base64Url = data.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decodedToken = JSON.parse(jsonPayload);
          return decodedToken?.role || 'CUSTOMER';
        })();
        
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
      const errorMessage = err.message.includes("Invalid username or password") 
        ? "Invalid credentials. Don't have an account? Sign up to get started!"
        : err.message || "Login failed. Please try again.";
      showNotification("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920&h=1080&fit=crop"
          alt="Hardware tools background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/95 via-blue-50/90 to-zinc-50/95" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-white p-0.5 shadow-md relative z-10"
      >
        <div className="p-8 pb-6">
          <div>
            <Link
              to="/"
              aria-label="go home"
              className="inline-flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Hammer className="h-6 w-6" />
              <span className="font-bold text-lg">Athukorala Traders</span>
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to continue shopping for quality hardware
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
                notification.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : notification.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-blue-200 bg-blue-50 text-blue-800'
              }`}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{notification.message}</span>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                />
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                />
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                />
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                />
              </svg>
              <span>Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 256 256"
              >
                <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z" />
                <path fill="#80cc28" d="M256 121.666H134.335V0H256z" />
                <path
                  fill="#00adef"
                  d="M121.663 256.002H0V134.336h121.663z"
                />
                <path
                  fill="#fbbc09"
                  d="M256 256.002H134.335V134.336H256z"
                />
              </svg>
              <span>Microsoft</span>
            </Button>
          </div>

          <hr className="my-4 border-dashed" />

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="block text-sm">
                Username or Email
              </Label>
              <Input
                type="text"
                required
                name="username"
                id="username"
                placeholder="Enter username (e.g., john.doe)"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <Input
                type="password"
                required
                name="password"
                id="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-gray-700">
                  Keep me signed in
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot?
              </Link>
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-b-[calc(var(--radius)+.125rem)] border-t bg-zinc-50 p-3">
          <p className="text-center text-sm text-gray-700">
            Don't have an account?
            <Button asChild variant="link" className="px-2">
              <Link to="/signup">Create Account</Link>
            </Button>
          </p>
        </div>
      </form>

      {/* Trust Indicators */}
      <div className="fixed bottom-4 left-0 right-0 flex items-center justify-center gap-2 text-xs text-gray-500 z-10">
        <Shield className="h-3 w-3" />
        <span>256-bit SSL encrypted</span>
        <span>•</span>
        <span>GDPR compliant</span>
      </div>
    </section>
  );
}