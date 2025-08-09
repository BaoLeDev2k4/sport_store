import express from 'express';
import asyncHandler from 'express-async-handler';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import {
  getVouchers,
  getVouchersAdmin,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getVoucherById,
  validateVoucher
} from '../controllers/voucherController.js';

const router = express.Router();

// Public routes (không cần auth)
router.get('/validate/:code', asyncHandler(validateVoucher));
router.post('/validate/:code', asyncHandler(validateVoucher)); // Thêm POST để gửi order_amount

// User routes (cần auth nhưng không cần admin)
router.get('/user', asyncHandler(getVouchers)); // GET /api/vouchers/user

// Admin routes (cần auth + admin)
router.get('/admin', authMiddleware, adminMiddleware, asyncHandler(getVouchersAdmin));
router.post('/admin', authMiddleware, adminMiddleware, asyncHandler(createVoucher));
router.get('/admin/:id', authMiddleware, adminMiddleware, asyncHandler(getVoucherById));
router.put('/admin/:id', authMiddleware, adminMiddleware, asyncHandler(updateVoucher));
router.delete('/admin/:id', authMiddleware, adminMiddleware, asyncHandler(deleteVoucher));

export default router;
