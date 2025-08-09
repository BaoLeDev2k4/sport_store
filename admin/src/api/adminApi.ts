import axios from 'axios';
import { DashboardStats, Product, Category, Post, TopProductsResponse } from '../types';

const API_URL = 'http://localhost:5000/api/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}` };
};

// Dashboard
export const getDashboardStats = () => {
  return axios.get<DashboardStats>(`${API_URL}/dashboard/stats`, {
    headers: getAuthHeaders()
  });
};

export const getTopProductsFiltered = (params?: {
  year?: number;
  month?: number;
}) => {
  return axios.get<TopProductsResponse>(`${API_URL}/dashboard/top-products`, {
    headers: getAuthHeaders(),
    params
  });
};

// Products
export const getProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  hot?: boolean;
  search?: string;
}) => {
  return axios.get(`${API_URL}/products`, {
    headers: getAuthHeaders(),
    params
  });
};

export const createProduct = (data: Partial<Product>) => {
  return axios.post(`${API_URL}/products`, data, {
    headers: getAuthHeaders()
  });
};

export const updateProduct = (id: string, data: Partial<Product>) => {
  return axios.put(`${API_URL}/products/${id}`, data, {
    headers: getAuthHeaders()
  });
};

export const deleteProduct = (id: string) => {
  return axios.delete(`${API_URL}/products/${id}`, {
    headers: getAuthHeaders()
  });
};

// Categories
export const getCategories = () => {
  return axios.get(`${API_URL}/categories`, {
    headers: getAuthHeaders()
  });
};

export const createCategory = (data: Partial<Category>) => {
  return axios.post(`${API_URL}/categories`, data, {
    headers: getAuthHeaders()
  });
};

export const updateCategory = (id: string, data: Partial<Category>) => {
  return axios.put(`${API_URL}/categories/${id}`, data, {
    headers: getAuthHeaders()
  });
};

export const deleteCategory = (id: string) => {
  return axios.delete(`${API_URL}/categories/${id}`, {
    headers: getAuthHeaders()
  });
};

// Users
export const getUsers = (params?: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}) => {
  return axios.get(`${API_URL}/users`, {
    headers: getAuthHeaders(),
    params
  });
};

export const toggleUserStatus = (id: string, isActive: boolean, lockReason?: string) => {
  return axios.put(`${API_URL}/users/${id}/status`, { isActive, lockReason }, {
    headers: getAuthHeaders()
  });
};

export const getUserStats = (userId: string) => {
  return axios.get(`${API_URL}/users/${userId}/stats`, {
    headers: getAuthHeaders()
  });
};



export const getUserById = (id: string) => {
  return axios.get(`${API_URL}/users/${id}`, {
    headers: getAuthHeaders()
  });
};

// Posts
export const getPosts = (params?: {
  search?: string;
  status?: number;
}) => {
  return axios.get('http://localhost:5000/api/posts', {
    params: { ...params, admin: '1' },
    headers: getAuthHeaders()
  });
};

export const getPostById = (id: string) => {
  return axios.get(`http://localhost:5000/api/posts/id/${id}`, {
    headers: getAuthHeaders()
  });
};

export const createPost = (data: Partial<Post>) => {
  return axios.post('http://localhost:5000/api/posts', data, {
    headers: getAuthHeaders()
  });
};

export const updatePost = (id: string, data: Partial<Post>) => {
  return axios.put(`http://localhost:5000/api/posts/${id}`, data, {
    headers: getAuthHeaders()
  });
};

export const deletePost = (id: string) => {
  return axios.delete(`http://localhost:5000/api/posts/${id}`, {
    headers: getAuthHeaders()
  });
};

// Images
export const getImagesList = (type: 'products' | 'categories' | 'posts') => {
  return axios.get(`http://localhost:5000/api/upload/list/${type}`, {
    headers: getAuthHeaders()
  });
};


