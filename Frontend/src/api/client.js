import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Expired / invalid token on a protected call => force re-login
    const isAuthCall = err.config?.url?.startsWith('/auth/login');
    if (err.response?.status === 401 && !isAuthCall && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err) =>
  err.response?.data?.message || 'Something went wrong. Please try again.';

export const getFieldErrors = (err) => err.response?.data?.errors || {};

export default api;
