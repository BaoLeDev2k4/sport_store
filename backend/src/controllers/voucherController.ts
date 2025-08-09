import { Request, Response } from 'express';
import Voucher from '../models/voucherModel.js';

// Helper function để parse min_order_amount từ description
const parseMinOrderAmount = (description: string): number => {
  // Tìm pattern "từ XXXk trở lên" hoặc "từ XXX.XXXk trở lên"
  const patterns = [
    /từ\s+(\d+(?:\.\d+)?)k\s+trở\s+lên/i,
    /từ\s+(\d+(?:,\d+)?)k\s+trở\s+lên/i,
    /từ\s+(\d+)k\s+trở\s+lên/i,
    /đơn\s+hàng\s+từ\s+(\d+(?:\.\d+)?)k/i,
    /đơn\s+hàng\s+từ\s+(\d+(?:,\d+)?)k/i,
    /đơn\s+hàng\s+từ\s+(\d+)k/i
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      return amount * 1000; // Convert k to actual amount
    }
  }

  return 0; // Không có điều kiện tối thiểu
};

// User: Lấy danh sách vouchers có thể sử dụng
export const getVouchers = async (req: Request, res: Response): Promise<void> => {
  const now = new Date();

  // Lấy tất cả voucher và cập nhật trạng thái
  const vouchers = await Voucher.find({}).sort({ createdAt: -1 });

  // Cập nhật trạng thái voucher dựa trên thời gian và số lượng
  const updatedVouchers = await Promise.all(vouchers.map(async voucher => {
    let currentStatus = voucher.status;

    // Parse min_order_amount từ description nếu chưa có
    let minOrderAmount = voucher.min_order_amount || 0;
    if (!voucher.min_order_amount && voucher.description) {
      minOrderAmount = parseMinOrderAmount(voucher.description);
      // Cập nhật vào database
      if (minOrderAmount > 0) {
        await Voucher.findByIdAndUpdate(voucher._id, { min_order_amount: minOrderAmount });
      }
    }

    if (voucher.status === 'Active') {
      if (now > voucher.end_date) {
        currentStatus = 'Expired';
      } else if (voucher.quantity <= 0) {
        currentStatus = 'out_of_stock';
      } else if (now < voucher.start_date) {
        currentStatus = 'InActive'; // Chưa đến ngày bắt đầu
      }
    }

    return {
      ...voucher.toObject(),
      currentStatus,
      isExpired: now > voucher.end_date,
      isOutOfStock: voucher.quantity <= 0,
      isNotStarted: now < voucher.start_date,
      canUse: currentStatus === 'Active' && now >= voucher.start_date && now <= voucher.end_date && voucher.quantity > 0,
      min_order_amount: minOrderAmount
    };
  }));

  res.json(updatedVouchers);
};

// Admin: Lấy tất cả vouchers
export const getVouchersAdmin = async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, search } = req.query;

  let filter: any = {};

  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const vouchers = await Voucher.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

  // Cập nhật trạng thái tự động dựa trên thời gian
  const vouchersWithStatus = await Promise.all(vouchers.map(async (voucher) => {
    const now = new Date();
    let currentStatus = voucher.status;
    let shouldUpdate = false;

    if (voucher.status === 'Active') {
      if (now > voucher.end_date) {
        currentStatus = 'Expired';
        shouldUpdate = true;
      } else if (voucher.quantity <= 0) {
        currentStatus = 'out_of_stock';
        shouldUpdate = true;
      }
    }

    // Cập nhật database nếu status thay đổi
    if (shouldUpdate) {
      await Voucher.findByIdAndUpdate(voucher._id, { status: currentStatus });
    }

    return {
      ...voucher.toObject(),
      status: currentStatus, // Sử dụng status đã cập nhật
      currentStatus,
      isExpired: now > voucher.end_date,
      isOutOfStock: voucher.quantity <= 0
    };
  }));

  const total = await Voucher.countDocuments(filter);

  res.json({
    vouchers: vouchersWithStatus,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    }
  });
};

