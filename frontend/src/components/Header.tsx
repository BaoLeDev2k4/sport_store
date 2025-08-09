import { Zap, Search, User, Phone, ShoppingCart, LogOut, Info } from 'lucide-react';
import '../scss/_header.scss';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const isProfilePage = location.pathname === '/profile';

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleCartClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để vào giỏ hàng.');
      navigate('/auth');
      return;
    }
    navigate('/cart');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = keyword.trim();
      if (trimmed) {
        navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
      } else {
        alert('Vui lòng nhập từ khóa tìm kiếm.');
      }
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-section">
          <Zap size={32} className="logo-icon" />
          <div className="logo-text-group">
            <h1>SPORT STORE</h1>
            <p className="tagline">Đỉnh cao phong độ, dẫn đầu xu hướng!</p>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <Search size={20} className="search-icon" />
        </div>

        {/* Nhóm user + giỏ hàng */}
        <div className="user-cart-group">
          {/* Hotline */}
          <div className="hotline-contact">
            <Phone size={20} className="phone-icon" />
            <div className="contact-details">
              <span>Hỗ trợ 24/7</span>
              <span>(028) 123 4567</span>
            </div>
          </div>

          {/* Tài khoản */}
          {!isProfilePage && (
            <div className="user-button-wrapper">
              {user ? (
                <div className="user-button" onClick={toggleMenu}>
                  {/* ✅ Hiển thị avatar nếu có, nếu không thì hiển thị icon User */}
                  {user.avatar ? (
                    <img
                      src={`http://localhost:5000/images/avatars/${user.avatar}`}
                      alt={user.username}
                      className="user-avatar"
                      onError={(e) => {
                        // Fallback về icon User nếu ảnh lỗi
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <User size={24} className={user.avatar ? 'hidden' : ''} />

                  {menuOpen && (
                    <div className="logout-menu">
                      <div className="username">
                        {user.avatar ? (
                          <img
                            src={`http://localhost:5000/images/avatars/${user.avatar}`}
                            alt={user.username}
                            className="menu-avatar"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <User size={18} className={user.avatar ? 'hidden' : ''} style={{ marginRight: '8px' }} />
                        Xin chào <span className="username-value">{user.username}</span>
                      </div>
                      <Link to="/profile" className="profile-link">
                        <Info size={16} style={{ marginRight: '8px' }} />
                        Thông tin người dùng
                      </Link>
                      <div className="logout" onClick={handleLogout}>
                        <LogOut size={16} style={{ marginRight: '8px' }} />
                        Đăng xuất
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="user-button">
                  <User size={24} />
                </Link>
              )}
            </div>
          )}

          {/* Giỏ hàng */}
          <button className="cart-button" onClick={handleCartClick}>
            <ShoppingCart size={24} />
            <span className="cart-count">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
