import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <span className="font-semibold text-gray-800 text-lg">AI Validation</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors rounded-xl hover:bg-white/50"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block p-6 bg-white rounded-3xl shadow-lg mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 rounded-2xl flex items-center justify-center">
                <span className="text-5xl">✓</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              AI-Powered Answer Validation
            </h1>
            <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
              Revolutionize Your Online Exam Grading
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              An AI-based solution that helps teachers validate answer sheets and complements the grading process
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                Grade hundreds of answer sheets in minutes, not hours. Save valuable time for what matters most.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Accurate & Reliable</h3>
              <p className="text-gray-600 text-sm">
                AI-powered validation ensures consistent and fair grading across all submissions.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Teacher Support</h3>
              <p className="text-gray-600 text-sm">
                Complements your expertise with intelligent suggestions and detailed analytics.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Ready to Transform Your Grading Process?
            </h2>
            <p className="text-gray-600 mb-6">
              Join educators who are already saving time and improving accuracy
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
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