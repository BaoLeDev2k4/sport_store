import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getMe } from '../api/authApi';
import type { User } from '../types/User';
import type { ReactNode } from 'react';
import { useCart } from './CartContext';

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Thêm flag để tránh hiển thị modal khi khởi tạo
  const { clearCart } = useCart();

  useEffect(() => {
    // Chỉ chạy một lần khi component mount
    if (isInitialized) return;

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      getMe(savedToken)
        .then((res) => {
          const userData = res.data as User;
          // Kiểm tra tài khoản có bị khóa không
          if (!userData.isActive) {
            localStorage.removeItem('token');
            // Hiển thị modal cho tài khoản bị khóa
            window.dispatchEvent(new CustomEvent('accountLocked', {
              detail: { message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.' }
            }));
            setIsInitialized(true);
            return;
          }
          setUser(userData);
          setToken(savedToken);
          setIsInitialized(true);
        })
        .catch((error) => {
          console.log('Auth error:', error);
          localStorage.removeItem('token');

          // CHỈ hiển thị modal khi lỗi THỰC SỰ là tài khoản bị khóa
          if (error.response?.data?.code === 'ACCOUNT_LOCKED') {
            window.dispatchEvent(new CustomEvent('accountLocked', {
              detail: { message: error.response.data.message }
            }));
          }
          // Các lỗi khác (token hết hạn, lỗi mạng, etc.) không hiển thị modal
          setIsInitialized(true);
        });
    } else {
      setIsInitialized(true); // Đánh dấu đã khởi tạo xong ngay cả khi không có token
    }
  }, [isInitialized]);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    clearCart(); // clear cart on logout
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
