import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    id_voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
      default: null,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    final_total: {
      type: Number,
      required: true,
    },
    total_payment: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    payment_method: {
      type: String,
      enum: ['COD', 'VNPAY'],
      default: 'COD',
    },
    payment_status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
      default: 'Pending',
    },
    transaction_id: {
      type: String,
      default: null,
    },
    payment_url: {
      type: String,
      default: null,
    },
    payment_gateway_response: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    order_status: {
      type: String,
      enum: ['Processing', 'Packaging', 'Shipping', 'Completed', 'Cancelled'],
      default: 'Processing',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema, 'DATN-sport.orders');
