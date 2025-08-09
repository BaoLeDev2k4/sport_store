import { Router } from "express";
import {
  getPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import upload from "../middleware/postMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

router.get("/", getPosts);
router.get("/id/:id", authMiddleware, adminMiddleware, getPostById);   // Admin
router.get("/:slug", getPostBySlug);  // Public

router.post("/", authMiddleware, adminMiddleware, upload.single("imageSummary"), createPost);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("imageSummary"), updatePost);
router.delete("/:id", authMiddleware, adminMiddleware, deletePost);

export default router;
