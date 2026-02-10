import axios from 'axios';
import { API_BASE_URL, ADMIN_API_URL } from './constants';

const api = axios.create({
  baseURL: ADMIN_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('admin_token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Separate instance for auth endpoints (not under /admin)
export const authApi = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
