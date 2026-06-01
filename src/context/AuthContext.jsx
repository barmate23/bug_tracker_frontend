import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('bugtrack-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        sessionStorage.setItem('bugtrack-user', JSON.stringify(res.data));
      })
      .catch(() => {
        setUser(null);
        sessionStorage.removeItem('bugtrack-user');
      })
      .finally(() => setChecking(false));
  }, []);

  const value = useMemo(() => ({
    user,
    checking,
    async login(username, password) {
      const res = await api.post('/auth/login', { username, password });
      setUser(res.data);
      sessionStorage.setItem('bugtrack-user', JSON.stringify(res.data));
      return res.data;
    },
    async logout() {
      await api.post('/auth/logout');
      setUser(null);
      sessionStorage.removeItem('bugtrack-user');
    }
  }), [user, checking]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function isAdmin(user) {
  return user?.role?.toUpperCase() === 'ADMIN';
}
