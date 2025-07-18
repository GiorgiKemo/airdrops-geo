import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AirdropDetailPage from './pages/AirdropDetailPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordStandalone from './pages/ForgotPasswordStandalone';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AllAirdropsPage from './pages/AllAirdropsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiePage from './pages/CookiePage';
import TestPage from './pages/TestPage';
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

  console.log('AdminRoute - Current user:', user);
  console.log('AdminRoute - User role:', user?.role);
  console.log('AdminRoute - User role type:', user?.role ? typeof user.role : 'undefined');
  console.log('AdminRoute - Is admin?', user?.role === 'admin');

  // Function to check if user is admin
  const isAdmin = () => {
    if (!user) return false;
    if (typeof user.role !== 'string') return false;
    return user.role === 'admin';
  };

  console.log('AdminRoute - isAdmin() result:', isAdmin());

  if (!user) {
    console.log('AdminRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    console.log('AdminRoute - Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute - Admin access granted');
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
              <main id="main-content" className="flex-1 overflow-hidden">

                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/all" element={<AllAirdropsPage />} />
                  <Route path="/airdrops/:id" element={<AirdropDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordStandalone />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/cookies" element={<CookiePage />} />
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
