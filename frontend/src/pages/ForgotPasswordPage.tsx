import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../scss/_forgot-password.scss';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="forgot-password-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>Email đã được gửi!</h2>
          <p>
            Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>
          </p>
          <p>
            Vui lòng kiểm tra hộp thư (kể cả thư mục spam) và click vào link để đặt lại mật khẩu.
          </p>
          <div className="action-buttons">
            <Link to="/auth" className="back-to-login">
              Quay lại đăng nhập
            </Link>
            <button 
              onClick={() => {
                setSent(false);
                setEmail('');
                setError('');
              }}
              className="resend-button"
            >
              Gửi lại email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="form-header">
          <h2>🔐 Quên mật khẩu?</h2>
          <p>Nhập email của bạn để nhận link đặt lại mật khẩu</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang gửi...
              </>
            ) : (
              '📧 Gửi link đặt lại mật khẩu'
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

export default ForgotPasswordPage;
