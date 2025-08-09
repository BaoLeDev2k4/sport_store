import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  option: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  sale_price: { type: Number, default: 0 },
  image: { type: String, required: true },
  quantity: { type: Number, default: 0 }
}, { strict: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  idcate: { type: mongoose.Types.ObjectId, required: true },
  colors: [{ type: String }],
  sizes: [{ type: String }],
  images: [{ type: String }],
  variants: [variantSchema],
  hot: { type: Number, default: 0 },
  view: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'InActive'], default: 'Active' },
  description: { type: String },
  flag: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema, 'DATN-sport.products');

export default Product;
