import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/dateUtils";

const API_BASE = "http://localhost:5286/api/admin/borrows";

export default function BorrowPage() {
  const [borrows, setBorrows] = useState([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [borrowItems, setBorrowItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [form, setForm] = useState({
    id: "",
    note: "",
    status: "",
    isDeleted: false,
  });

  // --- PHÂN TRANG ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // -------------------

  const fetchBorrows = async () => {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
      const res = await axiosInstance.get(url);
      setBorrows(res.data);
      setPage(1);
    } catch (err) {
      toast.error("Không thể tải danh sách phiếu mượn.");
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, [search]);

  const openEdit = (b) => {
    const statusMap = {
      0: "PENDING",
      1: "BORROWED",
      2: "RETURNED",
      3: "OVERDUE",
      4: "CANCELLED",
    };

    setForm({
      id: b.id,
      note: b.note || "",
      status: statusMap[b.status] || "PENDING",
      isDeleted: b.isDeleted,
    });
    setIsEdit(true);
    setModalVisible(true);
  };

  const openDetail = async (borrowId) => {
    try {
      const res = await axiosInstance.get(`${API_BASE}/${borrowId}`);
      setBorrowItems(res.data);
      setDetailVisible(true);
    } catch (err) {
      toast.error("Không thể tải chi tiết mượn sách.");
    }
  };

  const handleSave = async () => {
    try {
      // map chuỗi enum → số
      const statusReverseMap = {
        PENDING: 0,
        BORROWED: 1,
        RETURNED: 2,
        OVERDUE: 3,
        CANCELLED: 4,
      };

      const payload = {
        note: form.note,
        status: statusReverseMap[form.status], // 🟢 gửi số thay vì chữ
        isDeleted: form.isDeleted,
      };

      const res = await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      toast.success(res.data?.message || "Cập nhật thành công.");
      setModalVisible(false);
      fetchBorrows();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi cập nhật phiếu mượn."
      );
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      toast.success(res.data?.message || "Xoá thành công.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xoá thất bại.");
    } finally {
      setDeleteId(null);
      fetchBorrows();
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1);
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  const sortedBorrows = React.useMemo(() => {
    const sortable = [...borrows];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [borrows, sortConfig]);

  // --- PHÂN TRANG ---
  const total = sortedBorrows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = sortedBorrows.slice(start, end);
  // -------------------

  return (
    <div className="container mt-4">
      <h2>Danh sách Phiếu mượn</h2>

      <div className="d-flex gap-2 mb-3">
        {/* Không có nút thêm */}
        <input
          className="form-control w-25"
          placeholder="Tìm kiếm..."
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
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th
              onClick={() => handleSort("customerName")}
              style={{ cursor: "pointer" }}
            >
              Khách hàng {renderSortIcon("customerName")}
            </th>
            {/* <th
              onClick={() => handleSort("customerEmail")}
              style={{ cursor: "pointer" }}
            >
              Email KH {renderSortIcon("customerEmail")}
            </th> */}
            <th
              onClick={() => handleSort("staffName")}
              style={{ cursor: "pointer" }}
            >
              Nhân viên {renderSortIcon("staffName")}
            </th>
            <th
              onClick={() => handleSort("createdTime")}
              style={{ cursor: "pointer" }}
            >
              Ngày mượn {renderSortIcon("createdTime")}
            </th>
            <th
              onClick={() => handleSort("returnDate")}
              style={{ cursor: "pointer" }}
            >
              Ngày trả {renderSortIcon("returnDate")}
            </th>
            <th
              onClick={() => handleSort("status")}
              style={{ cursor: "pointer" }}
            >
              Trạng thái {renderSortIcon("status")}
            </th>
            <th
              onClick={() => handleSort("note")}
              style={{ cursor: "pointer" }}
            >
              Ghi chú {renderSortIcon("note")}
            </th>
            <th
              onClick={() => handleSort("updatedTime")}
              style={{ cursor: "pointer" }}
            >
              Ngày cập nhật {renderSortIcon("updatedTime")}
            </th>
            {/* <th
              onClick={() => handleSort("isDeleted")}
              style={{ cursor: "pointer" }}
            >
              Đã xoá {renderSortIcon("isDeleted")}
            </th> */}
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {pageItems.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            pageItems.map((b, i) => (
              <tr key={b.id}>
                <td>{start + i + 1}</td>
                <td>{b.customerName} <br></br>{b.customerEmail}</td>
                <td>{b.staffName || "-"}</td>
                <td>{formatDate(b.createdTime)}</td>
<td>{formatDate(b.returnDate)}</td>
                <td>
                  <span
                    className={`badge px-2 py-1 ${
                      b.status === 0
                        ? "bg-secondary"
                        : b.status === 1
                        ? "bg-info"
                        : b.status === 2
                        ? "bg-success"
                        : b.status === 3
                        ? "bg-danger"
                        : "bg-dark"
                    }`}
                  >
                    {{
                      0: "Đang chờ",
                      1: "Đang mượn",
                      2: "Đã trả",
                      3: "Quá hạn",
                      4: "Đã huỷ",
                    }[b.status] || "Không xác định"}
                  </span>
                </td>

                <td>{b.note || "-"}</td>
                <td>{formatDate(b.updateAt)}</td>
                {/* <td>
                  <input type="checkbox" checked={b.isDeleted} readOnly />
                </td> */}
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => openDetail(b.id)}
                  >
                    Chi tiết
                  </button>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => openEdit(b)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteId(b.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PHÂN TRANG */}
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

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`btn ${
                p === safePage ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setPage(p)}
            >
              {p}
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

      {/* Modal Sửa */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cập nhật phiếu mượn</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label>Trạng thái</label>
                <select
                  className="form-select mb-2"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="PENDING">Đang chờ</option>
                  <option value="BORROWED">Đang mượn</option>
                  <option value="RETURNED">Đã trả</option>
                  <option value="OVERDUE">Quá hạn</option>
                  <option value="CANCELLED">Đã huỷ</option>
                </select>

                <label>Ghi chú</label>
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.isDeleted}
                    onChange={(e) =>
                      setForm({ ...form, isDeleted: e.target.checked })
                    }
                    id="isDeletedCheck"
                  />
                  <label className="form-check-label" htmlFor="isDeletedCheck">
                    Đã xoá
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalVisible(false)}
                >
                  Huỷ
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi tiết */}
      {detailVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết sách mượn</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDetailVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                {borrowItems.length === 0 ? (
                  <p>Không có sách trong phiếu mượn này.</p>
                ) : (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên sách</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowItems.map((item, i) => (
                        <tr key={item.bookId}>
                          <td>{i + 1}</td>
                          <td>{item.bookName}</td>
                          <td>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                <p>Bạn có chắc chắn muốn xoá phiếu mượn này?</p>
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
