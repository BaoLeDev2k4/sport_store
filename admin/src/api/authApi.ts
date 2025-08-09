import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const login = (data: { email: string; password: string }) => {
  return axios.post(`${API_URL}/login`, data);
};

export const getMe = (token: string) => {
  return axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
