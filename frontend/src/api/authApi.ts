import axios from 'axios';
import apiClient from './axiosConfig';

const API = 'http://localhost:5000/api/auth';

export const register = (data: { username: string; email: string; password: string; address: string; }) => {
  return axios.post(`${API}/register`, data);
};

export const login = (data: { email: string; password: string; }) => {
  return axios.post(`${API}/login`, data);
};

export const getMe = (token: string) => {
  return apiClient.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateProfile = (data: { username: string; email: string; phone: string; address: string; avatar?: string }, token: string) => {
  return apiClient.put('/auth/me', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  token: string
) => {
  const response = await apiClient.put(
    '/auth/change-password',
    { currentPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ✅ Thêm API upload avatar
export const uploadAvatar = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};