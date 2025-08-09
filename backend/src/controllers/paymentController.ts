import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import vnpayService from '../services/vnpayService.js';
import tempOrderService from '../services/tempOrderService.js';
import { RequestUser } from '../types/RequestUser.js';



// @desc    Khởi tạo thanh toán VNPay (NEW VERSION - không tạo order trước)
// @route   POST /api/payment/vnpay/create
// @access  Private
export const createVNPayPayment = asyncHandler(async (req: RequestUser, res: Response) => {
  const {
    cartItems,
    name,
    phone,
    address,
    note,
    payment_method,
    id_voucher,
    discount_amount,
    total_amount,
    final_total,
    total_payment,
  } = req.body;

  // Validation
  if (!cartItems || cartItems.length === 0) {
    res.status(400);
    throw new Error('Không có sản phẩm trong giỏ hàng');
  }

  if (!name || !phone || !address || !total_payment) {
    res.status(400);
    throw new Error('Thiếu thông tin bắt buộc');
  }

  try {
    // Tạo temporary order data
    const tempOrderData = {
      userId: req.userId!,
      cartItems,
      name,
      phone,
      address,
      note: note || '',
      payment_method: payment_method || 'VNPAY',
      id_voucher: id_voucher || null,
      discount_amount: discount_amount || 0,
      total_amount,
      final_total,
      total_payment,
    };

    // Lưu vào temp storage
    const tempOrderId = tempOrderService.createTempOrder(tempOrderData);

    // Tạo VNPay payment URL với tempOrderId
    const paymentData = {
      orderId: tempOrderId, // Sử dụng tempOrderId thay vì real orderId
      amount: total_payment,
      orderInfo: `Thanh toan don hang: ${tempOrderId}`,
      ipAddr: vnpayService.getClientIpAddress(req),
    };

    const paymentUrl = vnpayService.createPayment(paymentData);

    res.json({
      success: true,
      payUrl: paymentUrl,
      tempOrderId, // Trả về để debug nếu cần
      message: 'Payment URL created successfully',
    });
  } catch (error) {
    console.error('VNPay payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// @desc    Xử lý return URL VNPay (NEW VERSION - tạo order khi thành công)
// @route   GET /api/payment/vnpay/return
// @access  Public
export const handleVNPayReturn = asyncHandler(async (req: Request, res: Response) => {
  try {
    const vnpParams = req.query;
    const verification = vnpayService.verifyReturnUrl(vnpParams);

    const tempOrderId = vnpParams.vnp_TxnRef as string; // Đây là tempOrderId, không phải orderId thật
    const transactionId = vnpParams.vnp_TransactionNo as string;
    const responseCode = vnpParams.vnp_ResponseCode as string;

    console.log(`🔄 VNPay return: tempOrderId=${tempOrderId}, responseCode=${responseCode}`);

    if (responseCode === '24') {
      // Người dùng hủy giao dịch - Xóa temp order và redirect về checkout
      tempOrderService.deleteTempOrder(tempOrderId);
      console.log(`❌ User cancelled payment: ${tempOrderId}`);
      res.redirect(`${process.env.CLIENT_URL}/checkout`);
      return;
    }

    if (verification.isValid && responseCode === '00') {
      // Thanh toán thành công - Tạo order thực sự
      const tempOrderData = tempOrderService.getTempOrder(tempOrderId);

      if (!tempOrderData) {
        console.log(`❌ Temp order not found or expired: ${tempOrderId}`);
        res.redirect(`${process.env.CLIENT_URL}/payment/result?status=error&message=Order expired`);
        return;
      }

      try {
        // Import OrderDetail và Product để tạo order
        const OrderDetail = (await import('../models/orderDetailModel.js')).default;
        const Product = (await import('../models/productModel.js')).default;

        // Tạo order thực sự
        const order = await Order.create({
          id_user: tempOrderData.userId,
          id_voucher: tempOrderData.id_voucher || null,
          discount_amount: tempOrderData.discount_amount,
          total_amount: tempOrderData.total_amount,
          final_total: tempOrderData.final_total,
          total_payment: tempOrderData.total_payment,
          name: tempOrderData.name,
          phone: tempOrderData.phone,
          address: tempOrderData.address,
          note: tempOrderData.note,
          payment_method: 'VNPAY',
          payment_status: 'Completed', // Đã thanh toán thành công
          order_status: 'Packaging', // Chuyển sang đóng gói
          transaction_id: transactionId,
          payment_gateway_response: vnpParams,
        });

        console.log(`✅ Real order created: ${order._id.toString()}`);

        // Tạo order details và trừ inventory
        for (const item of tempOrderData.cartItems) {
          await OrderDetail.create({
            id_order: order._id,
            id_product: item.id_product,
            variant_id: item.variant_id,
            name: item.name,
            size: item.size,
            color: item.color,
            unit_price: item.unit_price,
            price: item.price,
            quantity: item.quantity,
          });

          // Trừ số lượng sản phẩm
          await Product.updateOne(
            { _id: item.id_product, 'variants._id': item.variant_id },
            { $inc: { 'variants.$.quantity': -item.quantity } }
          );
        }

        // Xóa temp order
        tempOrderService.deleteTempOrder(tempOrderId);

        // Redirect đến trang kết quả với orderId thật
        const redirectUrl = `${process.env.CLIENT_URL}/payment/result?status=success&orderId=${order._id.toString()}`;
        res.redirect(redirectUrl);

      } catch (orderError) {
        console.error('❌ Error creating real order:', orderError);
        // Xóa temp order ngay cả khi lỗi
        tempOrderService.deleteTempOrder(tempOrderId);
        res.redirect(`${process.env.CLIENT_URL}/payment/result?status=error&message=Order creation failed`);
      }

    } else {
      // Thanh toán thất bại (lỗi thẻ, không đủ tiền, etc.)
      console.log(`❌ Payment failed: ${tempOrderId}, responseCode=${responseCode}`);

      // Xóa temp order
      tempOrderService.deleteTempOrder(tempOrderId);

      // Redirect đến trang kết quả
      const redirectUrl = `${process.env.CLIENT_URL}/payment/result?status=failed&tempOrderId=${tempOrderId}`;
      res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('VNPay return error:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment/result?status=error`);
  }
});

// @desc    Xử lý IPN VNPay (NEW VERSION - xử lý với tempOrderId)
// @route   POST /api/payment/vnpay/ipn
// @access  Public
export const handleVNPayIPN = asyncHandler(async (req: Request, res: Response) => {
  try {
    const vnpParams = req.query;
    const tempOrderId = vnpParams.vnp_TxnRef as string; // Đây là tempOrderId
    const responseCode = vnpParams.vnp_ResponseCode as string;
    const verification = vnpayService.verifyIPN(vnpParams);

    console.log(`🔔 VNPay IPN: tempOrderId=${tempOrderId}, responseCode=${responseCode}`);

    if (!verification.isValid) {
      res.status(200).json({ RspCode: verification.rspCode, Message: verification.message });
      return;
    }

    // Kiểm tra temp order tồn tại
    const tempOrderData = tempOrderService.getTempOrder(tempOrderId);
    if (!tempOrderData) {
      console.log(`❌ IPN: Temp order not found: ${tempOrderId}`);
      res.status(200).json({ RspCode: '01', Message: 'Temp order not found or expired' });
      return;
    }

    // Kiểm tra amount (VNPay gửi amount * 100)
    const vnpAmount = parseInt(vnpParams.vnp_Amount as string) / 100;
    if (vnpAmount !== tempOrderData.total_payment) {
      console.log(`❌ IPN: Amount mismatch: ${vnpAmount} vs ${tempOrderData.total_payment}`);
      res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
      return;
    }

    if (responseCode === '00') {
      // Thanh toán thành công - Tạo order thực sự (nếu chưa tạo)
      try {
        // Kiểm tra xem đã có order thật với transaction_id này chưa
        const existingOrder = await Order.findOne({
          transaction_id: vnpParams.vnp_TransactionNo as string
        });

        if (existingOrder) {
          console.log(`✅ IPN: Order already exists: ${existingOrder._id}`);
          res.status(200).json({ RspCode: '00', Message: 'Order already processed' });
          return;
        }

        // Import các model cần thiết
        const OrderDetail = (await import('../models/orderDetailModel.js')).default;
        const Product = (await import('../models/productModel.js')).default;

        // Tạo order thực sự
        const order = await Order.create({
          id_user: tempOrderData.userId,
          id_voucher: tempOrderData.id_voucher || null,
          discount_amount: tempOrderData.discount_amount,
          total_amount: tempOrderData.total_amount,
          final_total: tempOrderData.final_total,
          total_payment: tempOrderData.total_payment,
          name: tempOrderData.name,
          phone: tempOrderData.phone,
          address: tempOrderData.address,
          note: tempOrderData.note,
          payment_method: 'VNPAY',
          payment_status: 'Completed',
          order_status: 'Packaging',
          transaction_id: vnpParams.vnp_TransactionNo as string,
          payment_gateway_response: vnpParams,
        });

        console.log(`✅ IPN: Real order created: ${order._id.toString()}`);

        // Tạo order details và trừ inventory
        for (const item of tempOrderData.cartItems) {
          await OrderDetail.create({
            id_order: order._id,
            id_product: item.id_product,
            variant_id: item.variant_id,
            name: item.name,
            size: item.size,
            color: item.color,
            unit_price: item.unit_price,
            price: item.price,
            quantity: item.quantity,
          });

          await Product.updateOne(
            { _id: item.id_product, 'variants._id': item.variant_id },
            { $inc: { 'variants.$.quantity': -item.quantity } }
          );
        }

        // Xóa temp order
        tempOrderService.deleteTempOrder(tempOrderId);

        res.status(200).json({ RspCode: '00', Message: 'Order created successfully' });

      } catch (orderError) {
        console.error('❌ IPN: Error creating order:', orderError);
        res.status(200).json({ RspCode: '99', Message: 'Order creation failed' });
      }

    } else {
      // Thanh toán thất bại - Xóa temp order
      console.log(`❌ IPN: Payment failed: ${tempOrderId}`);
      tempOrderService.deleteTempOrder(tempOrderId);
      res.status(200).json({ RspCode: '00', Message: 'Payment failed, temp order cleaned' });
    }

  } catch (error) {
    console.error('VNPay IPN error:', error);
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
});
