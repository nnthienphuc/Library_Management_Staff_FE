import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function StatisticsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(new Array(12).fill(0));
  const [totalBorrowedBooks, setTotalBorrowedBooks] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);

  useEffect(() => {
    axiosInstance.get(`http://localhost:5286/api/admin/statistics/total-borrowed-books`)
      .then(res => setTotalBorrowedBooks(res.data));
    axiosInstance.get(`http://localhost:5286/api/admin/statistics/active-customers`)
      .then(res => setActiveCustomers(res.data));
  }, []);

  useEffect(() => {
    axiosInstance
      .get(`http://localhost:5286/api/admin/statistics/borrow-books?year=${year}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [year]);

  const labels = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];

  const chartData = {
    labels,
    datasets: [
      {
        type: "bar",
        label: `Sách mượn trong năm ${year}`,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        data,
        datalabels: { anchor: "end", align: "top" },
      },
      {
        type: "line",
        label: "Xu hướng",
        data,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        fill: false,
        tension: 0.3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "rgba(255, 99, 132, 1)",
        datalabels: { display: false },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 👈 giúp chart co giãn theo container
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Tổng số sách mượn theo tháng (${year})`,
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: Math.round,
        font: { weight: "bold" },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 mb-4">
  <div
    className="p-4 rounded text-white flex-1 min-w-[260px] max-w-[320px] shadow-sm"
    style={{
      backgroundColor: "#f48fb1",
      flexBasis: "280px",
      flexGrow: 0,
    }}
  >
    <h6 className="mb-1 text-base fw-semibold">📘 Sách đang được mượn</h6>
    <h3 className="fw-bold mb-0" style={{ fontSize: "1.6rem" }}>
      {totalBorrowedBooks} cuốn
    </h3>
  </div>

  <div
    className="p-4 rounded text-white flex-1 min-w-[260px] max-w-[320px] shadow-sm"
    style={{
      backgroundColor: "#b39ddb",
      flexBasis: "280px",
      flexGrow: 0,
    }}
  >
    <h6 className="mb-1 text-base fw-semibold">👤 Tổng số khách hàng</h6>
    <h3 className="fw-bold mb-0" style={{ fontSize: "1.6rem" }}>
      {activeCustomers}
    </h3>
  </div>
</div>


      <div className="flex items-center justify-between">
        <h4>Thống kê số lượng sách mượn</h4>
        <select
          className="form-select w-auto"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div
        style={{
          width: "100%",
          height: "50vh", // 👈 giới hạn chiều cao chart (responsive)
          maxHeight: "500px",
          minHeight: "300px",
        }}
      >
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
