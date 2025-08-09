import express from 'express';
import asyncHandler from 'express-async-handler';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import {
  upload,
  uploadAvatarMulter,
  uploadSingleImage,
  uploadMultipleImages,
  uploadAvatar,
  deleteImage,
  getImagesList
} from '../controllers/uploadController.js';

const router = express.Router();

// ✅ Route upload avatar cho user (chỉ cần auth, không cần admin)
router.post('/avatar', authMiddleware, uploadAvatarMulter.single('image'), asyncHandler(uploadAvatar));

// Áp dụng middleware cho tất cả routes admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Upload single image
router.post('/single/:type', upload.single('image'), asyncHandler(uploadSingleImage));

// Upload multiple images
router.post('/multiple/:type', upload.array('images', 10), asyncHandler(uploadMultipleImages));

// Delete image
router.delete('/:type/:filename', asyncHandler(deleteImage));

// Get images list
router.get('/list/:type', asyncHandler(getImagesList));

export default router;
