import api from './axiosConfig';

export const getStrategies = async (params) => {
  const response = await api.get('/strategies', { params });
  return response.data;
};

export const getStrategyById = async (id) => {
  const response = await api.get(`/strategies/${id}`);
  return response.data;
};

export const createStrategy = async (strategyData) => {
  const response = await api.post('/strategies', strategyData);
  return response.data;
};

export const updateStrategy = async (id, strategyData) => {
  const response = await api.put(`/strategies/${id}`, strategyData);
  return response.data;
};

export const deleteStrategy = async (id) => {
  const response = await api.delete(`/strategies/${id}`);
  return response.data;
};

export const approveStrategy = async (id) => {
  const response = await api.patch(`/strategies/${id}/approve`);
  return response.data;
};
