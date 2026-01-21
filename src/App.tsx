import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@contexts/AuthContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import { DemoProvider } from '@contexts/DemoContext';
import { CurrencyProvider } from '@contexts/CurrencyContext';
import { ToastProvider } from '@components/common/Toast';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { SessionTimeoutHandler } from '@components/auth/SessionTimeoutHandler';
import { Layout } from '@components/layout/Layout';
import { Login } from '@pages/Login';
import { ForgotPassword } from '@pages/ForgotPassword';
import { ResetPassword } from '@pages/ResetPassword';
import { Dashboard } from '@pages/Dashboard';
import { TestConnection } from '@pages/TestConnection';
import { DemoLogin } from '@pages/DemoLogin';
import { Warehouses } from '@pages/Warehouses';
import { Profile } from '@pages/Profile';
import { Analytics } from '@pages/Analytics';
import { RequestAccess } from '@pages/RequestAccess';
import { AccessRequests } from '@pages/AccessRequests';
import { Users } from '@pages/Users';
import { Reports } from '@pages/Reports';


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
import { Receipts } from '@pages/Receipts';
import { Deliveries } from '@pages/Deliveries';
import { Invoices } from '@pages/Invoices';
import { Adjustments } from '@pages/Adjustments';
import { MoveHistory } from '@pages/MoveHistory';
import { Inventory } from '@pages/Inventory';
import { Settings } from '@pages/Settings';
import { AuditLogs } from '@pages/AuditLogs';

function Tasks() {
  return <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1></div>;
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SessionTimeoutHandler />
          <ThemeProvider>
            <DemoProvider>
              <CurrencyProvider>
                <ToastProvider>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Login />} />
                    <Route path="/demo" element={<DemoLogin />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/test-connection" element={<TestConnection />} />
                    <Route path="/request-access" element={<RequestAccess />} />



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
                      path="/receipts"
                      element={
                        <ProtectedRoute>
                          <Layout><Receipts /></Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/deliveries"
                      element={
                        <ProtectedRoute>
                          <Layout><Deliveries /></Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/invoices"
                      element={
                        <ProtectedRoute>
                          <Layout><Invoices /></Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/movements"
                      element={
                        <ProtectedRoute>
                          <Layout><MoveHistory /></Layout>
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
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Layout><Profile /></Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute>
                          <Layout><Analytics /></Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <Layout><Analytics /></Layout>
                        </ProtectedRoute>
                      }


                    />
                    <Route
                      path="/audit"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'auditor']}>
                          <Layout><AuditLogs /></Layout>
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
                    <Route
                      path="/access-requests"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <Layout><AccessRequests /></Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <Layout><Users /></Layout>
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

                    {/* Demo routes - no auth required */}
                    <Route
                      path="/demo-dashboard"
                      element={
                        <Layout><Dashboard /></Layout>
                      }
                    />
                    <Route
                      path="/demo-products"
                      element={
                        <Layout><Products /></Layout>
                      }
                    />
                    <Route
                      path="/demo-warehouses"
                      element={
                        <Layout><Warehouses /></Layout>
                      }
                    />
                    <Route
                      path="/demo-receipts"
                      element={
                        <Layout><Receipts /></Layout>
                      }
                    />
                    <Route
                      path="/demo-deliveries"
                      element={
                        <Layout><Deliveries /></Layout>
                      }
                    />
                    <Route
                      path="/demo-movements"
                      element={
                        <Layout><MoveHistory /></Layout>
                      }
                    />
                    <Route
                      path="/demo-adjustments"
                      element={
                        <Layout><Adjustments /></Layout>
                      }
                    />
                    <Route
                      path="/demo-invoices"
                      element={
                        <Layout><Invoices /></Layout>
                      }
                    />
                    <Route
                      path="/demo-profile"
                      element={
                        <Layout><Profile /></Layout>
                      }
                    />
                    <Route
                      path="/demo-analytics"
                      element={
                        <Layout><Analytics /></Layout>
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
              </CurrencyProvider>
            </DemoProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
