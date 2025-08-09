import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema, 'DATN-sport.categories');

export default Category;
