import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestUser } from '../types/RequestUser.js';
import User from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const authMiddleware = async (req: RequestUser, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Chưa đăng nhập' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // Kiểm tra user có tồn tại và có bị khóa không với retry
    let user;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        user = await User.findById(decoded.id);
        break; // Thành công, thoát khỏi loop
      } catch (dbError: any) {
        retryCount++;
        console.log(`⚠️ Database error (attempt ${retryCount}/${maxRetries + 1}):`, dbError.message);

        if (retryCount > maxRetries) {
          console.log(`❌ Max retries exceeded for user lookup: ${decoded.id}`);
          res.status(500).json({
            message: 'Lỗi kết nối cơ sở dữ liệu',
            code: 'DATABASE_ERROR'
          });
          return;
        }

        // Đợi 100ms trước khi retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (!user) {
      console.log(`⚠️ User not found for ID: ${decoded.id}`);
      res.status(401).json({
        message: 'Người dùng không tồn tại',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    if (!user.isActive) {
      const lockReason = (user as any).lockReason || 'Không có lý do cụ thể';
      const lockedAt = (user as any).lockedAt;
      console.log(`🔒 Account locked - User: ${user.email}, Reason: ${lockReason}, At: ${lockedAt}`);

      res.status(403).json({
        message: `Tài khoản của bạn đã bị khóa. Lý do: ${lockReason}`,
        code: 'ACCOUNT_LOCKED',
        lockReason,
        lockedAt
      });
      return;
    }

    req.userId = decoded.id;
    next();
  } catch (error: any) {
    console.log(`❌ Auth middleware error:`, error.message);
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        message: 'Token đã hết hạn',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        message: 'Token không hợp lệ',
        code: 'INVALID_TOKEN'
      });
    } else {
      res.status(500).json({
        message: 'Lỗi server khi xác thực',
        code: 'AUTH_ERROR'
      });
    }
    return;
  }
};
