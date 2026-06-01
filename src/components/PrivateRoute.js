import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="auth-status">Проверяем профиль...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
