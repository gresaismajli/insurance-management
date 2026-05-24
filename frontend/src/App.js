import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ClaimsPage from './pages/ClaimsPage';
import ClientsPage from './pages/ClientsPage';
import DashboardPage from './pages/DashboardPage';
import InsuranceTypesPage from './pages/InsuranceTypesPage';
import LoginPage from './pages/LoginPage';
import PaymentsPage from './pages/PaymentsPage';
import PoliciesPage from './pages/PoliciesPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
    </BrowserRouter>
  );
}

export default App;
