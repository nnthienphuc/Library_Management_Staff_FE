import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BorrowBookChart = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(new Array(12).fill(0));

  useEffect(() => {
    axiosInstance.get(`http://localhost:5286/api/admin/statistics/borrow-books?year=${year}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [year]);

  const chartData = {
    labels: [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
    ],
    datasets: [
      {
        label: `Sách mượn trong năm ${year}`,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        data: data,
      },
    ],
  };

  return (
    <div>
      <h4>Thống kê số lượng sách mượn</h4>
      <select
        className="form-select w-auto mb-3"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      >
        {[2025, 2026, 2027].map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: `Tổng số sách mượn theo tháng (${year})` },
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }}
      />
    </div>
  );
};

export default BorrowBookChart;
