import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';

const hasInventoryAccess = (user) => {
  const status = (user?.admin_status || '').toLowerCase();
  return status.includes('админ') || status.includes('заведующий складом');
};

const AdminRoute = ({ children, inventoryOnly = false }) => {
  const { isAuthenticated, initializing, user } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="auth-status">Проверяем права администратора...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (inventoryOnly ? !hasInventoryAccess(user) : !user?.is_admin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default AdminRoute;
