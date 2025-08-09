import express from 'express';
import {
  createOrder,
  getUserOrders,
  cancelOrder, // ✅ thêm dòng này
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.get('/me', authMiddleware, getUserOrders);

// ✅ Thêm route huỷ đơn hàng
router.patch('/:id/cancel', authMiddleware, cancelOrder);

export default router;
