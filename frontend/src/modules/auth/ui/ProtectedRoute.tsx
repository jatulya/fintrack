import { Navigate } from 'react-router-dom';
import { paths } from '../../../common/routes/paths';
import { useAuth } from '../context/AuthContext';
import { AuthLoadingScreen } from './AuthLayout';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace />;
  }

  return <>{children}</>;
};

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <>{children}</>;
};
