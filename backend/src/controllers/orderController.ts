import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import OrderDetail from '../models/orderDetailModel.js';
import Product from '../models/productModel.js';
import { RequestUser } from '../types/RequestUser.js';

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req: RequestUser, res: Response) => {
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

  if (!cartItems || cartItems.length === 0) {
    res.status(400);
    throw new Error('Không có sản phẩm trong giỏ hàng');
  }

  try {
    const order = await Order.create({
      id_user: req.userId,
      id_voucher: id_voucher || null,
      discount_amount,
      total_amount,
      final_total,
      total_payment,
      name,
      phone,
      address,
      note,
      payment_method,
      payment_status: payment_method === 'COD' ? 'Pending' : 'Pending', // Tất cả đều Pending ban đầu
      order_status: 'Processing', // Luôn mặc định "Đang xử lý", nếu muốn random thì thay dòng bên dưới
      // order_status: Math.random() < 0.5 ? 'Shipping' : 'Processing',
    });

    console.log('✅ Order created:', order._id.toString());

    for (const item of cartItems) {
      const detail = await OrderDetail.create({
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

      console.log('📦 OrderDetail saved:', detail._id.toString());

      await Product.updateOne(
        { _id: item.id_product, 'variants._id': item.variant_id },
        { $inc: { 'variants.$.quantity': -item.quantity } }
      );
    }

    res.status(201).json({ message: 'Đặt hàng thành công', orderId: order._id });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error });
  }
});

// @desc    Lấy đơn hàng của người dùng hiện tại
// @route   GET /api/orders/me
// @access  Private
export const getUserOrders = asyncHandler(async (req: RequestUser, res: Response) => {
  const orders = await Order.find({ id_user: req.userId }).sort({ createdAt: -1 });
  const orderIds = orders.map(order => order._id);

  const orderDetails = await OrderDetail.find({ id_order: { $in: orderIds } })
    .populate('id_product', 'name images variants');

  const result = orders.map(order => {
    const details = orderDetails.filter(detail => detail.id_order.toString() === order._id.toString());
    return {
      ...order.toObject(),
      products: details,
    };
  });

  res.status(200).json(result);
});

// PATCH /api/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req: RequestUser, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, id_user: req.userId });

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }

  if (order.order_status !== 'Processing') {
    res.status(400);
    throw new Error('Chỉ đơn đang xử lý mới có thể huỷ');
  }

  const orderDetails = await OrderDetail.find({ id_order: order._id });

  // Trả lại số lượng sản phẩm
  for (const item of orderDetails) {
    await Product.updateOne(
      { _id: item.id_product, 'variants._id': item.variant_id },
      { $inc: { 'variants.$.quantity': item.quantity } }
    );
  }

  order.order_status = 'Cancelled';
  await order.save();

  res.json({ message: 'Đã huỷ đơn hàng thành công' });
});

// ===== ADMIN FUNCTIONS =====

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req: RequestUser, res: Response) => {
  const { page = 1, limit = 10, search = '', status = '' } = req.query;

  const query: any = {};

  // Tìm kiếm theo tên khách hàng, số điện thoại
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Lọc theo trạng thái
  if (status) {
    query.order_status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find(query)
    .populate('id_user', 'name email')
    .populate('id_voucher', 'code discount_value')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(query);

  // Lấy chi tiết đơn hàng cho mỗi order
  const orderIds = orders.map(order => order._id);
  const orderDetails = await OrderDetail.find({ id_order: { $in: orderIds } })
    .populate('id_product', 'name');

  const result = orders.map(order => {
    const details = orderDetails.filter(detail =>
      detail.id_order.toString() === order._id.toString()
    );
    return {
      ...order.toObject(),
      products: details,
      orderCode: `ORD${order._id.toString().slice(-6).toUpperCase()}`
    };
  });

  res.json({
    orders: result,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Lấy chi tiết đơn hàng (Admin)
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export const getOrderById = asyncHandler(async (req: RequestUser, res: Response) => {
  const order = await Order.findById(req.params.id)
    .populate('id_user', 'name email phone')
    .populate('id_voucher', 'code discount_value discount_type');

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }

  const orderDetails = await OrderDetail.find({ id_order: order._id })
    .populate('id_product', 'name images variants');

  const result = {
    ...order.toObject(),
    products: orderDetails,
    orderCode: `ORD${order._id.toString().slice(-6).toUpperCase()}`
  };

  res.json(result);
});

// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req: RequestUser, res: Response) => {
  const { order_status } = req.body;

  const validStatuses = ['Processing', 'Packaging', 'Shipping', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(order_status)) {
    res.status(400);
    throw new Error('Trạng thái đơn hàng không hợp lệ');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }

  // Nếu hủy đơn hàng, trả lại số lượng sản phẩm
  if (order_status === 'Cancelled' && order.order_status !== 'Cancelled') {
    const orderDetails = await OrderDetail.find({ id_order: order._id });

    for (const item of orderDetails) {
      await Product.updateOne(
        { _id: item.id_product, 'variants._id': item.variant_id },
        { $inc: { 'variants.$.quantity': item.quantity } }
      );
    }
  }

  // Cập nhật trạng thái đơn hàng
  order.order_status = order_status;

  // Nếu đơn hàng COD được hoàn thành, tự động cập nhật payment_status thành Completed
  if (order_status === 'Completed' && order.payment_method === 'COD') {
    order.payment_status = 'Completed';
    console.log(`✅ COD Order ${order._id} completed - Payment status updated to Completed`);
  }

  await order.save();

  res.json({
    message: 'Cập nhật trạng thái đơn hàng thành công',
    order: {
      _id: order._id,
      order_status: order.order_status,
      payment_status: order.payment_status
    }
  });
});