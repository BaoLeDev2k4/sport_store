import { useState } from 'react';
import { Home, Shirt, Info, Mail, Menu, Newspaper } from 'lucide-react';
// Import Link từ react-router-dom
import { Link } from 'react-router-dom';

// Import file SCSS của bạn
import '../scss/_navbar.scss'; // Điều chỉnh đường dẫn nếu cần

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Hamburger Menu for Mobile */}
        <div className="hamburger-menu">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="hamburger-button" // Thêm class cho button
          >
            <Menu size={28} /> {/* Tăng kích thước icon một chút */}
          </button>
        </div>

        {/* Navigation Links */}
        {/* Sử dụng một div bao bọc để dễ dàng kiểm soát responsive hơn nếu cần */}
        <div className={`nav-links-wrapper ${isOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              {/* Thay đổi từ <a> sang <Link> và href sang to */}
              <Link to="/">
                <Home size={20} /> {/* Tăng kích thước icon */}
                <span>Trang chủ</span>
              </Link>
            </li>
            <li>
              {/* Cập nhật link cho Sản phẩm */}
              <Link to="/products" onClick={() => setIsOpen(false)}> {/* Đóng menu khi click trên mobile */}
                <Shirt size={20} /> {/* Tăng kích thước icon */}
                <span>Sản phẩm</span>
              </Link>
            </li>
            <li>
              {/* Thay đổi từ <a> sang <Link> và href sang to */}
              <Link to="/news" onClick={() => setIsOpen(false)}> {/* Đóng menu khi click trên mobile */}
                <Newspaper size={20} /> {/* Tăng kích thước icon */}
                <span>Tin tức</span>
              </Link>
            </li>
            <li>
              {/* Thay đổi từ <a> sang <Link> và href sang to */}
              <Link to="/about" onClick={() => setIsOpen(false)}> {/* Đóng menu khi click trên mobile */}
                <Info size={20} /> {/* Tăng kích thước icon */}
                <span>Về chúng tôi</span>
              </Link>
            </li>
            <li>
              {/* Thay đổi từ <a> sang <Link> và href sang to */}
              <Link to="/contact" onClick={() => setIsOpen(false)}> {/* Đóng menu khi click trên mobile */}
                <Mail size={20} /> {/* Tăng kích thước icon */}
                <span>Liên hệ</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;