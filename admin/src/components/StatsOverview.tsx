import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsOverviewProps {
  title: string;
  value: string | number;
  growth?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatsOverview = ({ title, value, growth, icon, color, subtitle }: StatsOverviewProps) => {
  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <div className="d-flex align-items-center mt-1">
        {isPositive ? (
          <TrendingUp size={16} className="text-success me-1" />
        ) : (
          <TrendingDown size={16} className="text-danger me-1" />
        )}
        <small className={isPositive ? 'text-success' : 'text-danger'}>
          {Math.abs(growth).toFixed(1)}% so với tháng trước
        </small>
      </div>
    );
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div className="flex-grow-1">
            <h6 className="text-muted mb-1">{title}</h6>
            <h4 className={`mb-0 text-${color}`}>{value}</h4>
            {growth !== undefined && formatGrowth(growth)}
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div className={`bg-${color} rounded-circle d-flex align-items-center justify-content-center`}
               style={{ width: '50px', height: '50px', minWidth: '50px' }}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
