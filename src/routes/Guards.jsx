import { Navigate, Outlet } from 'react-router-dom';
import { isAdmin, useAuth } from '../context/AuthContext.jsx';

export function PrivateRoute() {
  const { user, checking } = useAuth();
  if (checking) return <div className="screen-center">Loading Bug Tracker...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { user } = useAuth();
  return isAdmin(user) ? <Outlet /> : <Navigate to="/projects" replace />;
}
