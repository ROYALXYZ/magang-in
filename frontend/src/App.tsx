import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RedirectIfAuth } from './components/RedirectIfAuth';
import { DashboardLayout } from './components/DashboardLayout';
import { ChatbotWidget } from './components/ChatbotWidget';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SelfDeclareSkillPage } from './pages/SelfDeclareSkillPage';
import { UploadCVPage } from './pages/UploadCVPage';
import { MatchingResultPage } from './pages/MatchingResultPage';
import { LowonganPage } from './pages/LowonganPage';
import { LamaranPage } from './pages/LamaranPage';
import { DetailLowonganPage } from './pages/DetailLowonganPage';
import { PerusahaanPage } from './pages/PerusahaanPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ProfilPage } from './pages/ProfilPage';
import { MitraLayout } from './pages/mitra/MitraLayout';
import { MitraDashboardPage } from './pages/mitra/MitraDashboardPage';
import { MitraLowonganPage } from './pages/mitra/MitraLowonganPage';
import { MitraReviewPage } from './pages/mitra/MitraReviewPage';
import { MitraProfilPage } from './pages/mitra/MitraProfilPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUserPage } from './pages/admin/AdminUserPage';
import { AdminVerifikasiPage } from './pages/admin/AdminVerifikasiPage';
import { AdminLowonganPage } from './pages/admin/AdminLowonganPage';
import { AdminLaporanPage } from './pages/admin/AdminLaporanPage';

// Layout publik dengan Navbar + Footer
function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

// Landing page content
function LandingContent() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman publik — redirect ke dashboard kalau sudah login HANYA untuk login/register */}
        <Route element={<RedirectIfAuth />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Halaman publik yang bisa diakses oleh siapa saja (login/belum login) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingContent />} />
          <Route path="/perusahaan" element={<PerusahaanPage />} />
          <Route path="/lowongan" element={<LowonganPage />} />
          <Route path="/lowongan/:id" element={<DetailLowonganPage />} />
        </Route>

        {/* Halaman dashboard pengguna (protected) */}
        <Route element={<ProtectedRoute allowedRoles={['pengguna']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/lamaran" element={<LamaranPage />} />
            <Route path="/dashboard/lowongan" element={<LowonganPage />} />
            <Route path="/dashboard/lowongan/:id" element={<DetailLowonganPage />} />
            <Route path="/dashboard/rekomendasi" element={<MatchingResultPage />} />
            <Route path="/dashboard/roadmap" element={<RoadmapPage />} />
            <Route path="/dashboard/profil" element={<ProfilPage />} />
          </Route>
        </Route>

        {/* Dashboard Mitra (protected) */}
        <Route element={<ProtectedRoute allowedRoles={['mitra']} />}>
          <Route element={<MitraLayout />}>
            <Route path="/mitra" element={<MitraDashboardPage />} />
            <Route path="/mitra/dashboard" element={<MitraDashboardPage />} />
            <Route path="/mitra/lowongan" element={<MitraLowonganPage />} />
            <Route path="/mitra/pelamar" element={<MitraReviewPage />} />
            <Route path="/mitra/profil" element={<MitraProfilPage />} />
          </Route>
        </Route>

        {/* Dashboard Admin (protected) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUserPage />} />
            <Route path="/admin/verifikasi" element={<AdminVerifikasiPage />} />
            <Route path="/admin/lowongan" element={<AdminLowonganPage />} />
            <Route path="/admin/laporan" element={<AdminLaporanPage />} />
          </Route>
        </Route>

        {/* Halaman onboarding (tanpa layout, protected) */}
        <Route path="/auth/google/callback" element={<OAuthCallbackPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding/self-declare" element={<SelfDeclareSkillPage />} />
        <Route path="/onboarding/upload-cv" element={<UploadCVPage />} />
        <Route path="/onboarding/matching" element={<MatchingResultPage />} />
      </Routes>

      {/* Chatbot Widget — muncul di semua halaman publik & user */}
      <ChatbotWidget />
    </BrowserRouter>
  );
}

export default App;
