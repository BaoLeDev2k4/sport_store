import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import { TrendingUp } from 'lucide-react';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartData {
  _id: { year: number; month: number; day?: number };
  revenue: number;
  orders: number;
  isDaily?: boolean;
}

interface RevenueChartProps {
  initialData: RevenueChartData[];
  onFilterChange?: (year: number, month: number | 'all') => void;
}

const RevenueChart = ({ initialData, onFilterChange }: RevenueChartProps) => {
  const [chartData, setChartData] = useState<RevenueChartData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  const monthNames = [
    'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
    'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatCurrencyCompact = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  // Load dữ liệu khi filter thay đổi
  useEffect(() => {
    fetchChartData(selectedYear, selectedMonth);
    if (onFilterChange) onFilterChange(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Lấy danh sách năm (từ 5 năm trước đến 5 năm sau)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  };



  // Fetch dữ liệu biểu đồ theo năm và tháng
  const fetchChartData = async (year: number, month: number | 'all') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const API_URL = 'http://localhost:5000/api/admin';

      let params = `year=${year}`;
      if (month !== 'all') {
        params += `&month=${month}`;
      }

      const response = await axios.get(`${API_URL}/dashboard/revenue-chart?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChartData(response.data.chart || []);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi năm
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Xử lý thay đổi tháng
  const handleMonthChange = (month: number | 'all') => {
    setSelectedMonth(month);
  };

  // Lọc dữ liệu hiển thị
  const getFilteredData = () => {
    // Dữ liệu đã được lọc từ backend, chỉ cần trả về toàn bộ
    return chartData;
  };

  // Tạo labels cho biểu đồ
  const getChartLabels = () => {
    const filteredData = getFilteredData();
    if (selectedMonth === 'all') {
      // Hiển thị theo tháng
      return filteredData.map(item => `${monthNames[item._id.month - 1]}/${item._id.year}`);
    } else {
      // Hiển thị theo ngày trong tháng
      return filteredData.map(item => `Ngày ${item._id.day}`);
    }
  };

  const filteredData = getFilteredData();
  const chartLabels = getChartLabels();

  const chartDataConfig = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Doanh thu',
        data: filteredData.map(item => item.revenue),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },

      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(54, 162, 235, 0.5)',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const value = context.parsed.y;
            return `💰 Doanh thu: ${formatCurrency(value)}`;
          },
          afterLabel: function(context: any) {
            // Tìm số đơn hàng tương ứng
            const dataIndex = context.dataIndex;
            const orders = filteredData[dataIndex]?.orders || 0;
            return `📦 Đơn hàng: ${orders}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6c757d',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6c757d',
          font: {
            size: 12
          },
          callback: function(value: any) {
            return formatCurrencyCompact(Number(value));
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: 'rgb(54, 162, 235)',
        borderColor: '#fff',
        borderWidth: 2
      }
    }
  };

  return (
    <div>
      {/* Header với Filter */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <TrendingUp size={20} className="text-primary me-2" />
          <h6 className="mb-0 fw-bold">Biểu đồ doanh thu</h6>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: '120px' }}
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
          >
            {getYearOptions().reverse().map(year => (
              <option key={year} value={year}>Năm {year}</option>
            ))}
          </select>
          <select
            className="form-select form-select-sm"
            style={{ width: '150px' }}
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">Tất cả tháng</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                Tháng {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Biểu đồ */}
      <div style={{ height: '400px', position: 'relative' }}>
        {loading && (
          <div className="position-absolute top-50 start-50 translate-middle">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        )}
        {!loading && filteredData.length === 0 && (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <div className="text-muted">
              <i className="fas fa-chart-line fa-3x mb-3"></i>
              <p>Không có dữ liệu doanh thu cho {selectedMonth === 'all' ? `năm ${selectedYear}` : `tháng ${selectedMonth}/${selectedYear}`}</p>
            </div>
          </div>
        )}
        {!loading && filteredData.length > 0 && (
          <Line data={chartDataConfig} options={options} />
        )}
      </div>

      {/* Thống kê tóm tắt */}
      <div className="row mt-3 chart-summary">
        <div className="col-md-4">
          <div className="summary-item text-center">
            <div className="summary-value text-primary">
              {formatCurrency(filteredData.reduce((sum, item) => sum + item.revenue, 0))}
            </div>
            <div className="summary-label">Tổng doanh thu</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-item text-center">
            <div className="summary-value text-success">
              {filteredData.reduce((sum, item) => sum + item.orders, 0)}
            </div>
            <div className="summary-label">Tổng đơn hàng</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-item text-center">
            <div className="summary-value text-info">
              {formatCurrency(
                filteredData.length > 0
                  ? filteredData.reduce((sum, item) => sum + item.revenue, 0) / filteredData.length
                  : 0
              )}
            </div>
            <div className="summary-label">
              Trung bình {selectedMonth === 'all' ? 'tháng' : 'ngày'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
