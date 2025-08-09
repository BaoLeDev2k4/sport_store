import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../scss/_change-password.scss';

const ChangePasswordPage = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    const { oldPassword, newPassword, confirmNewPassword } = formData;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu cũ.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword,
        }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(result.message || 'Đổi mật khẩu thất bại');
      }

      alert('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      navigate('/auth');
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã có lỗi xảy ra.');
      }
    }
  };

  if (!user) return <p>Vui lòng đăng nhập</p>;

  const isDisabled =
    !formData.oldPassword || !formData.newPassword || !formData.confirmNewPassword;

  return (
    <div className="change-password-container">
      <h2>Đổi mật khẩu</h2>

      <div className="change-password-item">
        <label>Mật khẩu hiện tại:</label>
        <input
          type="password"
          name="oldPassword"
          value={formData.oldPassword}
          onChange={handleChange}
          placeholder="Nhập mật khẩu hiện tại"
        />
      </div>

      <div className="change-password-item">
        <label>Mật khẩu mới:</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Nhập mật khẩu mới"
        />
      </div>

      <div className="change-password-item">
        <label>Nhập lại mật khẩu mới:</label>
        <input
          type="password"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          placeholder="Xác nhận mật khẩu mới"
        />
      </div>

      {error && <p className="change-password-error">{error}</p>}

      <button
        className="change-password-button"
        onClick={handleSubmit}
        disabled={isDisabled || loading}
      >
        {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
      </button>
    </div>
  );
};

export default ChangePasswordPage;
