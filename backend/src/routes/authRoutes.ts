import express from 'express';
import asyncHandler from 'express-async-handler';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword, // ✅ Thêm dòng này
  forgotPassword, // ✅ Thêm forgot password
  resetPassword, // ✅ Thêm reset password
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(getMe));
router.put('/me', authMiddleware, asyncHandler(updateProfile));
router.put('/change-password', authMiddleware, asyncHandler(changePassword)); // ✅ Thêm route đổi mật khẩu

// ✅ Routes cho forgot password
router.post('/forgot-password', asyncHandler(forgotPassword)); // Gửi email reset
router.post('/reset-password/:token', asyncHandler(resetPassword)); // Reset password với token

export default router;
