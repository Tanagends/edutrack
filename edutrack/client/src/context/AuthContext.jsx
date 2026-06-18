import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('edutrack_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount, re-validate token against /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem('edutrack_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('edutrack_user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('edutrack_token');
        localStorage.removeItem('edutrack_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('edutrack_token', data.token);
    localStorage.setItem('edutrack_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('edutrack_token', data.token);
    localStorage.setItem('edutrack_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('edutrack_token');
    localStorage.removeItem('edutrack_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
