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

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local frontend
    'http://localhost:3000', // Local admin
    process.env.CLIENT_URL || '', // Production frontend
    process.env.ADMIN_URL || ''   // Production admin
  ].filter(url => url !== ''), // Remove empty strings
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files for uploads (Railway persistent storage)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files for images (if needed for backward compatibility)
if (process.env.NODE_ENV !== 'production') {
  app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')));
  app.use('/admin-images', express.static(path.join(__dirname, '../../admin/public/images')));
}

connectDB();

// Khởi động voucher status job
startVoucherStatusJob();
runVoucherStatusUpdate(); // Chạy ngay lập tức khi khởi động

// Health check endpoint cho Railway
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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
