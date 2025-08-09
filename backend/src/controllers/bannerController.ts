import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Banner from '../models/bannerModel.js';

// @desc    Lấy danh sách banner (public)
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find({ status: 'Active' })
      .sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy danh sách banner cho admin
// @route   GET /api/admin/banners
// @access  Private/Admin
export const getBannersAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, search } = req.query;

  const query: any = {};

  // Filter theo status
  if (status && status !== 'all') {
    query.status = status;
  }

  // Search theo title hoặc description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const banners = await Banner.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Banner.countDocuments(query);

  res.json({
    banners,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Lấy banner theo ID
// @route   GET /api/admin/banners/:id
// @access  Private/Admin
export const getBannerById = asyncHandler(async (req: Request, res: Response) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner không tồn tại');
  }

  res.json(banner);
});

// @desc    Tạo banner mới
// @route   POST /api/admin/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req: Request, res: Response) => {
  const { title, image, description, status } = req.body;

  // Validation
  if (!title || !image) {
    res.status(400);
    throw new Error('Title và image là bắt buộc');
  }

  const banner = await Banner.create({
    title,
    image,
    description: description || '',
    status: status || 'Active'
  });

  res.status(201).json({
    message: 'Tạo banner thành công',
    banner
  });
});

// @desc    Cập nhật banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req: Request, res: Response) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner không tồn tại');
  }

  const { title, image, description, status } = req.body;

  // Validation
  if (!title || !image) {
    res.status(400);
    throw new Error('Title và image là bắt buộc');
  }

  const updatedBanner = await Banner.findByIdAndUpdate(
    req.params.id,
    {
      title,
      image,
      description: description || '',
      status: status || 'Active'
    },
    { new: true }
  );

  res.json({
    message: 'Cập nhật banner thành công',
    banner: updatedBanner
  });
});

// @desc    Xóa banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req: Request, res: Response) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner không tồn tại');
  }

  await Banner.findByIdAndDelete(req.params.id);

  res.json({
    message: 'Xóa banner thành công'
  });
});


