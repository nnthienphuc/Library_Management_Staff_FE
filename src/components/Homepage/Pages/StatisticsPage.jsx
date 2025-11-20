import { Bar } from "react-chartjs-2";
import React, { useEffect, useMemo, useState } from "react";
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

  // --- STATE CHO CHART THEO NĂM ---
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(new Array(12).fill(0));

  // --- STATE CHO THỐNG KÊ THEO KHOẢNG THỜI GIAN ---
  // mặc định: từ đầu năm đến hôm nay
  const [startDate, setStartDate] = useState(new Date(currentYear, 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  // search theo title (FE)
  const [searchTitle, setSearchTitle] = useState("");

  // sort giống AuthorPage
  const [sortConfig, setSortConfig] = useState({
    key: "bookTitle",
    direction: "asc",
  });

  // phân trang: 5 record / trang
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // --- LẤY THỐNG KÊ THEO NĂM (CHART) ---
  useEffect(() => {
    axiosInstance
      .get(
        `http://localhost:5286/api/admin/statistics/borrow-books?year=${year}`
      )
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [year]);

  // --- LẤY THỐNG KÊ THEO KHOẢNG THỜI GIAN ---
  const fetchBorrowedBooksInRange = () => {
    if (!startDate || !endDate) return;

    const s = format(startDate, "yyyy-MM-dd");
    const e = format(endDate, "yyyy-MM-dd");

    axiosInstance
      .get(
        `http://localhost:5286/api/admin/statistics/borrowed-books-range?startDate=${s}&endDate=${e}`
      )
      .then((res) => {
        setBorrowedBooks(res.data || []);
        setPage(1); // mỗi lần filter lại quay về trang 1
      })
      .catch(() => setBorrowedBooks([]));
  };

  // auto load 1 lần khi vào trang
  useEffect(() => {
    fetchBorrowedBooksInRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- SORT HANDLER (giống AuthorPage) ---
  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
    setPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  // --- FILTER + SORT + PHÂN TRANG CHO BẢNG ---
  const processedBooks = useMemo(() => {
    let list = borrowedBooks || [];

    // filter theo title
    if (searchTitle.trim()) {
      const keyword = searchTitle.toLowerCase();
      list = list.filter((b) =>
        (b.bookTitle || "").toLowerCase().includes(keyword)
      );
    }

    // sort theo sortConfig
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "quantity") {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else {
          aVal = aVal?.toString().toLowerCase() || "";
          bVal = bVal?.toString().toLowerCase() || "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [borrowedBooks, searchTitle, sortConfig]);

  // --- TÍNH TOÁN PHÂN TRANG ---
  const total = processedBooks.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = processedBooks.slice(start, end);

  // Tổng số lượng (theo tất cả record trong khoảng thời gian, không filter theo search)
  const totalQuantity = borrowedBooks.reduce(
    (sum, b) => sum + (b.quantity || 0),
    0
  );

  // --- CHART CONFIG ---
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

  // helper cho pagination button
  const makePages = (totalP, current) => {
    const MAX_SIMPLE = 7;
    if (totalP <= MAX_SIMPLE) {
      return Array.from({ length: totalP }, (_, i) => i + 1);
    }
    const pages = [];
    const delta = 1;

    const left = Math.max(2, current - delta);
    const right = Math.min(totalP - 1, current + delta);

    pages.push(1);
    if (left > 2) pages.push("…");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalP - 1) pages.push("…");
    pages.push(totalP);

    return pages;
  };

  return (
    <div className="container mt-4 d-flex flex-column gap-4">
      {/* --- THỐNG KÊ THEO KHOẢNG THỜI GIAN --- */}
      <div className="p-4 bg-white rounded shadow-sm border">
        {/* Header: title + filter (date + search) */}
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

            <div>
              <label className="fw-semibold mb-1">Tìm theo tên sách</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập từ khoá..."
                value={searchTitle}
                onChange={(e) => {
                  setSearchTitle(e.target.value);
                  setPage(1);
                }}
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

        {/* Tổng số cuốn */}
        <div className="mb-3">
          <span className="badge bg-info text-dark px-3 py-2">
            Tổng số cuốn trong khoảng thời gian:{" "}
            <strong>{totalQuantity}</strong>
          </span>
        </div>

        {/* BẢNG KẾT QUẢ */}
        <div className="table-responsive mt-2">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr className="text-center">
                <th style={{ width: "60px" }}>#</th>
                <th
                  style={{ cursor: "pointer", minWidth: "200px" }}
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
                  <td colSpan={4} className="text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                pageItems.map((b, i) => (
                  <tr key={b.bookId || i}>
                    <td className="text-center">{start + i + 1}</td>
                    <td>
                      <span
                        className="d-inline-block text-truncate"
                        style={{ maxWidth: "420px" }}
                        title={b.bookTitle}
                      >
                        {b.bookTitle}
                      </span>
                    </td>
                    <td className="text-center fw-semibold">{b.quantity}</td>
                    <td className="text-center">
                      {b.bookImage ? (
                        <img
                          src={`http://localhost:5286/${b.bookImage}`}
                          alt="book"
                          style={{
                            width: "60px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Điều hướng phân trang riêng cho bảng thống kê */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>
            Hiển thị{" "}
            <strong>{total === 0 ? 0 : start + 1}</strong>–
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

            {makePages(totalPages, safePage).map((p, idx) =>
              p === "…" ? (
                <button
                  key={`e-${idx}`}
                  className="btn btn-outline-secondary"
                  disabled
                >
                  …
                </button>
              ) : (
                <button
                  key={p}
                  className={`btn ${
                    p === safePage ? "btn-primary" : "btn-outline-secondary"
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

      {/* --- BIỂU ĐỒ THỐNG KÊ THEO NĂM --- */}
      <div className="p-4 bg-white rounded shadow-sm border mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h4 className="mb-0">Thống kê số lượng sách mượn theo tháng</h4>

          <select
            className="form-select w-auto"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
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
    </div>
  );
}
