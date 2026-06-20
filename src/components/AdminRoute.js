import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';

const hasInventoryAccess = (user) => {
  if (user?.permissions?.inventory) return true;

  const status = (user?.admin_status || '').toLowerCase();
  return status.includes('админ') || status.includes('владелец') || status.includes('заведующий складом');
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

  const canOpenAdmin = user?.permissions?.admin || user?.is_admin;
  const allowed = inventoryOnly ? hasInventoryAccess(user) : canOpenAdmin;

  if (!allowed) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default AdminRoute;
