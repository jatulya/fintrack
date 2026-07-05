import { Routes, Route, Navigate } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from '../../modules/auth/ui/ProtectedRoute';
import { LoginView } from '../../modules/auth/ui/LoginView';
import { RegisterView } from '../../modules/auth/ui/SignUpView';
import DashboardLayout from '../../modules/dashboard/DashboardLayout';
import { routes } from './routePaths';
import { paths } from './paths';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={paths.login} element={<GuestRoute><LoginView /></GuestRoute>} />
      <Route path={paths.register} element={<GuestRoute><RegisterView /></GuestRoute>} />
      {routes.map(({ path, element: Page }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Page />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="*" element={<Navigate to={paths.login} replace />} />
    </Routes>
  );
}
