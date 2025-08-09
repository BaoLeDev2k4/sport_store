import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/productModel.js';

// ✅ API: lấy sản phẩm theo danh mục
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.query;

  let filter: any = { flag: true }; // ✅ Chỉ lấy sản phẩm được hiển thị

  if (categoryId) {
    filter.idcate = new mongoose.Types.ObjectId(categoryId as string);
  }

  const products = await Product.find(filter);
  res.json(products);
};

// ✅ API HOT sản phẩm
export const getHotProducts = async (req: Request, res: Response): Promise<void> => {
  const products = await Product.find({
    hot: { $ne: 0 },
    flag: true // ✅ Chỉ lấy sản phẩm được hiển thị
  }).limit(10);
  res.json(products);
};

// ✅ API sản phẩm mới nhất
export const getLatestProducts = async (req: Request, res: Response): Promise<void> => {
  const products = await Product.find({ flag: true }) // ✅ Chỉ lấy sản phẩm được hiển thị
    .sort({ createdAt: -1 }).limit(8);
  res.json(products);
};

// ✅ API random sản phẩm
export const getRandomProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter = { flag: true }; // ✅ Chỉ lấy sản phẩm được hiển thị
    const total = await Product.countDocuments(filter);
    const sampleSize = Math.min(total, 20);

    const products = await Product.aggregate([
      { $match: filter }, // ✅ Chỉ lấy sản phẩm được hiển thị
      { $sample: { size: sampleSize } }
    ]);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm ngẫu nhiên' });
  }
};

// ✅ API lấy sản phẩm theo ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({
      _id: id,
      flag: true // ✅ Chỉ lấy sản phẩm được hiển thị
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ API tìm kiếm sản phẩm theo tên
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  const { keyword } = req.query;

  if (!keyword || typeof keyword !== 'string') {
    res.status(400).json({ message: 'Keyword is required' });
    return;
  }

  try {
    const regex = new RegExp(keyword, 'i'); // không phân biệt hoa thường
    const products = await Product.find({
      name: { $regex: regex },
      flag: true // ✅ Chỉ tìm trong sản phẩm được hiển thị
    }).limit(10);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tìm kiếm sản phẩm' });
  }
};
