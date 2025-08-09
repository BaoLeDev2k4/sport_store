import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrderStatusChartProps {
  data: Array<{
    _id: string;
    count: number;
  }>;
  totalOrders: number;
}

const OrderStatusChart = ({ data, totalOrders }: OrderStatusChartProps) => {
  const statusMap: { [key: string]: { color: string; text: string } } = {
    'Processing': { color: '#ffc107', text: 'Đang xử lý' },
    'Packaging': { color: '#007bff', text: 'Đang đóng gói' },
    'Shipping': { color: '#17a2b8', text: 'Đang giao' },
    'Completed': { color: '#28a745', text: 'Hoàn thành' },
    'Cancelled': { color: '#dc3545', text: 'Đã hủy' }
  };

  const chartData = {
    labels: data.map(item => statusMap[item._id]?.text || item._id),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map(item => statusMap[item._id]?.color || '#6c757d'),
        borderColor: '#fff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const percentage = ((context.parsed / totalOrders) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} đơn (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
    elements: {
      arc: {
        borderRadius: 4,
      }
    }
  };

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
          {totalOrders}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
          Tổng đơn hàng
        </div>
      </div>
    </div>
  );
};

export default OrderStatusChart;
