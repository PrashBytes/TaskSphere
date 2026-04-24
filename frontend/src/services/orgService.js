import api from './api';

export const createOrganization = async (payload) => {
  const response = await api.post('/orgs', payload);
  return response.data.data;
};
