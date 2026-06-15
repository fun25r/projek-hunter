import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as apiLogin, adminLogout as apiLogout, getAdminMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      getAdminMe()
        .then(({ data }) => setAdmin(data))
        .catch(() => localStorage.removeItem('admin_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    localStorage.setItem('admin_token', data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      admin, loading, isAuthenticated: !!admin,
      login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
