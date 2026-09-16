import React, { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 Minutes Inactivity Limit

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');

  // Theme State: 'light' or 'dark' (Default is light now)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 10-Minute Inactivity Auto Logout Security
  useEffect(() => {
    if (!user) return;

    const resetInactivityTimer = () => {
      lastActivityRef.current = Date.now();
    };

    // User Interaction Activity Listeners
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));

    // Periodic Check Every 5 Seconds
    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      if (inactiveTime >= INACTIVITY_LIMIT_MS) {
        logout();
        setSessionExpiredMessage('Sesi login Anda telah kedaluwarsa karena tidak ada aktivitas selama 10 menit. Silakan login kembali.');
      }
    }, 5000);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
      clearInterval(interval);
    };
  }, [user?.id]);

  const toggleTheme = (selectedTheme) => {
    if (typeof selectedTheme === 'string') {
      setTheme(selectedTheme);
    } else {
      setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    setSessionExpiredMessage('');
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      lastActivityRef.current = Date.now();
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login gagal. Periksa username dan password Anda.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      console.error('Logout log failed:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, error, sessionExpiredMessage, setSessionExpiredMessage, login, logout, theme, toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};
