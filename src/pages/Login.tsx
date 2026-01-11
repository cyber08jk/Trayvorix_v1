import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { LoginForm } from '@components/auth/LoginForm';

export function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundImage: "url('/login-bg.png')" }}>
      {/* Request Access Button - Top Right Corner */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => navigate('/request-access')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 border-2 border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Request Access
        </button>
      </div>

      {/* Animated background elements */}
      {/* Animated background elements - Removed for image background */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img src="/logo.png" alt="Trayvorix Logo" className="w-24 h-24 transform hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-white drop-shadow-lg custom-text-shadow">
            Welcome Back
          </h2>
          <p className="mt-3 text-base text-gray-100 drop-shadow-md font-medium">
            Sign in to manage your inventory
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <LoginForm />
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Credentials:
          </p>
          <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <p><strong>Admin:</strong> admin@trayvorix.com / admin123</p>
          </div>
        </div>

        {/* Demo Mode Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/demo')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Try Demo Mode (No Login Required)
          </button>
        </div>\


        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-200 drop-shadow-sm">
            Built for efficient warehouse management
          </p>
          <p className="text-xs">
            <a href="/test-connection" className="text-white hover:text-gray-200 drop-shadow-sm underline decoration-white/50 hover:decoration-white">
              Having connection issues? Test your setup →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
