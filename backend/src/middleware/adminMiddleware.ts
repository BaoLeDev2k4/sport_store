import { Response, NextFunction } from 'express';
import User from '../models/userModel.js';
import { RequestUser } from '../types/RequestUser.js';

export const adminMiddleware = async (req: RequestUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(401).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Không có quyền truy cập' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: 'Tài khoản đã bị khóa' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
    return;
  }
};
