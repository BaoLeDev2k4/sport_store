import { Request, Response } from "express";
import Post from "../models/postModel.js";
import slugify from "slugify";
import asyncHandler from "express-async-handler";

export const getPosts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const isAdmin = req.query.admin === "1";
  const { search, status } = req.query;

  // Build filter object
  let filter: any = isAdmin ? {} : { status: 1 };

  // Add search filter
  if (search && typeof search === 'string') {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ];
  }

  // Add status filter for admin
  if (isAdmin && status !== undefined && status !== '') {
    filter.status = Number(status);
  }

  const sortStr = isAdmin ? "-create_at" : "-hot -create_at";
  const posts = await Post.find(filter).sort(sortStr);

  res.json({ posts });
});

// ✅ Lấy bài viết theo slug (client xem)
export const getPostBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const post = await Post.findOne({ slug: req.params.slug, status: 1 });
  if (!post) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  post.view += 1;
  await post.save();
  res.json(post);
});

// ✅ Lấy bài viết theo ID (admin dùng)
export const getPostById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json(post);
});

// ✅ Tạo bài viết mới
export const createPost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const post = new Post({
    ...req.body,
    slug: slugify(req.body.title, { lower: true, strict: true }),
    imageSummary: req.file?.filename || req.body.imageSummary,
  });
  await post.save();
  res.status(201).json(post);
});

// ✅ Cập nhật bài viết
export const updatePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const oldPost = await Post.findById(req.params.id);
  if (!oldPost) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  const updatedData = {
    ...req.body,
    slug: req.body.title
      ? slugify(req.body.title, { lower: true, strict: true })
      : oldPost.slug,
    imageSummary:
      req.file?.filename || req.body.imageSummary || oldPost.imageSummary,
  };

  const updated = await Post.findByIdAndUpdate(
    req.params.id,
    updatedData,
    { new: true }
  );

  res.json(updated);
});

// ✅ Xoá bài viết
export const deletePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const deleted = await Post.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json({ message: "Deleted successfully" });
});
