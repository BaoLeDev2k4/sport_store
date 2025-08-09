import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export interface TimeFilterProps {
  onFilterChange: (period: string, year?: number, month?: number) => void;
  currentFilter: {
    period: string;
    year?: number;
    month?: number;
  };
}

const TimeFilter = ({ onFilterChange, currentFilter }: TimeFilterProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  console.log('Current year:', currentYear);
  console.log('Years array:', years);

  const months = [
    { value: 1, label: 'Tháng 1' }, { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' }, { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' }, { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' }, { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' }, { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' }, { value: 12, label: 'Tháng 12' }
  ];

  const handlePeriodChange = (period: string) => {
    onFilterChange(period, currentYear);
  };

  const handleYearChange = (year: number) => {
    onFilterChange(currentFilter.period, year, currentFilter.month);
  };

  const handleMonthChange = (month: number) => {
    onFilterChange(currentFilter.period, currentFilter.year, month);
  };

  const getDisplayText = () => {
    const { period, year, month } = currentFilter;

    if (period === 'year') {
      return `Năm ${year}`;
    } else if (period === 'month') {
      const monthInfo = months.find(m => m.value === month);
      return `${monthInfo?.label} - ${year}`;
    }
    return 'Chọn thời gian';
  };

  return (
    <div className="position-relative time-filter">
      <button
        className="btn btn-outline-light d-flex align-items-center"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Calendar size={16} className="me-2" />
        {getDisplayText()}
        <ChevronDown size={16} className="ms-2" />
      </button>

      {showDropdown && (
        <div className="dropdown-menu show position-absolute top-100 start-0 mt-1" style={{ minWidth: '300px', zIndex: 1050 }}>
          <div className="p-3">
            {/* Chọn loại thời gian */}
            <div className="mb-3">
              <label className="form-label fw-bold">Loại thời gian:</label>
              <div className="btn-group w-100" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="period"
                  id="period-month"
                  checked={currentFilter.period === 'month'}
                  onChange={() => handlePeriodChange('month')}
                />
                <label className="btn btn-outline-primary" htmlFor="period-month">Tháng</label>



                <input
                  type="radio"
                  className="btn-check"
                  name="period"
                  id="period-year"
                  checked={currentFilter.period === 'year'}
                  onChange={() => handlePeriodChange('year')}
                />
                <label className="btn btn-outline-primary" htmlFor="period-year">Năm</label>
              </div>
            </div>

            {/* Chọn năm */}
            <div className="mb-3">
              <label className="form-label fw-bold">Năm:</label>
              <select
                className="form-select"
                value={currentFilter.year || currentYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>



            {/* Chọn tháng (nếu period là month) */}
            {currentFilter.period === 'month' && (
              <div className="mb-3">
                <label className="form-label fw-bold">Tháng:</label>
                <select
                  className="form-select"
                  value={currentFilter.month || 1}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="d-flex justify-content-end">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setShowDropdown(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeFilter;
