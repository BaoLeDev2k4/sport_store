import React, { useState, useContext } from 'react';
import { register, login } from '../api/authApi';
import { type User } from '../types/User';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../scss/_auth.scss';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: setLogin } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await login({
          email: formData.email,
          password: formData.password,
        });
        const { token, user } = res.data as { token: string; user: User };

        // Kiểm tra tài khoản có bị khóa không
        if (!user.isActive) {
          // Dispatch event để hiển thị modal
          window.dispatchEvent(new CustomEvent('accountLocked', {
            detail: { message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.' }
          }));
          return;
        }

        setLogin(token, user);
        navigate('/');
      } else {
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if (!emailRegex.test(formData.email)) {
          alert("Email không hợp lệ");
          return;
        }

        // Validate số điện thoại Việt Nam
        const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
        if (!phoneRegex.test(formData.phone)) {
          alert("Số điện thoại không hợp lệ (phải có 10 số và đúng đầu số Việt Nam)");
          return;
        }

        // Validate mật khẩu khớp
        if (formData.password !== formData.confirmPassword) {
          alert("Mật khẩu không khớp, vui lòng nhập lại");
          return;
        }

        await register(formData);
        alert('Đăng ký thành công!');
        setIsLogin(true);
      }
    } catch (err) {
      if (err && typeof err === 'object' && err !== null && 'response' in err) {
        const error = err as { response?: { data?: { message?: string; code?: string } } };

        // Xử lý riêng cho trường hợp tài khoản bị khóa
        if (error.response?.data?.code === 'ACCOUNT_LOCKED') {
          // Dispatch event để hiển thị modal
          window.dispatchEvent(new CustomEvent('accountLocked', {
            detail: { message: error.response.data.message }
          }));
        } else {
          alert(error.response?.data?.message || 'Lỗi');
        }
      } else {
        alert('Lỗi không xác định');
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <div className="form-group">
              <label>Họ tên:</label>
              <input name="username" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Số điện thoại:</label>
              <input name="phone" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Địa chỉ:</label>
              <input name="address" onChange={handleChange} required />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Email:</label>
          <input name="email" type="email" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Mật khẩu:</label>
          <input name="password" type="password" onChange={handleChange} required />
        </div>

        {!isLogin && (
          <div className="form-group">
            <label>Nhập lại mật khẩu:</label>
            <input name="confirmPassword" type="password" onChange={handleChange} required />
          </div>
        )}

        <button type="submit">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
      </form>

      {/* Links ở dưới form - hiển thị khác nhau tùy theo mode */}
      {isLogin ? (
        <div className="auth-links">
          <Link to="/forgot-password" className="forgot-password-link">Quên mật khẩu?</Link>
          <span onClick={() => setIsLogin(!isLogin)} className="register-link">Đăng ký ngay</span>
        </div>
      ) : (
        <p onClick={() => setIsLogin(!isLogin)} className="login-link">
          Đã có tài khoản? Đăng nhập
        </p>
      )}
    </div>
  );
};

export default AuthPage;
