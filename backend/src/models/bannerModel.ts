import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'InActive'],
    default: 'Active'
  }
}, {
  timestamps: true,
  collection: 'DATN-sport.banners'
});

// Index để sort theo createdAt
bannerSchema.index({ createdAt: -1 });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
