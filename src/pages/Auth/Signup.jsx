import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Loader2, Shield, Hammer } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";


export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }
    
    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }
    
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };
    
    // Auto-generate username from firstname and lastname
    if (name === 'firstname' || name === 'lastname') {
      const first = name === 'firstname' ? value : formData.firstname;
      const last = name === 'lastname' ? value : formData.lastname;
      if (first && last) {
        updatedData.username = `${first.toLowerCase()}.${last.toLowerCase()}`;
      }
    }
    
    setFormData(updatedData);
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Google OAuth
  const handleGoogleSignup = async () => {
    try {
      showNotification("info", "Google OAuth coming soon!");
    } catch (error) {
      showNotification("error", "Google signup failed");
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
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'CUSTOMER'
      };

      console.log('Signup data:', { ...signupData, password: '***' });
      console.log('✅ Your username will be:', signupData.username);

      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok && data.message) {
        console.log('✅ Signup successful! Username:', signupData.username);
        showNotification("success", `Account created! Login with username: ${signupData.username}`);
        
        setTimeout(() => {
          navigate("/login", { state: { username: signupData.username } });
        }, 3000);
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
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&h=1080&fit=crop"
          alt="Power tools background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/95 via-purple-50/90 to-zinc-50/95" />
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
              Create a Tailark Account
            </h1>
            <p className="text-sm text-gray-600">
              Welcome! Create an account to get started
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
              onClick={handleGoogleSignup}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="block text-sm">
                  Firstname
                </Label>
                <Input
                  type="text"
                  required
                  name="firstname"
                  id="firstname"
                  placeholder="John"
                  value={formData.firstname}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.firstname && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstname}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="block text-sm">
                  Lastname
                </Label>
                <Input
                  type="text"
                  required
                  name="lastname"
                  id="lastname"
                  placeholder="Doe"
                  value={formData.lastname}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.lastname && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastname}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="block text-sm">
                Username
              </Label>
              <Input
                type="text"
                required
                name="username"
                id="username"
                placeholder="john.doe"
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
              <p className="text-xs text-gray-500">
                Auto-generated from your name. You can customize it.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
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
                placeholder="Create a strong password"
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

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Continue
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-b-[calc(var(--radius)+.125rem)] border-t bg-zinc-50 p-3">
          <p className="text-center text-sm text-gray-700">
            Have an account?
            <Button asChild variant="link" className="px-2">
              <Link to="/login">Sign In</Link>
            </Button>
          </p>
        </div>
      </form>

      {/* Trust Indicators */}
      <div className="fixed bottom-4 left-0 right-0 flex items-center justify-center gap-2 text-xs text-gray-500 z-10">
        <Shield className="h-3 w-3" />
        <span>Your data is protected</span>
        <span>•</span>
        <span>No spam guarantee</span>
      </div>
    </section>
  );
}