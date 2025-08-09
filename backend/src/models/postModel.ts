import mongoose, { Document, Schema } from "mongoose";
import slugify from "slugify";

// Kiểu TypeScript cho 1 bài viết
export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  imageSummary?: string;
  create_at: Date;
  status: number; // 1 = hiển thị, 0 = ẩn
  author: string;
  view: number;
  hot: number; // 1 = hot
}

const PostSchema = new Schema<IPost>(
  {
    title:        { type: String, required: true, trim: true },
    slug:         { type: String, unique: true },
    content:      { type: String, required: true },
    summary:      { type: String, default: "" },
    imageSummary: { type: String },
    create_at:    { type: Date, default: Date.now },
    status:       { type: Number, default: 1 },
    author:       { type: String, default: "Admin" },
    view:         { type: Number, default: 0 },
    hot:          { type: Number, default: 0 },
  },
  { versionKey: false }
);

// Middleware: Tự động tạo slug nếu chưa có
PostSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});
// ⚡ Tối ưu truy vấn theo hot + create_at
PostSchema.index({ hot: -1, create_at: -1 });

export default mongoose.model<IPost>("Post", PostSchema, "DATN-sport.posts");
