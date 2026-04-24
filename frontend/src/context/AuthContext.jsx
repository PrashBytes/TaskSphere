import { createContext, useContext, useEffect, useState } from 'react';

import { login, signup } from '../services/authService';

const STORAGE_KEY = 'tasksphere_auth';
const AuthContext = createContext(null);

const readStoredAuth = () => {
  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return { token: null, user: null };
  }

  try {
    return JSON.parse(storedValue);
  } catch (_error) {
    window.localStorage.removeItem(STORAGE_KEY);
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ token: null, user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthState(readStoredAuth());
    setLoading(false);
  }, []);

  const persistAuth = (payload) => {
    const nextState = {
      token: payload.token,
      user: payload.user
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    setAuthState(nextState);
  };

  const loginUser = async (credentials) => {
    const data = await login(credentials);
    persistAuth(data);
    return data;
  };

  const signupUser = async (payload) => {
    const data = await signup(payload);
    persistAuth(data);
    return data;
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setAuthState({ token: null, user: null });
  };

  const value = {
    token: authState.token,
    user: authState.user,
    loading,
    isAuthenticated: Boolean(authState.token && authState.user),
    loginUser,
    signupUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
