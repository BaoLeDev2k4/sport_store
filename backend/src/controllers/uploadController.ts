import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tạo thư mục nếu chưa tồn tại
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Cấu hình multer cho upload
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const uploadType = req.params.type; // 'products', 'categories', 'banners', 'avatars'

    // Nếu là banners, upload vào admin folder
    if (uploadType === 'banners') {
      const uploadPath = path.join(process.cwd(), '../admin/public/images', uploadType);
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    } else if (uploadType === 'avatars') {
      // Avatar upload vào frontend/public/images/avatars
      const uploadPath = path.join(process.cwd(), '../frontend/public/images/avatars');
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    } else {
      // Các loại khác vẫn upload vào frontend
      const uploadPath = path.join(process.cwd(), '../frontend/public/images', uploadType);
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    }
  },
  filename: (_req, file, cb) => {
    // Giữ hoàn toàn nguyên tên file gốc
    cb(null, file.originalname);
  }
});

// Cấu hình multer riêng cho avatar
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(process.cwd(), '../frontend/public/images/avatars');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    // Giữ nguyên tên file gốc
    cb(null, file.originalname);
  }
});

// Filter file types
const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
});

export const uploadAvatarMulter = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB cho avatar
  },
  fileFilter: fileFilter
});

// Upload single image
export const uploadSingleImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'Không có file được upload' });
    return;
  }

  const uploadType = req.params.type;
  const file = req.file;

  res.json({
    message: 'Upload thành công',
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    path: `/images/${uploadType}/${file.filename}`
  });
};

// Upload multiple images (cho variants)
export const uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    res.status(400).json({ message: 'Không có file được upload' });
    return;
  }

  const uploadType = req.params.type;
  const files = req.files as Express.Multer.File[];
  const uploadedFiles = [];

  for (const file of files) {
    uploadedFiles.push({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: `/images/${uploadType}/${file.filename}`
    });
  }

  res.json({
    message: 'Upload thành công',
    files: uploadedFiles
  });
};

// ✅ Upload avatar cho user
export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Không có file được upload' });
      return;
    }

    const filename = req.file.filename;
    res.json({
      message: 'Upload avatar thành công',
      filename: filename,
      url: `/images/avatars/${filename}`
    });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa ảnh
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  const { type, filename } = req.params;
  const filePath = path.join(process.cwd(), '../frontend/public/images', type, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: 'Xóa ảnh thành công' });
  } else {
    res.status(404).json({ message: 'Không tìm thấy file' });
  }
};

// Lấy danh sách ảnh trong thư mục
export const getImagesList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params; // 'products', 'categories', 'posts'
    const imagesPath = path.join(process.cwd(), '../frontend/public/images', type);

    if (!fs.existsSync(imagesPath)) {
      res.json({ images: [] });
      return;
    }

    const files = fs.readdirSync(imagesPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    });

    res.json({ images: imageFiles });
  } catch (error: any) {
    console.error('Error getting images list:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
