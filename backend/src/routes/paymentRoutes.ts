import express from 'express';
import {
  createVNPayPayment,
  handleVNPayReturn,
  handleVNPayIPN,
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// VNPay routes
router.post('/vnpay/create', authMiddleware, createVNPayPayment);
router.get('/vnpay/return', handleVNPayReturn);
router.post('/vnpay/ipn', handleVNPayIPN);

export default router;
