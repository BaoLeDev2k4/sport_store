import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react'; // Thêm các icon cho Contact
import '../scss/_footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section about-us"> {/* Thêm class cho section */}
          <h4>Sport Store</h4>
          <p>
            Sport Store là điểm đến hàng đầu cho những người đam mê thể thao. Chúng tôi cam kết mang đến các sản phẩm chất lượng cao, công nghệ tiên tiến nhất để bạn luôn dẫn đầu phong độ và xu hướng.
          </p>
          <div className="social-links">
            <a href="https://facebook.com/sportstore" target="_blank" rel="noopener noreferrer" className="social-item" aria-label="Facebook">
              <Facebook size={22} /> {/* Tăng kích thước icon */}
            </a>
            <a href="https://twitter.com/sportstore" target="_blank" rel="noopener noreferrer" className="social-item" aria-label="Twitter">
              <Twitter size={22} />
            </a>
            <a href="https://instagram.com/sportstore" target="_blank" rel="noopener noreferrer" className="social-item" aria-label="Instagram">
              <Instagram size={22} />
            </a>
            <a href="https://linkedin.com/company/sportstore" target="_blank" rel="noopener noreferrer" className="social-item" aria-label="LinkedIn">
              <Linkedin size={22} />
            </a>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section quick-links">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="#privacy-policy">Chính sách bảo mật</a></li>
            <li><a href="#terms-of-service">Điều khoản dịch vụ</a></li>
            <li><a href="#faq">Câu hỏi thường gặp</a></li>
            <li><a href="#sitemap">Sơ đồ trang web</a></li>
            <li><a href="#shipping">Chính sách vận chuyển</a></li> {/* Thêm một link */}
            <li><a href="#returns">Chính sách đổi trả</a></li> {/* Thêm một link */}
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact-info">
          <h4>Liên hệ</h4>
          <div className="contact-item">
            <MapPin size={18} className="contact-icon" />
            <span>Địa chỉ: 113 Dương Quảng Hàm, P.5, Q. Gò Vấp, TP.HCM</span>
          </div>
          <div className="contact-item">
            <Phone size={18} className="contact-icon" />
            <span>Điện thoại: (039) 3153 129</span>
          </div>
          <div className="contact-item">
            <Mail size={18} className="contact-icon" />
            <span>Email: info@sportstore.com</span>
          </div>
          {/* Thêm phần đăng ký nhận bản tin */}
          <div className="newsletter-signup">
            <h5>Đăng ký nhận tin</h5>
            <div className="newsletter-form">
              <input type="email" placeholder="Nhập email của bạn..." aria-label="Enter your email for newsletter" />
              <button type="submit" aria-label="Subscribe to newsletter">Đăng ký</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer / Copyright */}
      <div className="footer-bottom"> {/* Thay đổi tên class */}
        <p className="copyright-text">
          ©{new Date().getFullYear()} Sport Store. All Rights Reserved. {/* Tiếng Anh cho chuyên nghiệp hơn */}
        </p>
        <div className="payment-methods">
            {/* Icons thanh toán, bạn có thể thay bằng ảnh SVG */}
            <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
            <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" />
            <img src="https://img.icons8.com/fluency/48/paypal.png" alt="PayPal" />
            {/* Thêm các icon khác nếu cần */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;