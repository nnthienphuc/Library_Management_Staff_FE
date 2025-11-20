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
  const [chartData, setChartData] = useState(new Array(12).fill(0));

  // RANGE STATE
  const [startDate, setStartDate] = useState(new Date(currentYear, 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  // SEARCH
  const [searchKeyword, setSearchKeyword] = useState("");

  // SORT
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  // PAGINATION
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // WIDGET DATA
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [topBorrowed, setTopBorrowed] = useState([]);

  // LOAD CHART
  useEffect(() => {
    axiosInstance
      .get(`http://localhost:5286/api/admin/statistics/borrow-books?year=${year}`)
      .then((res) => setChartData(res.data))
      .catch(() => {});
  }, [year]);

  // LOAD RANGE TABLE
  const fetchBorrowedBooksInRange = () => {
    const s = format(startDate, "yyyy-MM-dd");
    const e = format(endDate, "yyyy-MM-dd");

    axiosInstance
      .get(
        `http://localhost:5286/api/admin/statistics/borrowed-books-range?startDate=${s}&endDate=${e}`
      )
      .then((res) => {
        setBorrowedBooks(res.data);
        setPage(1);
      });
  };

  useEffect(() => {
    fetchBorrowedBooksInRange();
  }, []);

  // LOAD TOTAL REVENUE
  useEffect(() => {
    axiosInstance
      .get("http://localhost:5286/api/admin/statistics/total-revenue")
      .then((res) => setTotalRevenue(res.data));
  }, []);

  // LOAD TOP 5 BOOKS
  useEffect(() => {
    axiosInstance
      .get("http://localhost:5286/api/admin/statistics/top-borrowed-books")
      .then((res) => setTopBorrowed(res.data));
  }, []);

  // SORTING
  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortedData = () => {
    let data = [...borrowedBooks];

    if (searchKeyword.trim() !== "") {
      data = data.filter((x) =>
        x.bookTitle.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (sortConfig.key) {
      data.sort((a, b) => {
        let av = a[sortConfig.key];
        let bv = b[sortConfig.key];

        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();

        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  };

  const sorted = getSortedData();
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  const paginationNumbers = () => {
    const nums = [];
    const delta = 1;

    nums.push(1);
    if (safePage - delta > 2) nums.push("...");

    for (
      let p = Math.max(2, safePage - delta);
      p <= Math.min(totalPages - 1, safePage + delta);
      p++
    ) {
      nums.push(p);
    }

    if (safePage + delta < totalPages - 1) nums.push("...");
    if (totalPages > 1) nums.push(totalPages);

    return nums;
  };

  const labels = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

  const chartConfig = {
    labels,
    datasets: [
      {
        type: "bar",
        label: `Sách mượn (${year})`,
        data: chartData,
        backgroundColor: "rgba(54,162,235,0.6)",
        borderColor: "rgba(54,162,235,1)",
        borderWidth: 1,
      },
      {
        type: "line",
        label: "Xu hướng",
        data: chartData,
        borderColor: "rgba(255,99,132,1)",
        tension: 0.3,
        datalabels: { display: false },
      },
    ],
  };

  return (
    <div className="row p-3">
      {/* LEFT SIDE */}
      <div className="col-lg-8">

        {/* RANGE CARD */}
        <div className="card p-3 mb-4">

          <h4 className="fw-bold text-center mb-3">Thống kê sách đang mượn theo khoảng thời gian</h4>

          <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
            <div>
              <label>Từ ngày</label>
              <DatePicker selected={startDate} onChange={setStartDate} className="form-control" dateFormat="dd/MM/yyyy"/>
            </div>

            <div>
              <label>Đến ngày</label>
              <DatePicker selected={endDate} onChange={setEndDate} className="form-control" dateFormat="dd/MM/yyyy"/>
            </div>

            <div>
              <label>Tìm theo tên sách</label>
              <input className="form-control" placeholder="Nhập từ khóa..." value={searchKeyword} onChange={(e)=>setSearchKeyword(e.target.value)}/>
            </div>

            <button className="btn btn-primary" onClick={fetchBorrowedBooksInRange}>Lọc</button>
          </div>

          {/* FIXED SMALL BADGE */}
          <span className="badge bg-primary mb-2" style={{ width: "fit-content", padding: "6px 12px" }}>
            Tổng số cuốn: <b>{sorted.reduce((s, x) => s + x.quantity, 0)}</b>
          </span>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light text-center">
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("bookTitle")}>Tên sách</th>
                  <th style={{ width: 100, cursor: "pointer" }} onClick={() => toggleSort("quantity")}>Số lượng</th>
                  <th style={{ width: 100 }}>Ảnh</th>
                </tr>
              </thead>

              <tbody>
                {pageItems.map((b, i) => (
                  <tr key={b.bookId}>
                    <td className="text-center">{start + i + 1}</td>
                    <td>{b.bookTitle}</td>
                    <td className="text-center fw-bold">{b.quantity}</td>
                    <td className="text-center">
                      <img src={`http://localhost:5286/${b.bookImage}`} style={{ width: 50, height: 70, objectFit: "cover" }}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div>
              Hiển thị <b>{start + 1}</b> - <b>{Math.min(start + pageSize, total)}</b> / {total}
            </div>

            <div className="btn-group">
              <button className="btn btn-outline-secondary" disabled={safePage===1} onClick={()=>setPage(safePage - 1)}>‹ Trước</button>

              {paginationNumbers().map((n, idx) =>
                n === "..." ? (
                  <button key={idx} className="btn btn-outline-secondary" disabled>...</button>
                ) : (
                  <button key={idx} className={`btn ${n===safePage ? "btn-primary" : "btn-outline-secondary"}`} onClick={()=>setPage(n)}>{n}</button>
                )
              )}

              <button className="btn btn-outline-secondary" disabled={safePage===totalPages} onClick={()=>setPage(safePage + 1)}>
                Sau ›
              </button>
            </div>
          </div>
        </div>

        {/* CHART FULL WIDTH */}
        <div className="card p-3 mt-4">
          <h4 className="fw-bold text-center mb-3">Thống kê số lượng sách mượn theo tháng</h4>

          <div className="d-flex justify-content-end mb-2">
            <select className="form-select w-auto" value={year} onChange={(e)=>setYear(Number(e.target.value))}>
              {[2024,2025,2026,2027].map((y)=>(
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>

          <div style={{
  width: "100%",
  minHeight: "450px",     // tăng chiều cao
  height: "auto",         // cho phép mở rộng theo nội dung
  padding: "10px",
}}>
  <Bar data={chartConfig} options={{ maintainAspectRatio: false }} />
</div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="col-lg-4 d-flex flex-column gap-4">
        
        {/* TOTAL REVENUE */}
        <div className="card p-4 text-center">
          <h5 className="fw-bold">Tổng doanh thu thư viện</h5>
          <p className="text-muted">Tính đến thời điểm hiện tại dựa trên doanh thu từ hội viên</p>
          <div className="fs-2 fw-bold text-success">
            {totalRevenue.toLocaleString("vi-VN")} đ
          </div>
        </div>

        {/* TOP 5 */}
        <div className="card p-3 text-center">
          <h5 className="fw-bold mb-3">Top 5 sách được mượn nhiều nhất</h5>

          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tên sách</th>
                <th>SL</th>
                <th>Ảnh</th>
              </tr>
            </thead>

            <tbody>
              {topBorrowed.map((b, i) => (
                <tr key={b.bookId}>
                  <td>{i + 1}</td>
                  <td className="text-start">{b.bookTitle}</td>
                  <td className="fw-bold">{b.totalQuantity}</td>
                  <td>
                    <img src={`http://localhost:5286/${b.bookImage}`}
                      style={{ width: 45, height: 60, objectFit: "cover" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
