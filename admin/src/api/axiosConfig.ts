import axios from 'axios';

// Tạo axios instance cho admin
const adminApiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor để thêm token vào header
adminApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi tài khoản admin bị khóa
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kiểm tra nếu tài khoản admin bị khóa
    if (error?.response?.data?.code === 'ACCOUNT_LOCKED') {
      // Xóa token khỏi localStorage
      localStorage.removeItem('admin_token');
      
      // Hiển thị thông báo
      alert('🔒 ' + (error.response.data.message || 'Tài khoản admin của bạn đã bị khóa. Vui lòng liên hệ quản trị viên cấp cao.'));
      
      // Reload trang để quay về LoginPage
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

export default adminApiClient;
