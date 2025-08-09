import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { login } from '../api/authApi';
import { Shield, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login: authLogin } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      const { token, user } = response.data;

      // Debug: Log user data
      console.log('User data received:', user);
      console.log('User role:', user.role);

      if (user.role !== 'admin') {
        setError(`Bạn không có quyền truy cập vào trang quản trị. Role hiện tại: ${user.role || 'undefined'}`);
        return;
      }

      authLogin(token, user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại';
      const code = err.response?.data?.code;

      // Hiển thị thông báo đặc biệt cho tài khoản bị khóa
      if (code === 'ACCOUNT_LOCKED') {
        setError('🔒 ' + message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '80px', height: '80px' }}>
                    <Shield size={40} className="text-white" />
                  </div>
                  <h2 className="h3 mb-2">Sport Store Admin</h2>
                  <p className="text-muted">Đăng nhập vào trang quản trị</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="admin@example.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Mật khẩu</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-lg pe-5"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ border: 'none', background: 'none' }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang đăng nhập...
                      </>
                    ) : (
                      'Đăng nhập'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Chỉ dành cho quản trị viên
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
