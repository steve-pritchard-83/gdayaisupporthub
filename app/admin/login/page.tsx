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
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 fade-in">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-secondary hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Support Hub
          </Link>
          
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-black" />
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-4">Admin Login</h1>
          <p className="text-secondary text-lg">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="alert-attention-dark">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-accent mr-3" />
                <span className="text-primary">{error}</span>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-3">
            <label htmlFor="email" className="block text-sm font-medium text-secondary">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-input"
              placeholder="Enter your email address"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-3">
            <label htmlFor="password" className="block text-sm font-medium text-secondary">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="form-input pr-10"
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
                  <EyeOff className="w-4 h-4 text-secondary" />
                ) : (
                  <Eye className="w-4 h-4 text-secondary" />
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
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
            className="text-sm text-muted hover:text-secondary underline transition-colors"
          >
            🔧 Fill test credentials (dev helper)
          </button>
        </div>

        {/* Security Notice */}
        <div className="alert-attention-dark">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-accent mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-primary">Security Notice</h3>
              <p className="text-sm text-secondary mt-1">
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