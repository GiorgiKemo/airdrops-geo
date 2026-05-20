import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Core components loaded immediately
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy-loaded components
const HomePage = lazy(() => import('./pages/HomePage'));
const AirdropDetailPage = lazy(() => import('./pages/AirdropDetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordStandalone = lazy(() => import('./pages/ForgotPasswordStandalone'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AllAirdropsPage = lazy(() => import('./pages/AllAirdropsPage'));
const ClaimPage = lazy(() => import('./pages/ClaimPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CookiePage = lazy(() => import('./pages/CookiePage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TestPage = lazy(() => import('./pages/TestPage'));
import { DarkModeProvider } from './context/DarkModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TrackingProvider } from './context/TrackingContext';
import { DisplayProvider } from './context/DisplayContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

// Protected route component for any authenticated user
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protected route component for admin users only
const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  // Function to check if user is admin
  const isAdmin = () => {
    if (!user) return false;
    if (typeof user.role !== 'string') return false;
    return user.role === 'admin';
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <HelmetProvider>
      <DarkModeProvider>
        <AuthProvider>
          <TrackingProvider>
            <DisplayProvider>
              <ToastProvider>
            <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen transition-colors duration-200 flex flex-col">
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded shadow"
              >
                Skip to main content
              </a>
              <Navbar />
              <main id="main-content" className="flex-1 overflow-visible pt-24">

                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/all" element={<AllAirdropsPage />} />
                    <Route path="/airdrops/:id" element={<AirdropDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordStandalone />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/claim" element={<ClaimPage />} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/cookies" element={<CookiePage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/test"
                      element={
                        <AdminRoute>
                          <TestPage />
                        </AdminRoute>
                      }
                    />
                    {/* Catch-all route to handle 404s */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
              </ToastProvider>
            </DisplayProvider>
          </TrackingProvider>
        </AuthProvider>
      </DarkModeProvider>
    </HelmetProvider>
  );
}

export default App
