
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '../types';
import { api } from './apiClient';

interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const user = await api.auth.me();
      setState({ user, accessToken: token, isLoading: false });
    } catch (err) {
      localStorage.removeItem('accessToken');
      setState({ user: null, accessToken: null, isLoading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: any) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { accessToken, user } = await api.auth.login(credentials);
      localStorage.setItem('accessToken', accessToken);
      setState({ user, accessToken, isLoading: false });
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setState({ user: null, accessToken: null, isLoading: false });
    api.auth.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
