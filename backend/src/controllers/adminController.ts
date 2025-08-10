import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import OrderDetail from '../models/orderDetailModel.js';
import Voucher from '../models/voucherModel.js';
import { RequestUser } from '../types/RequestUser.js';

// Utility function to handle errors
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
};

// Dashboard Overview Statistics
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Tổng số records
  const totalProducts = await Product.countDocuments();
  const totalCategories = await Category.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalVouchers = await Voucher.countDocuments();



  // Doanh thu theo tháng (cho so sánh)
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        order_status: 'Completed',
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total_payment' }
      }
    }
  ]);

  // Doanh thu theo năm
  const yearlyRevenue = await Order.aggregate([
    {
      $match: {
        order_status: 'Completed',
        createdAt: { $gte: startOfYear }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total_payment' }
      }
    }
  ]);

  // Doanh thu theo 12 tháng gần nhất
  const monthlyRevenueChart = await Order.aggregate([
    {
      $match: {
        order_status: 'Completed',
        createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$total_payment' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Top sản phẩm bán chạy - sử dụng OrderDetail
  const completedOrders = await Order.find({ order_status: 'Completed' }).select('_id');
  const completedOrderIds = completedOrders.map(order => order._id);

  const topProducts = await OrderDetail.aggregate([
    { $match: { id_order: { $in: completedOrderIds } } },
    {
      $group: {
        _id: '$id_product',
        productName: { $first: '$name' },
        totalSold: { $sum: '$quantity' },
        revenue: { $sum: '$price' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);

  // Thống kê đơn hàng theo trạng thái
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: '$order_status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Đơn hàng gần đây
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('_id name total_payment order_status createdAt');

  // Người dùng mới gần đây (chỉ user thường, không bao gồm admin)
  const recentUsers = await User.find({ role: 'user' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('username email createdAt');

  // Tăng trưởng so với tháng trước
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const lastMonthRevenue = await Order.aggregate([
    {
      $match: {
        order_status: 'Completed',
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total_payment' }
      }
    }
  ]);

  const lastMonthOrders = await Order.countDocuments({
    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
  });

  const currentMonthOrders = await Order.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  // Tính phần trăm tăng trưởng
  const revenueGrowth = lastMonthRevenue[0]?.total
    ? ((monthlyRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100
    : 0;

  const ordersGrowth = lastMonthOrders
    ? (currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100
    : 0;

    res.json({
      totals: {
        products: totalProducts,
        categories: totalCategories,
        users: totalUsers,
        orders: totalOrders,
        vouchers: totalVouchers
      },
      revenue: {
        monthly: monthlyRevenue[0]?.total || 0,
        yearly: yearlyRevenue[0]?.total || 0,
        chart: monthlyRevenueChart,
        growth: revenueGrowth
      },
      orders: {
        total: totalOrders,
        monthly: currentMonthOrders,
        growth: ordersGrowth,
        byStatus: ordersByStatus,
        recent: recentOrders
      },
      topProducts,
      recentUsers
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê dashboard' });
  }
};

// API riêng cho Revenue Chart
export const getRevenueChart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;

    const selectedYear = year ? Number(year) : new Date().getFullYear();
    const selectedMonth = month ? Number(month) : null;

    let chartData: any[] = [];

    if (selectedMonth) {
      // Lấy dữ liệu theo tháng cụ thể (theo ngày trong tháng)
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);



      chartData = await Order.aggregate([
        {
          $match: {
            order_status: 'Completed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$total_payment' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);



      // Thêm field để đánh dấu đây là dữ liệu theo ngày
      chartData = chartData.map(item => ({
        ...item,
        _id: {
          year: item._id.year,
          month: item._id.month,
          day: item._id.day
        },
        isDaily: true
      }));
    } else {
      // Lấy dữ liệu theo năm (12 tháng trong năm)
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

      chartData = await Order.aggregate([
        {
          $match: {
            order_status: 'Completed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$total_payment' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Thêm field để đánh dấu đây là dữ liệu theo tháng
      chartData = chartData.map(item => ({
        ...item,
        isDaily: false
      }));
    }

    res.json({
      chart: chartData,
      year: selectedYear,
      month: selectedMonth,
      isDaily: selectedMonth !== null
    });
  } catch (error: any) {
    console.error('Revenue chart error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu biểu đồ doanh thu' });
  }
};

// API riêng cho Top Products có filter
export const getTopProductsFiltered = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;

    const selectedYear = year ? Number(year) : new Date().getFullYear();
    const selectedMonth = month ? Number(month) : null;

    let dateFilter: any = { order_status: 'Completed' };

    if (selectedMonth) {
      // Filter theo tháng cụ thể
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
      dateFilter.createdAt = { $gte: startDate, $lte: endDate };
    } else {
      // Filter theo năm (tất cả tháng)
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
      dateFilter.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Lấy orders theo filter
    const filteredOrders = await Order.find(dateFilter).select('_id');
    const filteredOrderIds = filteredOrders.map(order => order._id);

    const topProducts = await OrderDetail.aggregate([
      { $match: { id_order: { $in: filteredOrderIds } } },
      {
        $group: {
          _id: '$id_product',
          productName: { $first: '$name' },
          totalSold: { $sum: '$quantity' },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      topProducts,
      year: selectedYear,
      month: selectedMonth
    });
  } catch (error: any) {
    console.error('Top products filtered error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy top sản phẩm' });
  }
};

// Product Management
export const getProductsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, status, hot, search, flag } = req.query;

    let filter: any = {};

    if (category) filter.idcate = new mongoose.Types.ObjectId(category as string);
    if (status) filter.status = status;
    if (hot) filter.hot = { $ne: 0 };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (flag !== undefined && flag !== '') filter.flag = flag === 'true'; // ✅ Thêm filter flag

    const products = await Product.find(filter)
      .populate('idcate', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error: any) {
    console.error('Error in getProductsAdmin:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate required fields
    const { name, idcate, variants } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Tên sản phẩm không được để trống' });
      return;
    }

    if (!idcate) {
      res.status(400).json({ message: 'Vui lòng chọn danh mục' });
      return;
    }

    if (!variants || variants.length === 0) {
      res.status(400).json({ message: 'Phải có ít nhất một biến thể sản phẩm' });
      return;
    }

    // Validate each variant
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (!variant.option || !variant.option.trim()) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Tùy chọn không được để trống` });
        return;
      }
      if (!variant.size || !variant.size.trim()) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Size không được để trống` });
        return;
      }
      if (!variant.color || !variant.color.trim()) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Màu sắc không được để trống` });
        return;
      }
      if (!variant.price || variant.price <= 0) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Giá phải lớn hơn 0` });
        return;
      }
      if (!variant.image || !variant.image.trim()) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Ảnh không được để trống` });
        return;
      }
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Tạo sản phẩm thành công', product });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate required fields
    const { name, idcate, variants } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Tên sản phẩm không được để trống' });
      return;
    }

    if (!idcate) {
      res.status(400).json({ message: 'Vui lòng chọn danh mục' });
      return;
    }

    if (!variants || variants.length === 0) {
      res.status(400).json({ message: 'Phải có ít nhất một biến thể sản phẩm' });
      return;
    }

    // Validate each variant
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (!variant.option || !variant.option.trim()) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Tùy chọn không được để trống` });
        return;
      }
      if (!variant.size || !variant.size.trim()) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Size không được để trống` });
        return;
      }
      if (!variant.color || !variant.color.trim()) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Màu sắc không được để trống` });
        return;
      }
      if (!variant.price || variant.price <= 0) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Giá phải lớn hơn 0` });
        return;
      }
      if (!variant.image || !variant.image.trim()) {
        res.status(400).json({ message: `Biến thể ${i + 1}: Ảnh không được để trống` });
        return;
      }
    }

    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      return;
    }
    res.json({ message: 'Cập nhật sản phẩm thành công', product });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Kiểm tra xem sản phẩm có trong đơn hàng nào không
  const OrderDetail = (await import('../models/orderDetailModel.js')).default;
  const orderCount = await OrderDetail.countDocuments({ id_product: id });
  if (orderCount > 0) {
    res.status(400).json({
      message: `Không thể xóa sản phẩm này vì đã có ${orderCount} đơn hàng chứa sản phẩm này`
    });
    return;
  }

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    return;
  }
  res.json({ message: 'Xóa sản phẩm thành công' });
};

// Category Management
export const getCategoriesAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    // Đếm số sản phẩm theo danh mục
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ idcate: category._id });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ message: 'Tạo danh mục thành công', category });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
  if (!category) {
    res.status(404).json({ message: 'Không tìm thấy danh mục' });
    return;
  }
  res.json({ message: 'Cập nhật danh mục thành công', category });
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
  const productCount = await Product.countDocuments({ idcate: id });
  if (productCount > 0) {
    res.status(400).json({
      message: `Không thể xóa danh mục này vì còn ${productCount} sản phẩm`
    });
    return;
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    res.status(404).json({ message: 'Không tìm thấy danh mục' });
    return;
  }
  res.json({ message: 'Xóa danh mục thành công' });
};

// User Management
export const getUsersAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    let filter: any = {};

    if (role) filter.role = role;
    if (status !== undefined) filter.isActive = status === 'true';
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password') // Không trả về password
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

export const toggleUserStatus = async (req: RequestUser, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isActive, lockReason } = req.body;

  // Ngăn admin khóa chính tài khoản của mình
  if (req.userId === id && !isActive) {
    res.status(400).json({
      message: 'Bạn không thể khóa tài khoản của chính mình'
    });
    return;
  }

  // Chuẩn bị dữ liệu cập nhật
  const updateData: any = { isActive };

  if (!isActive) {
    // Khi khóa tài khoản
    updateData.lockReason = lockReason || 'Không có lý do cụ thể';
    updateData.lockedAt = new Date();
    updateData.lockedBy = req.userId;
  } else {
    // Khi mở khóa tài khoản
    updateData.lockReason = '';
    updateData.lockedAt = null;
    updateData.lockedBy = null;
  }

  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).select('-password');

  if (!user) {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
    return;
  }

  res.json({
    message: `${isActive ? 'Mở khóa' : 'Khóa'} tài khoản thành công`,
    user
  });
};

// Lấy thống kê chi tiết của user
export const getUserStats = async (req: RequestUser, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Kiểm tra user có tồn tại không
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    // Convert string ID to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(id);

    // Thống kê đơn hàng
    const orderStats = await Order.aggregate([
      {
        $match: { id_user: userObjectId }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total_payment' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$order_status', 'Completed'] }, 1, 0] }
          },
          completedSpent: {
            $sum: { $cond: [{ $eq: ['$order_status', 'Completed'] }, '$total_payment', 0] }
          }
        }
      }
    ]);

    // Đơn hàng theo trạng thái
    const ordersByStatus = await Order.aggregate([
      {
        $match: { id_user: userObjectId }
      },
      {
        $group: {
          _id: '$order_status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total_payment' }
        }
      }
    ]);

    // Đơn hàng gần đây với chi tiết sản phẩm
    const recentOrders = await Order.find({ id_user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id name total_payment order_status createdAt');

    // Lấy chi tiết sản phẩm cho các đơn hàng gần đây
    const orderIds = recentOrders.map(order => order._id);
    const orderDetails = await OrderDetail.find({ id_order: { $in: orderIds } })
      .populate('id_product', 'name images')
      .select('id_order name id_product');

    // Nhóm sản phẩm theo đơn hàng
    const productsByOrder = orderDetails.reduce((acc, detail) => {
      const orderId = detail.id_order.toString();
      if (!acc[orderId]) {
        acc[orderId] = [];
      }
      acc[orderId].push({
        name: detail.name,
        image: typeof detail.id_product === 'object' && (detail.id_product as any).images && (detail.id_product as any).images.length > 0
          ? (detail.id_product as any).images[0]
          : null
      });
      return acc;
    }, {} as { [key: string]: Array<{ name: string; image: string | null }> });

    // Thêm thông tin sản phẩm vào đơn hàng
    const recentOrdersWithProducts = recentOrders.map(order => ({
      ...order.toObject(),
      products: productsByOrder[order._id.toString()] || []
    }));

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      completedOrders: 0,
      completedSpent: 0
    };



    const responseData = {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      },
      stats: {
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        completedOrders: stats.completedOrders,
        completedSpent: stats.completedSpent,
        // Điểm tích lũy (có thể tính theo % của tổng chi tiêu)
        loyaltyPoints: Math.floor(stats.completedSpent / 10000) // 1 điểm cho mỗi 10k VND
      },
      ordersByStatus,
      recentOrders: recentOrdersWithProducts
    };

    res.json(responseData);
  } catch (error: any) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê người dùng' });
  }
};



export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await User.findById(id).select('-password');

  if (!user) {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
    return;
  }

  res.json(user);
};

// Kiểm tra trạng thái tài khoản admin hiện tại
export const checkAdminStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).userId;
    const admin = await User.findById(adminId);

    if (!admin) {
      res.status(404).json({
        message: 'Không tìm thấy tài khoản admin',
        code: 'ADMIN_NOT_FOUND'
      });
      return;
    }

    res.json({
      id: admin._id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      isActive: admin.isActive,
      lockReason: (admin as any).lockReason || null,
      lockedAt: (admin as any).lockedAt || null,
      lockedBy: (admin as any).lockedBy || null,
      lastChecked: new Date()
    });
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    res.status(500).json({
      message: 'Lỗi server khi kiểm tra trạng thái admin',
      error: error.message
    });
  }
};


