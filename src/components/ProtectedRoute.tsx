import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'mitra' | 'pengguna')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Masih ngecek token → tampilkan loading
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Belum login → redirect ke login (simpan URL tujuan asal)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Sudah login tapi role ga cocok → redirect ke dashboard sendiri
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardByRole = {
      pengguna: '/dashboard',
      mitra: '/mitra/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardByRole[user.role]} replace />;
  }

  // Semua OK → render halaman
  return <Outlet />;
}
