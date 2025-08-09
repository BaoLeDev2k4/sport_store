import axios from 'axios';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Response interceptor để xử lý tài khoản bị khóa
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kiểm tra nếu lỗi là tài khoản bị khóa
    if (error.response?.data?.code === 'ACCOUNT_LOCKED') {
      // Xóa token
      localStorage.removeItem('token');

      // Dispatch custom event để hiển thị modal
      window.dispatchEvent(new CustomEvent('accountLocked', {
        detail: { message: error.response.data.message }
      }));

      // Redirect sau 3 giây
      setTimeout(() => {
        window.location.href = '/auth';
      }, 3000);
    }
    return Promise.reject(error);
  }
);

// Request interceptor để thêm token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
