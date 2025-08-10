import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
// import couponRoutes from './routes/couponRoutes.js'; // Đã gộp vào voucher
import orderRoutes from './routes/orderRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import postRoutes from "./routes/postRoutes.js";
import contactRoutes from './routes/contactRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { startVoucherStatusJob, runVoucherStatusUpdate } from './jobs/voucherStatusJob.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files for images
app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')));
// Serve static files for admin images
app.use('/admin-images', express.static(path.join(__dirname, '../../admin/public/images')));

connectDB();

// Khởi động voucher status job
startVoucherStatusJob();
runVoucherStatusUpdate(); // Chạy ngay lập tức khi khởi động

app.use('/api/auth', authRoutes);
// app.use('/api/coupons', couponRoutes); // Đã gộp vào voucher
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use("/api/posts", postRoutes); // Route bài viết
app.use('/api/contact', contactRoutes); // Route liên hệ
app.use('/api/payment', paymentRoutes); // Route thanh toán

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
