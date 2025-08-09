import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/adminApi';
import { DashboardStats } from '../types';
import RevenueChart from '../components/RevenueChart';
import OrderStatusChart from '../components/OrderStatusChart';
import axios from 'axios';

import '../styles/dashboard.scss';
import {
  Package,
  FolderOpen,
  Users,
  ShoppingCart,
  Ticket,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  UserPlus
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topLoading, setTopLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({ year: new Date().getFullYear(), month: 'all' as number | 'all' });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data);
      setTopProducts(response.data.topProducts);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async (year: number, month: number | 'all') => {
    setTopLoading(true);
    setCurrentFilter({ year, month });
    try {
      let params = `year=${year}`;
      if (month !== 'all') params += `&month=${month}`;
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`http://localhost:5000/api/admin/dashboard/top-products?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopProducts(res.data.topProducts);
    } catch (err) {
      console.error('Error fetching top products:', err);
      setTopProducts([]);
    } finally {
      setTopLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);



  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="alert alert-danger" role="alert">
        Không thể tải dữ liệu dashboard
      </div>
    );
  }

  const statCards = [
    {
      title: 'Sản phẩm',
      value: stats.totals.products,
      icon: Package,
      color: 'primary',
      bgColor: 'bg-primary'
    },
    {
      title: 'Danh mục',
      value: stats.totals.categories,
      icon: FolderOpen,
      color: 'success',
      bgColor: 'bg-success'
    },
    {
      title: 'Người dùng',
      value: stats.totals.users,
      icon: Users,
      color: 'info',
      bgColor: 'bg-info'
    },
    {
      title: 'Đơn hàng',
      value: stats.totals.orders,
      icon: ShoppingCart,
      color: 'warning',
      bgColor: 'bg-warning'
    },
    {
      title: 'Voucher',
      value: stats.totals.vouchers,
      icon: Ticket,
      color: 'secondary',
      bgColor: 'bg-secondary'
    }
  ];

  // Prepare chart data
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const chartLabels = stats.revenue.chart.map(item => 
    `${monthNames[item._id.month - 1]} ${item._id.year}`
  );



  const ordersData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Số đơn hàng',
        data: stats.revenue.chart.map(item => item.orders),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div>
      {/* Header Dashboard */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm dashboard-header">
            <div className="card-body text-white">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h2 className="mb-2">Dashboard Thống Kê</h2>
                  <p className="mb-0 opacity-75">
                    Tổng quan hoạt động kinh doanh Sport Store
                  </p>
                </div>
                <div className="col-md-2 text-center">
                  <div className="h4 mb-0">{stats.totals.orders}</div>
                  <small className="opacity-75">Tổng đơn hàng</small>
                </div>
                <div className="col-md-2 text-center">
                  <div className="h4 mb-0">{formatCurrency(stats.revenue.yearly)}</div>
                  <small className="opacity-75">Doanh thu năm</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Stats Cards */}
      <div className="row mb-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="col-md-6 col-xl mb-3">
              <div className="card h-100 border-0 shadow-sm stats-card">
                <div className="card-body d-flex align-items-center">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${card.bgColor}`}
                       style={{ width: '60px', height: '60px' }}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">{card.title}</h6>
                    <h3 className="mb-0">{card.value.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Cards với Growth */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-muted mb-1">Doanh thu tháng này</h6>
                  <h4 className="mb-0 text-success">{formatCurrency(stats.revenue.monthly)}</h4>
                  <div className="d-flex align-items-center mt-1">
                    {stats.revenue.growth >= 0 ? (
                      <TrendingUp size={16} className="text-success me-1" />
                    ) : (
                      <TrendingDown size={16} className="text-danger me-1" />
                    )}
                    <small className={stats.revenue.growth >= 0 ? 'text-success' : 'text-danger'}>
                      {Math.abs(stats.revenue.growth).toFixed(1)}% so với tháng trước
                    </small>
                  </div>
                </div>
                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '50px', height: '50px' }}>
                  <DollarSign size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-muted mb-1">Doanh thu năm nay</h6>
                  <h4 className="mb-0 text-info">{formatCurrency(stats.revenue.yearly)}</h4>
                  <small className="text-muted">Tổng cộng</small>
                </div>
                <div className="bg-info rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '50px', height: '50px' }}>
                  <TrendingUp size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-muted mb-1">Đơn hàng tháng này</h6>
                  <h4 className="mb-0 text-primary">{stats.orders.monthly}</h4>
                  <div className="d-flex align-items-center mt-1">
                    {stats.orders.growth >= 0 ? (
                      <TrendingUp size={16} className="text-success me-1" />
                    ) : (
                      <TrendingDown size={16} className="text-danger me-1" />
                    )}
                    <small className={stats.orders.growth >= 0 ? 'text-success' : 'text-danger'}>
                      {Math.abs(stats.orders.growth).toFixed(1)}% so với tháng trước
                    </small>
                  </div>
                </div>
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '50px', height: '50px' }}>
                  <Activity size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Thống kê trạng thái đơn hàng */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Trạng thái đơn hàng</h5>
            </div>
            <div className="card-body">
              <OrderStatusChart
                data={stats.orders.byStatus}
                totalOrders={stats.totals.orders}
              />
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Đơn hàng gần đây</h5>
              <Clock size={16} className="text-muted" />
            </div>
            <div className="card-body">
              {stats.orders.recent.map((order, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div>
                    <div className="fw-bold">{order.customer_name}</div>
                    <small className="text-muted">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </small>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-success">{formatCurrency(order.total_payment)}</div>
                    <span className={`badge bg-${
                      order.order_status === 'Processing' ? 'warning' :
                      order.order_status === 'Packaging' ? 'primary' :
                      order.order_status === 'Shipping' ? 'info' :
                      order.order_status === 'Completed' ? 'success' : 'danger'
                    }`}>
                      {order.order_status === 'Processing' ? 'Đang xử lý' :
                       order.order_status === 'Packaging' ? 'Đang đóng gói' :
                       order.order_status === 'Shipping' ? 'Đang giao' :
                       order.order_status === 'Completed' ? 'Hoàn thành' : 'Đã hủy'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Người dùng mới</h5>
              <UserPlus size={16} className="text-muted" />
            </div>
            <div className="card-body">
              {stats.recentUsers.map((user, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div>
                    <div className="fw-bold">{user.username}</div>
                    <small className="text-muted">{user.email}</small>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-lg-8 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <RevenueChart
                initialData={stats.revenue.chart}
                onFilterChange={fetchTopProducts}
              />
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0"> Đơn hàng hoàn thành theo tháng</h5>
            </div>
            <div className="card-body">
              <Bar
                data={ordersData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Top 10 sản phẩm bán chạy</h5>
                <small className="text-muted">
                  {currentFilter.month === 'all' ? `Năm ${currentFilter.year}` : `Tháng ${currentFilter.month}/${currentFilter.year}`}
                </small>
              </div>
            </div>
            <div className="card-body">
              {topLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Đã bán</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(topProducts) && topProducts.length > 0 ? (
                        topProducts.map((product, index) => (
                          <tr key={product._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                     style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                  {index + 1}
                                </div>
                                {product.productName}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-success">{product.totalSold}</span>
                            </td>
                            <td className="text-success fw-bold">
                              {formatCurrency(product.revenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center text-muted py-4">
                            Không có dữ liệu sản phẩm bán chạy
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
