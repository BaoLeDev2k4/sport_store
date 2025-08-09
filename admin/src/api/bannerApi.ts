import axios from 'axios';
import { Banner } from '../types';

const API_URL = 'http://localhost:5000/api/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}` };
};

// Lấy danh sách banner cho admin
export const getBanners = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  return axios.get(`${API_URL}/banners`, {
    headers: getAuthHeaders(),
    params
  });
};

// Lấy banner theo ID
export const getBannerById = (id: string) => {
  return axios.get(`${API_URL}/banners/${id}`, {
    headers: getAuthHeaders()
  });
};

// Tạo banner mới
export const createBanner = (data: Partial<Banner>) => {
  return axios.post(`${API_URL}/banners`, data, {
    headers: getAuthHeaders()
  });
};

// Cập nhật banner
export const updateBanner = (id: string, data: Partial<Banner>) => {
  return axios.put(`${API_URL}/banners/${id}`, data, {
    headers: getAuthHeaders()
  });
};

// Xóa banner
export const deleteBanner = (id: string) => {
  return axios.delete(`${API_URL}/banners/${id}`, {
    headers: getAuthHeaders()
  });
};
