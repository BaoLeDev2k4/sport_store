import { Request, Response, NextFunction } from 'express';
import Voucher from '../models/voucherModel.js';

// Middleware để tự động cập nhật status voucher
export const updateVoucherStatus = async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    
    // Cập nhật tất cả voucher Active thành Expired nếu hết hạn
    await Voucher.updateMany(
      { 
        status: 'Active',
        end_date: { $lt: now }
      },
      { 
        status: 'Expired' 
      }
    );
    
    // Cập nhật tất cả voucher Active thành InActive nếu hết số lượng
    await Voucher.updateMany(
      { 
        status: 'Active',
        quantity: { $lte: 0 }
      },
      { 
        status: 'InActive' 
      }
    );
    
    next();
  } catch (error) {
    console.error('Error updating voucher status:', error);
    next(); // Tiếp tục dù có lỗi
  }
};

// Middleware chỉ cập nhật cho voucher cụ thể
export const updateSingleVoucherStatus = async (voucherId: string) => {
  try {
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) return;
    
    const now = new Date();
    let newStatus = voucher.status;
    
    if (voucher.status === 'Active') {
      if (now > voucher.end_date) {
        newStatus = 'Expired';
      } else if (voucher.quantity <= 0) {
        newStatus = 'InActive';
      }
    }
    
    if (newStatus !== voucher.status) {
      await Voucher.findByIdAndUpdate(voucherId, { status: newStatus });
    }
    
    return newStatus;
  } catch (error) {
    console.error('Error updating single voucher status:', error);
    return null;
  }
};
