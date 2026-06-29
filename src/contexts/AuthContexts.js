import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { clearAuthToken, setAuthToken } from '../api/api';

const AuthContext = createContext(null);

const readToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const writeToken = (token) => {
  setAuthToken(token);

  try {
    localStorage.setItem('token', token);
  } catch {
    // The API client keeps an in-memory token for this browser session.
  }
};

const removeToken = () => {
  clearAuthToken();

  try {
    localStorage.removeItem('token');
  } catch {
    // Storage can be unavailable in private or restricted browser modes.
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = readToken();

    if (!token) {
      setInitializing(false);
      return;
    }

    setAuthToken(token);

    api.get('/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        removeToken();
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const refreshUser = async () => {
    const res = await api.get('/me');
    setUser(res.data.user);
    return res.data.user;
  };

  const login = async (credentials) => {
    const res = await api.post('/login', credentials);
    writeToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/register', data);
    writeToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const updateProfile = async (data) => {
    const res = await api.put('/profile', data);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } finally {
      removeToken();
      setUser(null);
    }
  };

  const value = useMemo(() => ({
    user,
    initializing,
    isAuthenticated: Boolean(user),
    login,
    register,
    updateProfile,
    refreshUser,
    logout,
  }), [user, initializing]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
