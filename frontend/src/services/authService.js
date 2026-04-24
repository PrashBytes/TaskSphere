import api from './api';

export const login = async (payload) => {
  const response = await api.post('/auth/login', payload);
  return response.data.data;
};

export const signup = async (payload) => {
  const response = await api.post('/auth/signup', payload);
  return response.data.data;
};
