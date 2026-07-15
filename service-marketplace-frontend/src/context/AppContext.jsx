import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    socketService.disconnect();
  }, []);

  const hydrate = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
      setIsAuthenticated(true);
      socketService.connect(token);
    } catch (err) {
      console.error('Hydration failed:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    hydrate();
    
    // Listen for global auth errors (from fetchAPI)
    const handleAuthError = () => logout();
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [hydrate, logout]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('token', data.access_token);
    await hydrate();
    return data;
  };

  const signup = async (payload) => {
    const data = await api.signup(payload);
    localStorage.setItem('token', data.access_token);
    await hydrate();
    return data;
  };

  const toggleFavorite = (providerId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(providerId) ? next.delete(providerId) : next.add(providerId);
      return next;
    });
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    favorites,
    toggleFavorite,
    isProvider: user?.role === 'provider',
    isClient: user?.role === 'client',
    hydrate,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
