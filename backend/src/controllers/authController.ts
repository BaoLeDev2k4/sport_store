import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel.js';
import { RequestUser } from '../types/RequestUser.js';
import { Resend } from 'resend';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Lazy initialization function for Resend
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured in environment variables');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

// Đăng ký
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, phone, address } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: 'Email đã tồn tại' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    phone,
    address: address ? [{ address }] : [],
  });

  await newUser.save();
  res.status(201).json({ message: 'Đăng ký thành công' });
};

// Đăng nhập
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: 'Email không tồn tại' });
    return;
  }

  // Kiểm tra tài khoản có bị khóa không
  if (!user.isActive) {
    const lockReason = (user as any).lockReason || 'Không có lý do cụ thể';
    const lockedAt = (user as any).lockedAt;

    res.status(403).json({
      message: `Tài khoản của bạn đã bị khóa. Lý do: ${lockReason}`,
      code: 'ACCOUNT_LOCKED',
      lockReason,
      lockedAt
    });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400).json({ message: 'Sai mật khẩu' });
    return;
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.isActive,
    },
  });
};

// Lấy thông tin cá nhân
export const getMe = async (req: RequestUser, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ message: 'Không tìm thấy user' });
    return;
  }

  res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    isActive: user.isActive, // ✅ Thêm trường isActive
  });
};

// Cập nhật thông tin cá nhân
export const updateProfile = async (req: RequestUser, res: Response): Promise<void> => {
  const { username, email, phone, address, avatar } = req.body;
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ message: 'Không tìm thấy user' });
    return;
  }

  user.username = username || user.username;
  user.email = email || user.email;
  user.phone = phone || user.phone;

  // ✅ Cập nhật avatar nếu có
  if (avatar !== undefined) {
    user.avatar = avatar;
  }

  if (address) {
    user.address = [{ address }] as any;
  }

  await user.save();
  res.json({ message: 'Cập nhật thành công' });
};

// ✅ Đổi mật khẩu
export const changePassword = async (req: RequestUser, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ message: 'Không tìm thấy user' });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({ message: 'Đổi mật khẩu thành công' });
};

