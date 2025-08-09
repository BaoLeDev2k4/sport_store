import { ReactNode, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Users,
  ShoppingCart,
  Ticket,
  FileText,
  LogOut,
  Menu,
  X,
  Image
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Sản phẩm' },
    { path: '/categories', icon: FolderOpen, label: 'Danh mục' },
    { path: '/users', icon: Users, label: 'Người dùng' },
    { path: '/orders', icon: ShoppingCart, label: 'Đơn hàng' },
    { path: '/vouchers', icon: Ticket, label: 'Voucher' },
    { path: '/banners', icon: Image, label: 'Banner' },
    { path: '/posts', icon: FileText, label: 'Bài viết' },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div className={`sidebar bg-dark text-white ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header p-3 border-bottom border-secondary">
          <h4 className="mb-0">Sport Store Admin</h4>
          <button 
            className="btn btn-link text-white d-md-none p-0 ms-auto"
            onClick={toggleSidebar}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav flex-grow-1">
          <ul className="nav flex-column p-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className="nav-item mb-2">
                  <Link
                    to={item.path}
                    className={`nav-link text-white d-flex align-items-center p-3 rounded ${
                      isActive ? 'bg-primary' : 'hover-bg-secondary'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={20} className="me-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer p-3 border-top border-secondary">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '40px', height: '40px' }}>
              <Users size={20} />
            </div>
            <div>
              <div className="fw-bold">{user?.username}</div>
              <small className="text-muted">{user?.email}</small>
            </div>
          </div>
          <button 
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
            onClick={logout}
          >
            <LogOut size={16} className="me-2" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-md-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content flex-grow-1 d-flex flex-column">
        {/* Header */}
        <header className="bg-white border-bottom p-3 d-flex align-items-center">
          <button 
            className="btn btn-outline-secondary d-md-none me-3"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
          <h1 className="h4 mb-0">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
