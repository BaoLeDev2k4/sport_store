import express from 'express';
import asyncHandler from 'express-async-handler';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import {
  getDashboardStats,
  getRevenueChart,
  getTopProductsFiltered,
  getProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getUsersAdmin,
  getUserById,
  toggleUserStatus,
  getUserStats,
  checkAdminStatus
} from '../controllers/adminController.js';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import {
  getBannersAdmin,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';

const router = express.Router();

// Áp dụng middleware cho tất cả routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard/stats', asyncHandler(getDashboardStats));
router.get('/dashboard/revenue-chart', asyncHandler(getRevenueChart));
router.get('/dashboard/top-products', asyncHandler(getTopProductsFiltered));

// Products Management
router.get('/products', asyncHandler(getProductsAdmin));
router.post('/products', asyncHandler(createProduct));
router.put('/products/:id', asyncHandler(updateProduct));
router.delete('/products/:id', asyncHandler(deleteProduct));

// Categories Management
router.get('/categories', asyncHandler(getCategoriesAdmin));
router.post('/categories', asyncHandler(createCategory));
router.put('/categories/:id', asyncHandler(updateCategory));
router.delete('/categories/:id', asyncHandler(deleteCategory));

// Users Management
router.get('/users', asyncHandler(getUsersAdmin));
router.get('/users/:id', asyncHandler(getUserById));
router.get('/users/:id/stats', asyncHandler(getUserStats));
router.put('/users/:id/status', asyncHandler(toggleUserStatus));

// Orders Management
router.get('/orders', asyncHandler(getAllOrders));
router.get('/orders/:id', asyncHandler(getOrderById));
router.patch('/orders/:id/status', asyncHandler(updateOrderStatus));

// Banners Management
router.get('/banners', asyncHandler(getBannersAdmin));
router.get('/banners/:id', asyncHandler(getBannerById));
router.post('/banners', asyncHandler(createBanner));
router.put('/banners/:id', asyncHandler(updateBanner));
router.delete('/banners/:id', asyncHandler(deleteBanner));

// Admin Status Check
router.get('/status', asyncHandler(checkAdminStatus));

export default router;
