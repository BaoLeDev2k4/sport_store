import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true }, // int32 - số tiền giảm
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Active', 'InActive', 'Expired', 'out_of_stock'],
    default: 'Active'
  },
  quantity: { type: Number, required: true }, // số lượng voucher
  description: { type: String, default: '' },
  min_order_amount: { type: Number, default: 0 } // Số tiền tối thiểu để áp dụng voucher
}, { timestamps: true });

// Virtual field để tự động cập nhật trạng thái dựa trên thời gian
voucherSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  if (this.status === 'InActive') return 'InActive';
  if (this.status === 'out_of_stock') return 'out_of_stock';
  if (now < this.start_date) return 'upcoming';
  if (now > this.end_date) return 'Expired';
  if (this.quantity <= 0) return 'out_of_stock';
  return 'Active';
});

// Ensure virtual fields are serialized
voucherSchema.set('toJSON', { virtuals: true });

const Voucher = mongoose.model('Voucher', voucherSchema, 'DATN-sport.vouchers');

export default Voucher;
