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
  destination: (req, file, cb) => {
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
