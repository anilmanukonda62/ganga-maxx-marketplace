import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If we are in production but the environment variable points to localhost, ignore it and use production backend
  if (!isLocal && envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    return 'https://ganga-maxx-marketplace-ct25.onrender.com/api';
  }
  // Otherwise, use the environment variable if defined, or fall back based on environment
  return envUrl || (isLocal
    ? 'http://localhost:5000/api'
    : 'https://ganga-maxx-marketplace-ct25.onrender.com/api');
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      // Auto-logout: redirect to login if not already there
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
