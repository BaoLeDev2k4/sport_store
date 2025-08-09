import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Wrench,
  PackageCheck,
  Lock
} from 'lucide-react';
import { updateProfile } from '../api/authApi';
import AvatarUpload from '../components/AvatarUpload';
import '../scss/_profile.scss';
import '../scss/_avatar-upload.scss';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, token, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });

  if (!user) return <p>Vui lòng đăng nhập</p>;

  const handleEdit = () => {
    setFormData({
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address?.[0]?.address || '',
      avatar: user.avatar || '',
    });
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSave = async () => {
    const isChanged =
      formData.username !== user.username ||
      formData.email !== user.email ||
      formData.phone !== user.phone ||
      formData.address !== (user.address?.[0]?.address || '') ||
      formData.avatar !== (user.avatar || '');

    if (!isChanged) {
      const confirmSave = window.confirm("Bạn chưa sửa bất kỳ thông tin nào, bạn có chắc là muốn lưu?");
      if (!confirmSave) return;
    }

    if (!isValidEmail(formData.email)) {
      alert("Email không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    if (!isValidPhone(formData.phone)) {
      alert("Số điện thoại không hợp lệ. Vui lòng nhập đúng số điện thoại Việt Nam (10 chữ số).");
      return;
    }

    try {
      await updateProfile(formData, token!);
      alert("Cập nhật thành công");
      login(token!, {
        ...user,
        ...formData,
        address: [{ address: formData.address }],
        avatar: formData.avatar
      });
      setIsEditing(false);
    } catch {
      alert("Cập nhật thất bại");
    }
  };

  const handleAvatarChange = (filename: string) => {
    setFormData({ ...formData, avatar: filename });
  };

  return (
    <div className="profile-container">
      <h2>Thông tin tài khoản</h2>

      {/* ✅ Avatar Upload Section */}
      <AvatarUpload
        currentAvatar={user.avatar}
        onAvatarChange={handleAvatarChange}
        token={token!}
        disabled={!isEditing}
      />

      <div className="profile-item">
        <UserIcon className="icon" />
        <div className="text-block">
          <label>Họ tên:</label>
          {isEditing ? (
            <input name="username" value={formData.username} onChange={handleChange} />
          ) : (
            <span>{user.username}</span>
          )}
        </div>
      </div>

      <div className="profile-item">
        <Mail className="icon" />
        <div className="text-block">
          <label>Email:</label>
          {isEditing ? (
            <input name="email" value={formData.email} onChange={handleChange} />
          ) : (
            <span>{user.email}</span>
          )}
        </div>
      </div>

      <div className="profile-item">
        <Phone className="icon" />
        <div className="text-block">
          <label>Số điện thoại:</label>
          {isEditing ? (
            <input name="phone" value={formData.phone} onChange={handleChange} />
          ) : (
            <span>{user.phone}</span>
          )}
        </div>
      </div>

      <div className="profile-item">
        <MapPin className="icon" />
        <div className="text-block">
          <label>Địa chỉ:</label>
          {isEditing ? (
            <input name="address" value={formData.address} onChange={handleChange} />
          ) : (
            <span>{user.address?.[0]?.address || "Chưa cập nhật"}</span>
          )}
        </div>
      </div>

      {!isEditing ? (
        <>
          <button className="update-button" onClick={handleEdit}>
            <Wrench size={16} style={{ marginRight: '8px' }} />
            Cập nhật thông tin
          </button>

          {/* ✅ Nút đổi mật khẩu màu cam nằm giữa */}
          <button className="change-password-button" onClick={() => navigate("/profile/change-password")}>
            <Lock size={16} style={{ marginRight: '8px' }} />
            Đổi mật khẩu
          </button>

          <button className="view-orders-button" onClick={() => navigate("/profile/orders")}>
            <PackageCheck size={16} style={{ marginRight: '8px' }} />
            Xem đơn hàng đã mua
          </button>

          <button className="logout-button" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} style={{ marginRight: '8px' }} />
            Đăng xuất
          </button>
        </>
      ) : (
        <button className="update-button" onClick={handleSave}>
          Lưu thay đổi
        </button>
      )}
    </div>
  );
};

export default ProfilePage;
