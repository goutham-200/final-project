import api from './axiosConfig';

export const getMyProfile = async () => {
  const response = await api.get('/student-portal/me');
  return response.data;
};

export const getMyRecommendations = async () => {
  const response = await api.get('/student-portal/recommendations');
  return response.data;
};

export const linkStudentAccount = async (studentId, email) => {
  const response = await api.patch(`/students/${studentId}/link`, { email });
  return response.data;
};