// ✅ Quên mật khẩu - Gửi email reset
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
      return;
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Lưu token vào database (hết hạn sau 15 phút)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Email HTML template đẹp
    const emailHTML = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đặt lại mật khẩu - Sport Store</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }

              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f8fafc;
              }

              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }

              .header {
                  background: linear-gradient(135deg, #3E8DFF 0%, #2563eb 100%);
                  padding: 40px 30px;
                  text-align: center;
                  color: white;
              }

              .header h1 {
                  font-size: 28px;
                  font-weight: 700;
                  margin-bottom: 8px;
              }

              .header p {
                  font-size: 16px;
                  opacity: 0.9;
              }

              .content {
                  padding: 40px 30px;
              }

              .greeting {
                  font-size: 18px;
                  margin-bottom: 20px;
                  color: #1f2937;
              }

              .message {
                  font-size: 16px;
                  color: #4b5563;
                  margin-bottom: 30px;
                  line-height: 1.7;
              }

              .cta-container {
                  text-align: center;
                  margin: 40px 0;
              }

              .cta-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  color: white;
                  text-decoration: none;
                  padding: 18px 36px;
                  border-radius: 12px;
                  font-weight: 700;
                  font-size: 18px;
                  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
                  border: 2px solid #10b981;
                  transition: all 0.3s ease;
              }

              .cta-button:hover {
                  background: linear-gradient(135deg, #059669 0%, #047857 100%);
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
                  border-color: #059669;
              }

              .backup-link {
                  background: #f1f5f9;
                  border: 1px solid #cbd5e1;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
                  border-left: 4px solid #3E8DFF;
              }

              .backup-link p {
                  font-size: 14px;
                  color: #6b7280;
                  margin-bottom: 10px;
              }

              .backup-link code {
                  background: white;
                  border: 1px solid #d1d5db;
                  border-radius: 4px;
                  padding: 8px 12px;
                  font-size: 12px;
                  word-break: break-all;
                  display: block;
                  color: #374151;
              }

              .warning {
                  background: #fef3c7;
                  border-left: 4px solid #f59e0b;
                  padding: 16px 20px;
                  border-radius: 0 8px 8px 0;
                  margin: 30px 0;
              }

              .warning h3 {
                  color: #92400e;
                  font-size: 16px;
                  margin-bottom: 8px;
              }

              .warning ul {
                  color: #78350f;
                  font-size: 14px;
                  margin-left: 20px;
              }

              .warning li {
                  margin-bottom: 4px;
              }

              .footer {
                  background: #f8fafc;
                  padding: 30px;
                  text-align: center;
                  border-top: 1px solid #e5e7eb;
              }

              .footer p {
                  color: #6b7280;
                  font-size: 14px;
                  margin-bottom: 8px;
              }

              .footer .brand {
                  color: #2563eb;
                  font-weight: 600;
                  font-size: 16px;
              }

              @media (max-width: 600px) {
                  .email-container {
                      margin: 0;
                      border-radius: 0;
                  }

                  .header, .content, .footer {
                      padding: 20px;
                  }

                  .header h1 {
                      font-size: 24px;
                  }

                  .cta-button {
                      padding: 14px 28px;
                      font-size: 15px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <h1>🔐 Đặt lại mật khẩu</h1>
                  <p>Sport Store - Cửa hàng thể thao hàng đầu</p>
              </div>

              <div class="content">
                  <div class="greeting">
                      Xin chào! 👋
                  </div>

                  <div class="message">
                      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Sport Store của bạn.
                      Để tiếp tục, vui lòng click vào nút bên dưới:
                  </div>

                  <div class="cta-container">
                      <a href="${resetURL}" class="cta-button">
                          🔑 Đặt lại mật khẩu ngay
                      </a>
                  </div>

                  <div class="backup-link">
                      <p><strong>Không thể click nút trên?</strong> Copy và paste link này vào trình duyệt:</p>
                      <code>${resetURL}</code>
                  </div>

                  <div class="warning">
                      <h3>⚠️ Lưu ý quan trọng</h3>
                      <ul>
                          <li>Link này sẽ <strong>hết hạn sau 15 phút</strong></li>
                          <li>Chỉ sử dụng nếu bạn đã yêu cầu đặt lại mật khẩu</li>
                          <li>Không chia sẻ link này với bất kỳ ai</li>
                          <li>Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này</li>
                      </ul>
                  </div>

                  <div class="message">
                      Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi.
                  </div>
              </div>

              <div class="footer">
                  <p>Trân trọng,</p>
                  <p class="brand">Sport Store Team</p>

                  <p style="margin-top: 20px; font-size: 12px;">
                      © 2024 Sport Store. All rights reserved.<br>
                      123 Đường Thể Thao, Quận 1, TP. Hồ Chí Minh
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;

    // Gửi email
    const resend = getResendClient();
    await resend.emails.send({
      from: "Sport Store <onboarding@resend.dev>",
      to: email,
      subject: "🔐 Đặt lại mật khẩu - Sport Store",
      html: emailHTML,
      text: `
        Đặt lại mật khẩu - Sport Store

        Xin chào,

        Bạn đã yêu cầu đặt lại mật khẩu. Click vào link sau:
        ${resetURL}

        Link sẽ hết hạn sau 15 phút.

        Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.

        Trân trọng,
        Sport Store Team
      `
    });

    res.json({
      message: 'Link đặt lại mật khẩu đã được gửi về email của bạn',
      success: true
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Không thể gửi email. Vui lòng thử lại sau.' });
  }
};

// ✅ Reset mật khẩu với token
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
      return;
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật password và xóa reset token
    user.password = hashedPassword;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = new Date(0);
    await user.save();

    res.json({
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra. Vui lòng thử lại sau.' });
  }
};
