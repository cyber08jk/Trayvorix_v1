import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@contexts/AuthContext';
import { ToastProvider } from '@components/common/Toast';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { Layout } from '@components/layout/Layout';
import { Login } from '@pages/Login';
import { ForgotPassword } from '@pages/ForgotPassword';
import { ResetPassword } from '@pages/ResetPassword';
import { Dashboard } from '@pages/Dashboard';
import { TestConnection } from '@pages/TestConnection';
import { DemoLogin } from '@pages/DemoLogin';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

import { Products } from '@pages/Products';

// Placeholder pages

function Inventory() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1></div>;
}

function Warehouses() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouses</h1></div>;
}

function Transfers() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfers</h1></div>;
}

function Movements() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Movements</h1></div>;
}

function Adjustments() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Adjustments</h1></div>;
}

function Reports() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1></div>;
}

function Audit() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1></div>;
}

function Tasks() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1></div>;
}

function Settings() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1></div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<DemoLogin />} />
              <Route path="/demo" element={<DemoLogin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/test-connection" element={<TestConnection />} />

              {/* Protected routes with layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Layout><Products /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <Layout><Inventory /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/warehouses"
                element={
                  <ProtectedRoute>
                    <Layout><Warehouses /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transfers"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'operator']}>
                    <Layout><Transfers /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/movements"
                element={
                  <ProtectedRoute>
                    <Layout><Movements /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/adjustments"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'operator']}>
                    <Layout><Adjustments /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Layout><Reports /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'auditor']}>
                    <Layout><Audit /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'operator']}>
                    <Layout><Tasks /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout><Settings /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* Demo dashboard - no auth required */}
              <Route
                path="/demo-dashboard"
                element={
                  <Layout><Dashboard /></Layout>
                }
              />
              
              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">Page not found</p>
                      <a href="/dashboard" className="text-primary-600 hover:text-primary-500">
                        Go to Dashboard
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
