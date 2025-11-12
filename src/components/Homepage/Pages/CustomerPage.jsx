import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/dateUtils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const API_BASE = "http://localhost:5286/api/admin/customers";

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [form, setForm] = useState({
    id: "",
    familyName: "",
    givenName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    email: "",
    note: "",
    gender: false,
    isDeleted: false,
  });

  // --- PHÂN TRANG (client-side) ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // ---------------------------------

  const fetchCustomers = async () => {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
      const res = await axiosInstance.get(url);
      setCustomers(res.data);
      setPage(1); // mỗi lần tìm kiếm quay lại trang 1
    } catch (err) {
      toast.error("Không thể tải danh sách khách hàng.");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    .react-datepicker-wrapper,
    .react-datepicker__input-container,
    .react-datepicker__input-container input {
      width: 100% !important;
    }
  `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const openAdd = () => {
    setForm({
      id: "",
      familyName: "",
      givenName: "",
      dateOfBirth: "",
      address: "",
      phone: "",
      email: "",
      note: "",
      gender: false,
      isDeleted: false,
    });
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (cust) => {
    setForm({
      id: cust.id,
      familyName: cust.familyName,
      givenName: cust.givenName,
      dateOfBirth: cust.dateOfBirth,
      address: cust.address,
      phone: cust.phone,
      email: cust.email,
      note: cust.note,
      gender: cust.gender,
      isDeleted: cust.isDeleted,
    });
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        familyName: form.familyName,
        givenName: form.givenName,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
        phone: form.phone,
        email: form.email,
        note: form.note,
        gender: form.gender,
        isDeleted: form.isDeleted,
      };

      let res;
      if (isEdit) {
        res = await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      } else {
        res = await axiosInstance.post(API_BASE, payload);
      }

      toast.success(res.data?.message || "Lưu thành công.");
      setModalVisible(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu khách hàng!");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      toast.success(res.data?.message || "Xóa thành công.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại.");
    } finally {
      setDeleteId(null);
      fetchCustomers();
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1); // sắp xếp lại cũng về trang 1
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  const sortedCustomers = React.useMemo(() => {
    const sortable = [...customers];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "gender") {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        } else if (sortConfig.key === "dateOfBirth") {
          // Chuẩn hoá ngày để so sánh ổn định
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [customers, sortConfig]);

  // --- TÍNH TOÁN PHÂN TRANG ---
  const total = sortedCustomers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = sortedCustomers.slice(start, end);
  // -----------------------------

  return (
    <div className="container mt-4">
      <h2>Danh sách Khách hàng</h2>
      <div className="d-flex gap-2 mb-3">
        {/* <button className="btn btn-success" onClick={openAdd}>
          Thêm
        </button> */}
        <input
          className="form-control w-25"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Chọn kích thước trang (client-side) */}
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

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th
              onClick={() => handleSort("familyName")}
              style={{ cursor: "pointer" }}
            >
              Họ {renderSortIcon("familyName")}
            </th>
            <th
              onClick={() => handleSort("givenName")}
              style={{ cursor: "pointer" }}
            >
              Tên {renderSortIcon("givenName")}
            </th>
            <th
              onClick={() => handleSort("dateOfBirth")}
              style={{ cursor: "pointer" }}
            >
              Ngày sinh {renderSortIcon("dateOfBirth")}
            </th>
            <th
              onClick={() => handleSort("gender")}
              style={{ cursor: "pointer" }}
            >
              Giới tính {renderSortIcon("gender")}
            </th>
            <th
              onClick={() => handleSort("phone")}
              style={{ cursor: "pointer" }}
            >
              Điện thoại {renderSortIcon("phone")}
            </th>
            <th
              onClick={() => handleSort("email")}
              style={{ cursor: "pointer" }}
            >
              Email {renderSortIcon("email")}
            </th>
            <th
              onClick={() => handleSort("address")}
              style={{ cursor: "pointer" }}
            >
              Địa chỉ {renderSortIcon("address")}
            </th>
            <th
              onClick={() => handleSort("note")}
              style={{ cursor: "pointer" }}
            >
              Ghi chú {renderSortIcon("note")}
            </th>
            <th
              onClick={() => handleSort("isDeleted")}
              style={{ cursor: "pointer" }}
            >
              Đã xoá {renderSortIcon("isDeleted")}
            </th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {pageItems.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            pageItems.map((c, i) => (
              <tr key={c.id}>
                <td>{start + i + 1}</td>
                <td>{c.familyName}</td>
                <td>{c.givenName}</td>
                <td>{formatDate(c.dateOfBirth)}</td>
                <td>{c.gender ? "Nữ" : "Nam"}</td>
                <td>{c.phone}</td>
                <td>{c.email || "-"}</td>
                <td>{c.address}</td>
                <td>{c.note || "-"}</td>
                <td>
                  <input type="checkbox" checked={c.isDeleted} readOnly />
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => openEdit(c)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteId(c.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Điều hướng phân trang */}
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

          {(() => {
            const makePages = (total, current) => {
              const MAX_SIMPLE = 7;
              if (total <= MAX_SIMPLE) {
                return Array.from({ length: total }, (_, i) => i + 1);
              }
              const pages = [];
              const delta = 1; // số trang kề 2 bên trang hiện tại

              const left = Math.max(2, current - delta);
              const right = Math.min(total - 1, current + delta);

              pages.push(1);
              if (left > 2) pages.push("…");
              for (let p = left; p <= right; p++) pages.push(p);
              if (right < total - 1) pages.push("…");
              pages.push(total);

              return pages;
            };

            return makePages(totalPages, safePage).map((p, idx) =>
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
            );
          })()}

          <button
            className="btn btn-outline-secondary"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Sau ›
          </button>
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEdit ? "Sửa" : "Thêm"} khách hàng
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body row g-3">
                {[
                  { label: "Họ", name: "familyName" },
                  { label: "Tên", name: "givenName" },
                  { label: "Ngày sinh", name: "dateOfBirth", type: "date" },
                  { label: "Địa chỉ", name: "address" },
                  { label: "SĐT", name: "phone" },
                  { label: "Email", name: "email", type: "email" },
                ].map(({ label, name, type }) => (
                  <div key={name} className="col-md-6">
                    <label>{label}</label>
                    {name === "dateOfBirth" ? (
                      <DatePicker
                        selected={
                          form.dateOfBirth ? new Date(form.dateOfBirth) : null
                        }
                        onChange={(date) =>
                          setForm({
                            ...form,
                            dateOfBirth: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        placeholderText="dd/MM/yyyy"
                        className="form-control"
                      />
                    ) : (
                      <input
                        type={type || "text"}
                        className="form-control"
                        value={form[name] || ""}
                        onChange={(e) =>
                          setForm({ ...form, [name]: e.target.value })
                        }
                      />
                    )}
                  </div>
                ))}

                <div className="col-12">
                  <label>Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.note || ""}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Nhập ghi chú cho khách hàng..."
                  ></textarea>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label className="form-check-label me-2">Giới tính:</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value === "true" })
                    }
                  >
                    <option value="false">Nam</option>
                    <option value="true">Nữ</option>
                  </select>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label className="form-check-label me-2">Đã xoá:</label>
                  <input
                    type="checkbox"
                    checked={form.isDeleted}
                    onChange={(e) =>
                      setForm({ ...form, isDeleted: e.target.checked })
                    }
                  />
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

      {/* Modal xác nhận xoá */}
      {deleteId && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xoá</h5>
                <button
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xoá khách hàng này?</p>
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
