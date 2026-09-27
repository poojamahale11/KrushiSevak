import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const getRoleDashboardPath = (role) => {
  switch (role) {
    case 'farmer':
      return '/dashboard/farmer';
    case 'customer':
      return '/dashboard/customer';
    case 'storeOwner':
      return '/dashboard/store-owner';
    default:
      return '/';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('krushisevak_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state by verifying existing token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('krushisevak_token');
      if (storedToken) {
        try {
          const response = await api.getMe();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to authenticate stored token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, role) => {
    const data = await api.login({ email, password, role });
    if (data.token && data.user) {
      localStorage.setItem('krushisevak_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error('Authentication response did not contain user or token.');
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    if (data.token && data.user) {
      localStorage.setItem('krushisevak_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error('Registration response did not contain user or token.');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('krushisevak_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    updateUser,
    logout,
    getRoleDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
