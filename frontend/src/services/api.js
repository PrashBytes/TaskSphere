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

const api = axios.create({
  baseURL:
    import.meta.env.API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api',
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
