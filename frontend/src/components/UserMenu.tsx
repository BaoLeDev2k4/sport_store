import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserMenu: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <Link to="/auth"><button>Đăng nhập</button></Link>;
  }

  return (
    <div className="user-menu">
      <span>Chào, {user.username}</span>
      <button onClick={logout}>Đăng xuất</button>
      <Link to="/profile">Thông tin cá nhân</Link>
    </div>
  );
};

export default UserMenu;
