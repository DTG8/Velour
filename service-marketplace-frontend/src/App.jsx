import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import DiscoverPage from './pages/DiscoverPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import ChatsPage from './pages/ChatsPage';
import ChatDetailPage from './pages/ChatDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';

import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  const hideNav = ['/login', '/signup'].includes(location.pathname) || location.pathname.startsWith('/chat/');

  return (
    <div className="min-h-screen bg-void text-ivory selection:bg-gold/30">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Client Routes */}
          <Route path="/" element={
            <ProtectedRoute role="client">
              <DiscoverPage />
            </ProtectedRoute>
          } />
          
          <Route path="/provider/:id" element={
            <ProtectedRoute>
              <ProviderDetailPage />
            </ProtectedRoute>
          } />

          {/* Provider Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="provider">
              <ProviderDashboardPage />
            </ProtectedRoute>
          } />

          {/* Shared Protected Routes */}
          <Route path="/chats" element={
            <ProtectedRoute>
              <ChatsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/chat/:userId" element={
            <ProtectedRoute>
              <ChatDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </AnimatePresence>

      {!hideNav && <BottomNav />}
    </div>
  );
}

export default App;
