import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "../scss/PostCart.scss";

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  imageSummary?: string;
  create_at: string;
  author?: string;
  view: number;
}

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    axios
      .get<{ post?: Post }>(`http://localhost:5000/api/posts/${slug}`)
      .then((res) => {
        console.log("Chi tiết bài viết:", res.data);
        const data = res.data.post || (res.data as Post); // Giải thích: nếu không có `post` thì coi `res.data` là `Post`
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy bài viết:", err);
        setPost(null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="container mt-5">Đang tải bài viết...</div>;

  if (!post) return <div className="container mt-5">Không tìm thấy bài viết 😢</div>;

  return (
    <div className="container mt-5 post-detail">
      <Link to="/news" className="btn btn-secondary mb-3">← Quay lại tin tức</Link>

      <h2>{post.title}</h2>
      <p className="text-muted">
        Tác giả: {post.author || "Không rõ"} – Lượt xem: {post.view} – Ngày đăng:{" "}
        {new Date(post.create_at).toLocaleDateString("vi-VN")}
      </p>

      {post.imageSummary && (
        <img
          src={
            post.imageSummary.startsWith("http")
              ? post.imageSummary
              : `/images/posts/${post.imageSummary}`
          }
          alt={post.title}
          className="img-fluid mb-4 rounded"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder.jpg';
          }}
        />
      )}

      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
