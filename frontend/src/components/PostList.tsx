import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../scss/PostCart.scss";

// Định nghĩa kiểu dữ liệu của một bài viết
interface Post {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  imageSummary?: string;
  create_at: string;
  hot: number; // Thêm hot
}

// Định nghĩa kiểu dữ liệu phản hồi từ API
interface ApiResponse {
  posts: Post[];
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    axios
      .get<ApiResponse>("http://localhost:5000/api/posts")
      .then((res) => setPosts(res.data.posts))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="post-list container mt-5">
      <h2 className="section-title">Tin mới nhất 🗞️</h2>
     <div className="row align-items-stretch">
        {posts.map((post) => (
          <div className="col-md-4 d-flex mb-4" key={post._id}>
            <div className="card shadow-sm w-100 d-flex flex-column position-relative">
              {post.hot === 1 && (
                <span className="badge bg-danger position-absolute m-2" style={{ alignSelf: "flex-end" }}>
                  HOT
                </span>
              )}
              {post.imageSummary && (
                <div className="card-img-wrapper">
                  <img
                    src={
                      post.imageSummary.startsWith("http")
                        ? post.imageSummary
                        : `/images/posts/${post.imageSummary}`
                    }
                    alt={post.title}
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.summary}</p>
                <Link
                  to={`/posts/${post.slug}`}
                  className="btn btn-primary mt-auto"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
