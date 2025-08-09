import axios from 'axios';

const API_URL = 'http://localhost:5000/api/upload';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}` };
};

// Upload single image
export const uploadSingleImage = (file: File, type: 'products' | 'categories' | 'posts' | 'banners') => {
  const formData = new FormData();
  formData.append('image', file);

  return axios.post(`${API_URL}/single/${type}`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Upload multiple images
export const uploadMultipleImages = (files: File[], type: 'products' | 'categories' | 'posts' | 'banners') => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  return axios.post(`${API_URL}/multiple/${type}`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Delete image
export const deleteImage = (filename: string, type: 'products' | 'categories' | 'posts' | 'banners') => {
  return axios.delete(`${API_URL}/${type}/${filename}`, {
    headers: getAuthHeaders()
  });
};
