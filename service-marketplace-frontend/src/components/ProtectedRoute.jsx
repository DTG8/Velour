import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isLoading, user } = useApp();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-gold animate-spin" />
        <p className="text-ash text-xs uppercase tracking-widest animate-pulse">Authenticating…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to home if they have the wrong role (e.g. provider trying to access client home)
    return <Navigate to={user?.role === 'provider' ? '/dashboard' : '/'} replace />;
  }

  return children;
}