// Admin: Tạo voucher mới
export const createVoucher = async (req: Request, res: Response): Promise<void> => {
  const { code, discount, start_date, end_date, quantity, description } = req.body;

  // Kiểm tra mã voucher đã tồn tại
  const existingVoucher = await Voucher.findOne({ code });
  if (existingVoucher) {
    res.status(400).json({ message: 'Mã voucher đã tồn tại' });
    return;
  }

  // Validate dates
  if (new Date(start_date) >= new Date(end_date)) {
    res.status(400).json({ message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' });
    return;
  }

  const voucher = new Voucher({
    code,
    discount,
    start_date,
    end_date,
    quantity,
    description,
    status: 'Active'
  });

  await voucher.save();
  res.status(201).json({ message: 'Tạo voucher thành công', voucher });
};

// Admin: Cập nhật voucher
export const updateVoucher = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { code, discount, start_date, end_date, quantity, description, status } = req.body;

  // Kiểm tra mã voucher đã tồn tại (trừ voucher hiện tại)
  if (code) {
    const existingVoucher = await Voucher.findOne({ code, _id: { $ne: id } });
    if (existingVoucher) {
      res.status(400).json({ message: 'Mã voucher đã tồn tại' });
      return;
    }
  }

  // Validate dates
  if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
    res.status(400).json({ message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' });
    return;
  }

  const voucher = await Voucher.findByIdAndUpdate(
    id,
    { code, discount, start_date, end_date, quantity, description, status },
    { new: true }
  );

  if (!voucher) {
    res.status(404).json({ message: 'Không tìm thấy voucher' });
    return;
  }

  res.json({ message: 'Cập nhật voucher thành công', voucher });
};

// Admin: Xóa voucher
export const deleteVoucher = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const voucher = await Voucher.findByIdAndDelete(id);
  if (!voucher) {
    res.status(404).json({ message: 'Không tìm thấy voucher' });
    return;
  }

  res.json({ message: 'Xóa voucher thành công' });
};

// Admin: Lấy chi tiết voucher
export const getVoucherById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const voucher = await Voucher.findById(id);

  if (!voucher) {
    res.status(404).json({ message: 'Không tìm thấy voucher' });
    return;
  }

  const now = new Date();
  const voucherWithStatus = {
    ...voucher.toObject(),
    isExpired: now > voucher.end_date,
    isOutOfStock: voucher.quantity <= 0,
    currentStatus: (voucher as any).currentStatus
  };

  res.json(voucherWithStatus);
};

// User: Kiểm tra voucher có hợp lệ không
export const validateVoucher = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;
  const { order_amount } = req.body; // Nhận order_amount từ body
  const voucher = await Voucher.findOne({ code });

  if (!voucher) {
    res.status(404).json({ message: 'Mã voucher không tồn tại' });
    return;
  }

  const now = new Date();

  // Parse min_order_amount từ description nếu chưa có
  let minOrderAmount = voucher.min_order_amount || 0;
  if (!voucher.min_order_amount && voucher.description) {
    minOrderAmount = parseMinOrderAmount(voucher.description);
    // Cập nhật vào database
    if (minOrderAmount > 0) {
      await Voucher.findByIdAndUpdate(voucher._id, { min_order_amount: minOrderAmount });
    }
  }

  // Cập nhật status nếu cần thiết trước khi validate
  let currentStatus = voucher.status;
  if (voucher.status === 'Active') {
    if (now > voucher.end_date) {
      currentStatus = 'Expired';
      await Voucher.findByIdAndUpdate(voucher._id, { status: 'Expired' });
    } else if (voucher.quantity <= 0) {
      currentStatus = 'out_of_stock';
      await Voucher.findByIdAndUpdate(voucher._id, { status: 'out_of_stock' });
    }
  }

  // Validate với status đã cập nhật
  if (currentStatus !== 'Active') {
    res.status(400).json({ message: 'Voucher không hoạt động' });
    return;
  }

  if (now < voucher.start_date) {
    res.status(400).json({ message: 'Voucher chưa có hiệu lực' });
    return;
  }

  if (now > voucher.end_date) {
    res.status(400).json({ message: 'Voucher đã hết hạn' });
    return;
  }

  if (voucher.quantity <= 0) {
    res.status(400).json({ message: 'Voucher đã hết số lượng' });
    return;
  }

  // Kiểm tra điều kiện giá trị đơn hàng tối thiểu
  if (order_amount && minOrderAmount > 0 && order_amount < minOrderAmount) {
    res.status(400).json({
      message: `Đơn hàng phải có giá trị tối thiểu ${minOrderAmount.toLocaleString()}₫ để sử dụng voucher này`,
      min_order_amount: minOrderAmount,
      current_order_amount: order_amount
    });
    return;
  }

  res.json({
    message: 'Voucher hợp lệ',
    voucher: {
      code: voucher.code,
      discount: voucher.discount,
      description: voucher.description,
      min_order_amount: minOrderAmount
    }
  });
};
