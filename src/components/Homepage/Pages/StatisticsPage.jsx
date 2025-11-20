import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

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

  // --- RANGE statistics state ---
  const [startDate, setStartDate] = useState(new Date(currentYear, 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  // --- SEARCH + SORT + PAGINATION STATE ---
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // --- Fetch yearly statistics ---
  useEffect(() => {
    axiosInstance
      .get(
        `http://localhost:5286/api/admin/statistics/borrow-books?year=${year}`
      )
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [year]);

  // --- Fetch range statistics ---
  const fetchBorrowedBooksInRange = () => {
    if (!startDate || !endDate) return;

    const s = format(startDate, "yyyy-MM-dd");
    const e = format(endDate, "yyyy-MM-dd");

    axiosInstance
      .get(
        `http://localhost:5286/api/admin/statistics/borrowed-books-range?startDate=${s}&endDate=${e}`
      )
      .then((res) => setBorrowedBooks(res.data))
      .catch(() => setBorrowedBooks([]));
  };

  useEffect(() => {
    fetchBorrowedBooksInRange();
  }, []);

  // --- Search ---
  const filtered = borrowedBooks.filter((x) =>
    x.bookTitle.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // --- Sort ---
  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  if (sortConfig.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  // --- Pagination ---
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  const totalQuantity = borrowedBooks.reduce(
    (sum, b) => sum + (b.quantity || 0),
    0
  );

  // --- Chart config ---
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
    maintainAspectRatio: false,
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
      {/* ===================== RANGE SECTION ===================== */}
      <div className="p-4 bg-white rounded shadow-sm border">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <h4 className="mb-0">
            Thống kê sách đang mượn theo khoảng thời gian
          </h4>

          <div className="d-flex flex-wrap align-items-end gap-3">
            <div>
              <label className="fw-semibold mb-1">Từ ngày</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                className="form-control"
              />
            </div>

            <div>
              <label className="fw-semibold mb-1">Đến ngày</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                className="form-control"
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ minWidth: 80 }}
              onClick={fetchBorrowedBooksInRange}
            >
              Lọc
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          className="form-control w-25 mb-3"
          placeholder="Tìm theo tên sách..."
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            setPage(1);
          }}
        />

        {/* Tổng số sách */}
        <div className="mb-2">
          <span className="badge bg-info text-dark px-3 py-2">
            Tổng số cuốn trong khoảng thời gian:{" "}
            <strong>{totalQuantity}</strong>
          </span>
        </div>

        {/* TABLE */}
        <div className="table-responsive mt-3">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr className="text-center">
                <th style={{ width: "60px" }}>#</th>

                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleSort("bookTitle")}
                >
                  Tên sách {getSortIcon("bookTitle")}
                </th>

                <th
                  style={{ cursor: "pointer", width: "120px" }}
                  onClick={() => toggleSort("quantity")}
                >
                  Số lượng {getSortIcon("quantity")}
                </th>

                <th style={{ width: "110px" }}>Ảnh</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                pageItems.map((b, index) => (
                  <tr key={b.bookId}>
                    <td className="text-center">{start + index + 1}</td>
                    <td>{b.bookTitle}</td>
                    <td className="text-center fw-semibold">
                      {b.quantity}
                    </td>
                    <td className="text-center">
                      <img
                        src={
                          b.bookImage
                            ? `http://localhost:5286/${b.bookImage}`
                            : "/no-image.png"
                        }
                        alt="book"
                        style={{
                          width: "60px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>–
            <strong>{Math.min(end, total)}</strong> /{" "}
            <strong>{total}</strong> bản ghi
          </div>

          <div className="btn-group">
            <button
              className="btn btn-outline-secondary"
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹ Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  className={`btn ${
                    p === safePage
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="btn btn-outline-secondary"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>

      {/* ===================== YEARLY CHART SECTION ===================== */}
      <div className="flex items-center justify-between mt-3">
        <h4>Thống kê số lượng sách mượn theo tháng</h4>

        <select
          className="form-select w-auto"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          width: "100%",
          height: "50vh",
          maxHeight: "500px",
          minHeight: "300px",
        }}
      >
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
