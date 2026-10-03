import { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const readUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Check token expiry without a library — decode the payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expired — clear storage proactively
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const homePath = (role) =>
  role === 'ADMIN' ? '/admin' : role === 'OWNER' ? '/owner' : '/stores';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const persist = ({ token, user: u }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const login = async (email, password) =>
    persist((await api.post('/auth/login', { email, password })).data);

  const signup = async (form) => persist((await api.post('/auth/signup', form)).data);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
