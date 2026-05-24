import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

const ClaimsPage = lazy(() => import('./pages/ClaimsPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InsuranceTypesPage = lazy(() => import('./pages/InsuranceTypesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const PoliciesPage = lazy(() => import('./pages/PoliciesPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

function PageLoader() {
  return (
    <main className="route-loading">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="insurance-types" element={<InsuranceTypesPage />} />
            <Route path="policies" element={<PoliciesPage />} />
            <Route path="claims" element={<ClaimsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
