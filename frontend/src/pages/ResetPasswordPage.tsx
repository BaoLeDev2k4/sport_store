import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../scss/_reset-password.scss';

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Link không hợp lệ');
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { newPassword, confirmPassword } = formData;

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        newPassword
      });
      setSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="success-message">
          <div className="success-icon">🎉</div>
          <h2>Đặt lại mật khẩu thành công!</h2>
          <p>
            Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="login-button"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="form-header">
          <h2>🔑 Đặt lại mật khẩu</h2>
          <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới:</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="password-requirements">
            <p>Yêu cầu mật khẩu:</p>
            <ul>
              <li className={formData.newPassword.length >= 6 ? 'valid' : ''}>
                Ít nhất 6 ký tự
              </li>
              <li className={formData.newPassword === formData.confirmPassword && formData.newPassword ? 'valid' : ''}>
                Mật khẩu xác nhận khớp
              </li>
            </ul>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !formData.newPassword || !formData.confirmPassword}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang cập nhật...
              </>
            ) : (
              '🔐 Cập nhật mật khẩu'
            )}
          </button>
        </form>

        <div className="footer-links">
          <Link to="/auth" className="back-link">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
