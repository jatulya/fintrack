import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './LoginView';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
