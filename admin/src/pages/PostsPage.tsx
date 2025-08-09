import { useState, useEffect } from 'react';
import { getPosts, deletePost } from '../api/adminApi';
import { Post } from '../types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  FileText
} from 'lucide-react';
import PostModal from '../components/PostModal';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (search?: string, status?: string) => {
    try {
      setLoading(true);
      const response = await getPosts({
        search: search || undefined,
        status: status ? Number(status) : undefined
      });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert('Có lỗi xảy ra khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPosts(searchTerm, statusFilter);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setStatusFilter('');
    fetchPosts('', '');
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deletePost(id);
        fetchPosts();
        alert('Xóa bài viết thành công!');
      } catch (error: any) {
        console.error('Error deleting post:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài viết';
        alert(errorMessage);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const handleModalSuccess = () => {
    fetchPosts();
    handleModalClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <span className="badge bg-success">
        <Eye size={12} className="me-1" />
        Hiển thị
      </span>
    ) : (
      <span className="badge bg-secondary">
        <EyeOff size={12} className="me-1" />
        Ẩn
      </span>
    );
  };

  const getHotBadge = (hot: number) => {
    return hot === 1 ? (
      <span className="badge bg-warning text-dark">
        <Star size={12} className="me-1" />
        Hot
      </span>
    ) : null;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <FileText className="me-2" />
              Quản lý Bài viết
            </h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} className="me-2" />
              Thêm bài viết
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm theo tiêu đề..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="1">Hiển thị</option>
                    <option value="0">Ẩn</option>
                  </select>
                </div>
                <div className="col-md-5">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={handleSearch}
                    >
                      <Search size={16} className="me-2" />
                      Tìm kiếm
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleClearSearch}
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="card">
            <div className="card-body">
              {posts.length === 0 ? (
                <div className="text-center py-4">
                  <FileText size={48} className="text-muted mb-3" />
                  <p className="text-muted">Không có bài viết nào</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Trạng thái</th>
                        <th>Lượt xem</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {post.imageSummary && (
                                <img
                                  src={post.imageSummary.startsWith('http')
                                    ? post.imageSummary
                                    : `/images/posts/${post.imageSummary}`
                                  }
                                  alt={post.title}
                                  className="me-3"
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder.jpg';
                                  }}
                                />
                              )}
                              <div>
                                <div className="fw-bold">{post.title}</div>
                                {post.summary && (
                                  <small className="text-muted">{post.summary.substring(0, 100)}...</small>
                                )}
                                <div className="mt-1">
                                  {getHotBadge(post.hot)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{post.author}</td>
                          <td>{getStatusBadge(post.status)}</td>
                          <td>
                            <span className="badge bg-info">{post.view}</span>
                          </td>
                          <td>{formatDate(post.create_at)}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(post)}
                                title="Chỉnh sửa"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(post._id)}
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* Post Modal */}
      {showModal && (
        <PostModal
          post={editingPost}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
