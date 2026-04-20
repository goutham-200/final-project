import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (stale / invalid token) — but NOT during session restore
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    // Skip redirect for the /auth/me call — authSlice handles that gracefully
    if (error.response?.status === 401 && !url.includes('/auth/me')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

