import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wrapper untuk halaman publik (landing, login, register).
 * Kalau user sudah login, otomatis redirect ke dashboard.
 */
export function RedirectIfAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
