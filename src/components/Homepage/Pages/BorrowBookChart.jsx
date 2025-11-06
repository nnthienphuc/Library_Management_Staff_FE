import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const BorrowBookChart = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(new Array(12).fill(0));

  const [totalBorrowedBooks, setTotalBorrowedBooks] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);

  useEffect(() => {
    axiosInstance
      .get(`http://localhost:5286/api/admin/statistics/total-borrowed-books`)
      .then((res) => setTotalBorrowedBooks(res.data));

    axiosInstance
      .get(`http://localhost:5286/api/admin/statistics/active-customers`)
      .then((res) => setActiveCustomers(res.data));
  }, []);

  useEffect(() => {
    axiosInstance
      .get(
        `http://localhost:5286/api/admin/statistics/borrow-books?year=${year}`
      )
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [year]);

  const labels = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
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
    data: data,
    datalabels: {
      anchor: "end",
      align: "top",
    },
  },
  {
    type: "line",
    label: "Xu hướng",
    data: data,
    borderColor: "rgba(255, 99, 132, 1)",
    backgroundColor: "rgba(255, 99, 132, 0.1)",
    fill: false,
    tension: 0.3,
    pointBackgroundColor: "#fff",
    pointBorderColor: "rgba(255, 99, 132, 1)",
    datalabels: {
      display: false, // ✅ Tắt hiển thị số trên Line
    },
  },
]

  };

  return (
    <div>
      
      {/* De day mot mo lai */}
      <div className="d-flex gap-4 mb-4">
        <div
          className="p-3 rounded text-white"
          style={{ backgroundColor: "#f48fb1", minWidth: "250px" }}
        >
          <h6 className="mb-1">📘 Sách đang được mượn</h6>
          <h4 className="fw-bold">{totalBorrowedBooks} cuốn</h4>
        </div>

        <div
          className="p-3 rounded text-white"
          style={{ backgroundColor: "#b39ddb", minWidth: "250px" }}
        >
          <h6 className="mb-1">👤 Tổng số khách hàng</h6>
          <h4 className="fw-bold">{activeCustomers}</h4>
        </div>
      </div>

      <h4>Thống kê số lượng sách mượn</h4>
      <select
        className="form-select w-auto mb-3"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      >
        {[2025, 2026, 2027].map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <Bar
        data={chartData}
        options={{
          responsive: true,
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
              font: {
                weight: "bold",
              },
            },
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        }}
      />
    </div>
  );
};

export default BorrowBookChart;
