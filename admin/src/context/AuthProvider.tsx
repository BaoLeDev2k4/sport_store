import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { User } from '../types';
import { getMe } from '../api/authApi';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await getMe(token);
          const userData = response.data;
          
          // Kiểm tra xem user có phải admin không
          if (userData.role === 'admin') {
            setUser(userData);
          } else {
            // Nếu không phải admin, xóa token
            localStorage.removeItem('admin_token');
            setToken(null);
          }
        } catch (error: any) {
          console.log('Auth error:', error?.response?.data);
          localStorage.removeItem('admin_token');
          setToken(null);

          // Hiển thị thông báo dựa trên loại lỗi
          const errorCode = error?.response?.data?.code;
          const errorMessage = error?.response?.data?.message;

          if (errorCode === 'ACCOUNT_LOCKED') {
            alert('🔒 ' + (errorMessage || 'Tài khoản admin của bạn đã bị khóa'));
          } else if (errorCode === 'TOKEN_EXPIRED') {
            console.log('Token expired, redirecting to login...');
            // Không hiển thị alert cho token expired, chỉ redirect
          } else if (errorCode === 'USER_NOT_FOUND') {
            console.log('User not found, clearing session...');
            // Không hiển thị alert, có thể user đã bị xóa
          } else if (errorCode === 'AUTH_ERROR') {
            console.log('Server authentication error, please try again later');
            // Lỗi server, không phải lỗi của user
          } else {
            console.log('Unknown auth error:', errorMessage);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (newToken: string, userData: User) => {
    if (userData.role === 'admin') {
      localStorage.setItem('admin_token', newToken);
      setToken(newToken);
      setUser(userData);
    } else {
      throw new Error('Không có quyền truy cập admin');
    }
  };

  const logout = () => {
    console.log('🚪 User logging out...');
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
