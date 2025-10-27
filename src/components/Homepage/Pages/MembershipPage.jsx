import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5286/api/admin/memberships";

export default function MembershipPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [deleteId, setDeleteId] = useState(null);

  const getSortedItems = () => {
    let sorted = [...items].map((item) => {
      const now = new Date();
      const end = new Date(item.endDate);
      return {
        ...item,
        status: now <= end ? "Còn hạn" : "Hết hạn",
      };
    });

    const { key, direction } = sortConfig;
    if (key) {
      sorted.sort((a, b) => {
        if (typeof a[key] === "string") {
          return direction === "asc"
            ? a[key].localeCompare(b[key])
            : b[key].localeCompare(a[key]);
        }
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      });
    }
    return sorted;
  };

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  const fetchData = async () => {
    try {
      const url = search
        ? `${API_BASE}/search?keyword=${encodeURIComponent(search)}`
        : API_BASE;
      const res = await axiosInstance.get(url);
      setItems(res.data || []);
      setPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách!");
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      toast.success(res.data?.message || "Xoá thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xoá thất bại!");
    } finally {
      setDeleteId(null);
      fetchData();
    }
  };

  // Phân trang
  const total = getSortedItems().length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = getSortedItems().slice(start, end);

  return (
    <div className="container mt-4">
      <h2>Danh sách Gói Thành Viên</h2>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Tìm kiếm theo tên KH hoặc gói..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ms-auto d-flex align-items-center gap-2">
          <span>Kích thước trang:</span>
          <select
            className="form-select w-auto"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th
              onClick={() => toggleSort("customerName")}
              style={{ cursor: "pointer" }}
            >
              Khách hàng{getSortIcon("customerName")}
            </th>
            <th
              onClick={() => toggleSort("planName")}
              style={{ cursor: "pointer" }}
            >
              Gói{getSortIcon("planName")}
            </th>
            <th
              onClick={() => toggleSort("startDate")}
              style={{ cursor: "pointer" }}
            >
              Bắt đầu{getSortIcon("startDate")}
            </th>
            <th
              onClick={() => toggleSort("endDate")}
              style={{ cursor: "pointer" }}
            >
              Kết thúc{getSortIcon("endDate")}
            </th>
            <th
              onClick={() => toggleSort("status")}
              style={{ cursor: "pointer" }}
            >
              Trạng thái{getSortIcon("status")}
            </th>
            <th
              onClick={() => toggleSort("paymentMethod")}
              style={{ cursor: "pointer" }}
            >
              Thanh toán{getSortIcon("paymentMethod")}
            </th>
            <th
              onClick={() => toggleSort("isDeleted")}
              style={{ cursor: "pointer" }}
            >
              Đã xoá{getSortIcon("isDeleted")}
            </th>

            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            pageItems.map((item, i) => (
              <tr key={item.id}>
                <td>{start + i + 1}</td>
                <td>{item.customerName}</td>
                <td>{item.planName}</td>
                <td>{new Date(item.startDate).toLocaleDateString()}</td>
                <td>{new Date(item.endDate).toLocaleDateString()}</td>
                <td>
                  <span
                    className="px-2 py-1 border rounded"
                    style={{
                      color: "black",
                      borderColor:
                        item.status === "Còn hạn" ? "#198754" : "#dc3545", // xanh hoặc đỏ
                      backgroundColor:
                        item.status === "Còn hạn" ? "#d1e7dd" : "#f8d7da", // nền nhạt tương ứng
                    }}
                  >
                    {item.status}
                  </span>
                </td>

                <td>{item.paymentMethod}</td>
                <td>
                  <input type="checkbox" checked={item.isDeleted} readOnly />
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteId(item.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Phân trang */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>–
          <strong>{Math.min(end, total)}</strong> / <strong>{total}</strong> bản
          ghi
        </div>
        <div className="btn-group">
          <button
            className="btn btn-outline-secondary"
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Trước
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`btn ${
                safePage === i + 1 ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn btn-outline-secondary"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Sau ›
          </button>
        </div>
      </div>

      {/* Modal Xoá */}
      {deleteId && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xoá</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xoá membership này?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                >
                  Huỷ
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Xoá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
