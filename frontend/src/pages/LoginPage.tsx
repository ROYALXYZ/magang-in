import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import styles from './LoginPage.module.css';
import loginBg from '../assets/login-bg.png';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Redirect berdasarkan role user
  const redirectByRole = (role: string, hasCompletedOnboarding?: boolean) => {
    switch (role) {
      case 'mitra':
        navigate('/mitra/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        if (hasCompletedOnboarding) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      const { token, _id, name: userName, email: userEmail, role, profileImage, hasCompletedOnboarding } = response.data;

      // Simpan token & set user di AuthContext
      login(token, {
        id: _id,
        name: userName,
        email: userEmail,
        role: role as 'admin' | 'mitra' | 'pengguna',
        phone: null,
        address: null,
        education: null,
        institution: null,
        profileImage,
      });

      // Redirect sesuai role
      redirectByRole(role, hasCompletedOnboarding);
    } catch (err: unknown) {
      // Tampilkan error dari backend
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Login gagal. Coba lagi.');
      } else {
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${baseUrl}/auth/google`;
  };

  return (
    <div className={styles.page}>
      {/* Back button */}
      <button className={styles.backBtn} onClick={() => navigate('/')} aria-label="Back to home">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Kembali
      </button>

      <div className={styles.card}>

        {/* Left Panel */}
        <div className={styles.left} style={{ backgroundImage: `linear-gradient(145deg, rgba(55, 48, 163, 0.85) 0%, rgba(79, 70, 229, 0.75) 50%, rgba(99, 102, 241, 0.7) 100%), url(${loginBg})` }}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}></span>
            <span className={styles.brandName}>Magang-in</span>
          </div>

          <div className={styles.leftContent}>
            <h2 className={styles.leftTitle}>
              Perjalanan Karier Anda,<br />Dipercepat oleh AI.
            </h2>
            <p className={styles.leftDesc}>
             Bergabunglah dengan ribuan mahasiswa yang mendapatkan magang berdampak tinggi
melalui mesin pencocokan cerdas kami. Kami menghubungkan keterampilan Anda dengan tim teknologi paling inovatif di dunia.
            </p>
          </div>

          <div className={styles.trusted}>
            <div className={styles.trustedAvatars}>
              {['#6366f1', '#8b5cf6', '#a78bfa'].map((c, i) => (
                <div key={i} className={styles.trustedAvatar} style={{ background: c }} />
              ))}
            </div>
            <span>Trusted by 10k+ Tech Interns</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className={styles.right}>
          <div>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Akses dashboard magang Anda yang didukung Oleh AI</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                className={styles.input}
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0' }}>{error}</p>
            )}

            <div className={styles.row}>
              <label className={styles.checkLabel}>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className={styles.forgot}>Forgot password?</a>
            </div>

            <button type="submit" className={styles.btnSignIn} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>Or continue with</span>
          </div>

          <div className={styles.socialBtns}>
            <button className={styles.socialBtn} onClick={handleGoogleLogin} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className={styles.register}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.registerLink}>Sign up for free</Link>
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className={styles.pageFooter}>
        <span>Magang-in Platform © 2026. Empowering next-gen tech talent.</span>
        <div className={styles.footerLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
