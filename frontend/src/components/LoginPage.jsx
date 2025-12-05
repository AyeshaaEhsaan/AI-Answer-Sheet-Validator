// ============================================
// FILE 1: src/components/LoginPage.jsx (REPLACE EXISTING)
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: password/username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // For now, simulate successful login
    onLogin();
    navigate('/dashboard');
  };

  const handleEmailSubmit = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSignUp = async () => {
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // TODO: Call your backend API for signup
    console.log('Signing up:', { email, username, password });
    
    // Simulate successful signup
    setError('');
    onLogin();
    navigate('/dashboard');
  };

  const handleLogin = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // TODO: Call your backend API for login
    console.log('Logging in:', { email, password });
    
    // Simulate successful login
    setError('');
    onLogin();
    navigate('/dashboard');
  };

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
  };

  // Step 1: Email Entry (Both Login & Signup)
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        {/* Close Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-md transition-all"
          >
            <span className="text-gray-600 text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-12">
              <button
                onClick={() => navigate('/')}
                className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
              </button>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-gray-500 text-sm">
                {isSignUp ? 'Sign up to start grading' : 'Sign in to continue your grading journey'}
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-gray-700 rounded-2xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={() => handleSocialLogin('Apple')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 rounded-2xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>

                <button
                  onClick={() => handleSocialLogin('Microsoft')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-gray-700 rounded-2xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z"/>
                    <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                    <path fill="#7fba00" d="M1 13h10v10H1z"/>
                    <path fill="#ffb900" d="M13 13h10v10H13z"/>
                  </svg>
                  Continue with Microsoft
                </button>

                <button
                  onClick={() => handleSocialLogin('Phone')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 text-gray-700 rounded-2xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <Phone className="w-5 h-5" />
                  Continue with Phone
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">OR</span>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent transition-all"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                  onClick={handleEmailSubmit}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Continue
                </button>
              </div>

              {/* Toggle Sign Up / Login */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      resetForm();
                    }}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    {isSignUp ? 'Log in' : 'Sign up'}
                  </button>
                </p>
              </div>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-gray-400 mt-6 px-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-sm text-gray-500">
            Developed by: <span className="font-medium text-gray-600">22K-8723, 22K-4008, 22K-4056</span>
          </p>
        </footer>
      </div>
    );
  }

  // Step 2: Username & Password (Sign Up)
  if (step === 2 && isSignUp) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        {/* Close Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-md transition-all"
          >
            <span className="text-gray-600 text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
              onClick={resetForm}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Create your username and password
              </h1>
              <p className="text-gray-500 text-sm">
                Choose wisely—your username represents you in the system
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="space-y-5">
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent transition-all"
                  />
                  {username && username.length >= 3 && (
                    <p className="text-green-600 text-sm mt-2">✓ Username available</p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password && password.length >= 6 && (
                    <p className="text-green-600 text-sm mt-2">✓ Password is strong</p>
                  )}
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSignUp}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-medium shadow-md hover:shadow-lg transition-all duration-200 mt-6"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-sm text-gray-500">
            Developed by: <span className="font-medium text-gray-600">22K-8723, 22K-4008, 22K-4056</span>
          </p>
        </footer>
      </div>
    );
  }

  // Step 2: Password Only (Login)
  if (step === 2 && !isSignUp) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        {/* Close Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-md transition-all"
          >
            <span className="text-gray-600 text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
              onClick={resetForm}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Enter your password
              </h1>
              <p className="text-gray-500 text-sm">
                Logging in as: <span className="font-medium text-gray-700">{email}</span>
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="space-y-5">
                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent transition-all pr-12"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                {/* Forgot Password */}
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Forgot password?
                </button>

                {/* Submit Button */}
                <button
                  onClick={handleLogin}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-sm text-gray-500">
            Developed by: <span className="font-medium text-gray-600">22K-8723, 22K-4008, 22K-4056</span>
          </p>
        </footer>
      </div>
    );
  }
}