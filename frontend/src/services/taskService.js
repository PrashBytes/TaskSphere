import api from './api';

export const getTasks = async (params) => {
  const response = await api.get('/tasks', { params });
  return response.data.data;
};

export const createTask = async (payload) => {
  const response = await api.post('/tasks', payload);
  return response.data.data;
};

export const updateTask = async (taskId, payload) => {
  const response = await api.put(`/tasks/${taskId}`, payload);
  return response.data.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};
