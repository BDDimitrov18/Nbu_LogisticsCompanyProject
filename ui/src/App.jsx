import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Employees from './pages/Employees';
import Clients from './pages/Clients';
import Offices from './pages/Offices';
import Cargo from './pages/Cargo';
import NewCargo from './pages/NewCargo';
import Reports from './pages/Reports';
import ReportsEmployees from './pages/ReportsEmployees';
import ReportsClients from './pages/ReportsClients';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
          <ConfirmProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Companies - Everyone can see */}
              <Route path="companies" element={<Companies />} />

              {/* Employees, Clients, Offices - Everyone can see (data filtered by association) */}
              <Route path="employees" element={<Employees />} />
              <Route path="clients" element={<Clients />} />
              <Route path="offices" element={<Offices />} />

              {/* Cargo routes - all authenticated users can view */}
              <Route path="cargo" element={<Cargo />} />

              {/* New cargo - Only Admin or Office employees can create */}
              <Route
                path="cargo/new"
                element={
                  <ProtectedRoute requireCanManageCargo>
                    <NewCargo />
                  </ProtectedRoute>
                }
              />

              {/* Reports routes */}
              <Route path="reports" element={<Reports />} />
              <Route
                path="reports/employees"
                element={
                  <ProtectedRoute requireEmployee>
                    <ReportsEmployees />
                  </ProtectedRoute>
                }
              />
              <Route path="reports/clients" element={<ReportsClients />} />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </ConfirmProvider>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
