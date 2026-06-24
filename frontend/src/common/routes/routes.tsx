import { Routes, Route, Navigate } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from '../../modules/auth/ui/ProtectedRoute';
import { LoginView } from '../../modules/auth/ui/LoginView';
import { RegisterView } from '../../modules/auth/ui/SignUpView';
import DashboardLayout from '../../modules/dashboard/DashboardLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GuestRoute><LoginView /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterView /></GuestRoute>} />
      <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}