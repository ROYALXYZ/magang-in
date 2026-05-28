import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      // Kalau ga ada token di URL → redirect ke login dengan error
      if (!token) {
        navigate('/login?error=oauth_failed');
        return;
      }

      try {
        // Simpan token dulu supaya request profile bisa pakai token ini
        localStorage.setItem('token', token);

        // Ambil profil user dari backend
        const response = await authService.getProfile();
        const user = response.data;

        // Set auth state
        login(token, user);

        // Redirect sesuai role
        switch (user.role) {
          case 'mitra':
            navigate('/mitra/dashboard', { replace: true });
            break;
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          default: {
            // Cek apakah user sudah punya skill (sudah onboarding)
            try {
              const skillRes = await import('../services/skill.service').then(m => m.skillService.getMySkills());
              if (skillRes.data && skillRes.data.length > 0) {
                navigate('/dashboard', { replace: true });
              } else {
                navigate('/onboarding', { replace: true });
              }
            } catch {
              navigate('/onboarding', { replace: true });
            }
          }
        }
      } catch {
        // Gagal ambil profil — token invalid
        localStorage.removeItem('token');
        setError('Gagal memverifikasi akun. Silakan coba lagi.');
        setTimeout(() => navigate('/login?error=oauth_failed'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '16px',
    }}>
      {error ? (
        <p style={{ color: '#ef4444', fontSize: '16px' }}>{error}</p>
      ) : (
        <>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Memverifikasi akun Google Anda...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  );
}
