import axios from 'axios';

const readStoredAuth = () => {
  try {
    const storedAuth = window.localStorage.getItem('tasksphere_auth');
    return storedAuth ? JSON.parse(storedAuth) : null;
  } catch (_error) {
    window.localStorage.removeItem('tasksphere_auth');
    return null;
  }
};

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (window.location.port === '5173' || window.location.port === '5174') {
    return 'http://localhost:5000/api';
  }

  return '/api';
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

const initialAuth = readStoredAuth();

if (initialAuth?.token) {
  api.defaults.headers.common.Authorization = `Bearer ${initialAuth.token}`;
}

api.interceptors.request.use((config) => {
  const auth = readStoredAuth();

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

export default api;
