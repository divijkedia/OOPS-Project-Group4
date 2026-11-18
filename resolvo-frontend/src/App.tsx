import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

// Critical Public Pages (eagerly loaded for instant first render)
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { NotFoundPage } from './features/common/NotFoundPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Lazy-loaded routes (chunked on-demand to reduce initial load by ~80%)
const StyleGuidePage = React.lazy(() => import('./features/styleguide/StyleGuidePage').then((m) => ({ default: m.StyleGuidePage })));
const EmployeeDashboardPage = React.lazy(() => import('./features/employee/EmployeeDashboardPage').then((m) => ({ default: m.EmployeeDashboardPage })));
const ReportIncidentPage = React.lazy(() => import('./features/employee/ReportIncidentPage').then((m) => ({ default: m.ReportIncidentPage })));
const MyIncidentsPage = React.lazy(() => import('./features/employee/MyIncidentsPage').then((m) => ({ default: m.MyIncidentsPage })));
const IncidentDetailPage = React.lazy(() => import('./features/employee/IncidentDetailPage').then((m) => ({ default: m.IncidentDetailPage })));
const TechnicianDashboardPage = React.lazy(() => import('./features/technician/TechnicianDashboardPage').then((m) => ({ default: m.TechnicianDashboardPage })));
const TechnicianIncidentsPage = React.lazy(() => import('./features/technician/TechnicianIncidentsPage').then((m) => ({ default: m.TechnicianIncidentsPage })));
const TechnicianIncidentDetailPage = React.lazy(() => import('./features/technician/TechnicianIncidentDetailPage').then((m) => ({ default: m.TechnicianIncidentDetailPage })));
const AdminDashboardPage = React.lazy(() => import('./features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminIncidentsPage = React.lazy(() => import('./features/admin/AdminIncidentsPage').then((m) => ({ default: m.AdminIncidentsPage })));
const AdminUsersPage = React.lazy(() => import('./features/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminServicesPage = React.lazy(() => import('./features/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage })));
const AdminStrategyPage = React.lazy(() => import('./features/admin/AdminStrategyPage').then((m) => ({ default: m.AdminStrategyPage })));
const AdminAuditPage = React.lazy(() => import('./features/admin/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <React.Suspense
                fallback={
                  <div className="min-h-screen app-royal-bg flex flex-col items-center justify-center text-white p-4">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-pink border-t-transparent animate-spin mb-3" />
                    <span className="text-xs font-semibold text-slate-300">Loading enterprise module...</span>
                  </div>
                }
              >
                <Routes>
                  {/* Public Marketing & System Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/_styleguide" element={<StyleGuidePage />} />
                  <Route path="/ui-kit" element={<StyleGuidePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected Employee Portal Routes */}
                  <Route
                    path="/employee"
                    element={
                      <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                        <AppShell />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<EmployeeDashboardPage />} />
                    <Route path="report" element={<ReportIncidentPage />} />
                    <Route path="incidents" element={<MyIncidentsPage />} />
                    <Route path="incidents/:id" element={<IncidentDetailPage />} />
                  </Route>

                  {/* Protected Technician Console Routes */}
                  <Route
                    path="/technician"
                    element={
                      <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}>
                        <AppShell />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<TechnicianDashboardPage />} />
                    <Route path="incidents" element={<TechnicianIncidentsPage />} />
                    <Route path="incidents/:id" element={<TechnicianIncidentDetailPage />} />
                  </Route>

                  {/* Protected Administrator Suite Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AppShell />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="incidents" element={<AdminIncidentsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="services" element={<AdminServicesPage />} />
                    <Route path="strategy" element={<AdminStrategyPage />} />
                    <Route path="audit" element={<AdminAuditPage />} />
                  </Route>

                  {/* 404 Catch-All Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </React.Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
