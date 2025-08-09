import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  company: String,
  address: String,
  city: String,
  district: String,
  ward: String,
  zip: String,
  default: Boolean
}, { _id: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },  // ✅ Thêm phone ở đây
  avatar: { type: String, default: '' },
  role: { type: String, default: 'user' },
  address: [addressSchema],
  isActive: { type: Boolean, default: true },
  lockReason: { type: String, default: '' }, // ✅ Thêm lý do khóa tài khoản
  lockedAt: { type: Date, default: null }, // ✅ Thêm thời gian khóa
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // ✅ Admin nào khóa
  resetPasswordToken: { type: String, default: null }, // ✅ Token reset password
  resetPasswordExpires: { type: Date, default: null } // ✅ Thời gian hết hạn token
}, { timestamps: true });

const User = mongoose.model('User', userSchema, 'DATN-sport.users');

export default User;
