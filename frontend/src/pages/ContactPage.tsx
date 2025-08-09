import React, { useState } from "react";
import axios from "axios";
import { IoCallOutline, IoLocationOutline, IoMailOutline, IoTimeOutline } from "react-icons/io5";
import "../scss/ContactPage.scss";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\d{9}$/;

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên của bạn";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Email không hợp lệ";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
    if (!formData.message.trim()) newErrors.message = "Vui lòng nhập nội dung";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    const formErrors = validate();
    if (Object.keys(formErrors).length) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/contact", formData);
      setStatus("✅ Gửi thành công! Cảm ơn bạn đã liên hệ.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("❌ Gửi thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-info">
        <h2>Thông tin liên hệ</h2>
        <ul>
          <li><IoLocationOutline className="icon" /><div><strong>Địa chỉ</strong><p>113 Dương Quảng Hàm, P.5, Q. Gò Vấp, TP.HCM</p></div></li>
          <li><IoCallOutline className="icon" /><div><strong>Số điện thoại</strong><p>0393153129</p></div></li>
          <li><IoMailOutline className="icon" /><div><strong>Email</strong><p>sportstore@gmail.com</p></div></li>
          <li><IoTimeOutline className="icon" /><div><strong>Thời gian làm việc</strong><p>8h – 21h từ T2 ➜ T7<br />8h – 19h chủ nhật</p></div></li>
        </ul>
      </div>

      <div className="contact-form">
        <h2>Gửi thắc mắc cho chúng tôi</h2>
        <p>Nếu bạn có thắc mắc gì, hãy điền vào form dưới đây – chúng tôi sẽ liên hệ lại sớm nhất có thể.</p>

        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Tên của bạn" value={formData.name} onChange={handleChange} className={errors.name ? "error" : ""} />
          {errors.name && <p className="error-msg">{errors.name}</p>}

          <div className="form-row">
            <input type="email" name="email" placeholder="Email của bạn" value={formData.email} onChange={handleChange} className={errors.email ? "error" : ""} />
            <input type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} className={errors.phone ? "error" : ""} />
          </div>
          {errors.email && <p className="error-msg">{errors.email}</p>}
          {errors.phone && <p className="error-msg">{errors.phone}</p>}

          <textarea name="message" placeholder="Nội dung tin nhắn" rows={5} value={formData.message} onChange={handleChange} className={errors.message ? "error" : ""} />
          {errors.message && <p className="error-msg">{errors.message}</p>}

          <button type="submit" disabled={loading}>{loading ? "Đang gửi..." : "Gửi cho chúng tôi"}</button>
          {status && <p className="form-status">{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default ContactPage;