'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AdminCredentials } from '@/types/admin';
import { authenticateAdmin, isAdminAuthenticated } from '@/utils/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<AdminCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 🔧 BASIC VALIDATION - Keep it simple but effective
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const success = authenticateAdmin(credentials);
      
      if (success) {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AdminCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Pre-fill credentials for easier testing (remove in production)
  const fillTestCredentials = () => {
    setCredentials({
      email: 'steve.pritchard@discoveryparks.com.au',
      password: '123456',
    });
  };

  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-grey-600 hover:text-grey-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Support Hub
          </Link>
          
                                 <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
         <Shield className="w-8 h-8 text-white" />
        </div>
          
          <h1 className="text-3xl font-bold text-grey-900">Admin Login</h1>
          <p className="text-grey-600 mt-2">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="card">
          {/* Error Alert */}
          {error && (
                                     <div className="bg-accent border border-accent-dark rounded-lg p-4 mb-6">
          <div className="flex items-center">
           <AlertCircle className="w-5 h-5 text-white mr-2" />
           <span className="text-black">{error}</span>
          </div>
        </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-grey-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-grey-300 rounded-lg focus-ring"
              placeholder="Enter your email address"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-grey-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-grey-300 rounded-lg focus-ring"
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-grey-400" />
                ) : (
                  <Eye className="w-4 h-4 text-grey-400" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-grey-900 mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Sign in to Admin
              </>
            )}
          </button>
        </form>

        {/* Development Helper */}
        <div className="text-center">
          <button
            type="button"
            onClick={fillTestCredentials}
            className="text-sm text-grey-500 hover:text-grey-700 underline"
          >
            🔧 Fill test credentials (dev helper)
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">Security Notice</h3>
              <p className="text-sm text-amber-700 mt-1">
                This is a development environment with hardcoded credentials. 
                In production, implement proper authentication and authorization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 