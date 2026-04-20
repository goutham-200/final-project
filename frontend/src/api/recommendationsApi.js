import api from './axiosConfig';

export const generateRecommendations = async (studentId) => {
  const response = await api.post('/recommendations/generate', { studentId });
  return response.data;
};

export const getStudentRecommendations = async (studentId) => {
  const response = await api.get(`/recommendations/student/${studentId}`);
  return response.data;
};

export const rateRecommendation = async (id, ratingData) => {
  const response = await api.patch(`/recommendations/${id}/rate`, ratingData);
  return response.data;
};
