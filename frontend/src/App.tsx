import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './data/api/AppContext';
import { AuthProvider } from './modules/auth/context/AuthContext';
import AppRoutes from './common/routes/routes';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
