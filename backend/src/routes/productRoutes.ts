import express from 'express';
import {
  getProducts,
  getHotProducts,
  getLatestProducts,
  getRandomProducts,
  getProductById,
  searchProducts // ✅ thêm mới
} from '../controllers/productController.js';

const router = express.Router();

// ✅ Thêm API mới vào router
router.get('/', getProducts);
router.get('/hot', getHotProducts);
router.get('/latest', getLatestProducts);
router.get('/random', getRandomProducts);
router.get('/search', searchProducts); // ✅ thêm dòng này
router.get('/:id', getProductById);

export default router;
