import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AirdropDetailPage from './pages/AirdropDetailPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AllAirdropsPage from './pages/AllAirdropsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiePage from './pages/CookiePage';
import { DarkModeProvider } from './context/DarkModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TrackingProvider } from './context/TrackingContext';
import { DisplayProvider } from './context/DisplayContext';
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <TrackingProvider>
          <DisplayProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen transition-colors duration-200 flex flex-col">
              <Navbar />
              <main className="flex-1 overflow-hidden">

                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/all" element={<AllAirdropsPage />} />
                  <Route path="/airdrops/:id" element={<AirdropDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
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
                  {/* Catch-all route to handle 404s */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
          </DisplayProvider>
        </TrackingProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App
