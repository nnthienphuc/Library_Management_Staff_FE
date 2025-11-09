import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5286/api/admin/staffs";

export default function StaffPage() {
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // --- PHÂN TRANG (client-side) ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // ---------------------------------

  const [form, setForm] = useState({
    id: "",
    familyName: "",
    givenName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    email: "",
    citizenIdentification: "",
    isAdmin: false,
    gender: false,
    isActive: false,
    isDeleted: false,
  });

  // --- helper chuyển trang khi không có quyền ---
  const redirectNoPermission = () => {
    toast.error("Bạn không có quyền truy cập vào trang này.");
    // đổi path nếu route BookPage của bạn khác
    window.location.href = "/admin/books";
  };

  const fetchStaffs = async () => {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
      const res = await axiosInstance.get(url);
      setStaffs(res.data);
      setPage(1); // mỗi lần tìm kiếm, quay về trang 1
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        redirectNoPermission();
        return;
      }
      toast.error("Không thể tải danh sách nhân viên.");
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, [search]);

  const openAdd = () => {
    setForm({
      id: "",
      familyName: "",
      givenName: "",
      dateOfBirth: "",
      address: "",
      phone: "",
      email: "",
      citizenIdentification: "",
      isAdmin: false,
      gender: false,
      isActive: false,
      isDeleted: false,
    });
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (staff) => {
    setForm({ ...staff });
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };

      let res;
      if (isEdit) {
        res = await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      } else {
        res = await axiosInstance.post(API_BASE, payload);
      }

      toast.success(res.data?.message || "Lưu thành công.");
      setModalVisible(false);
      fetchStaffs();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        redirectNoPermission();
        return;
      }
      handleApiError(err.response?.data?.message || "Lỗi khi lưu nhân viên!");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      toast.success(res.data?.message || "Xóa thành công.");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        redirectNoPermission();
        return;
      }
      toast.error(err.response?.data?.message || "Xóa thất bại.");
    } finally {
      setDeleteId(null);
      fetchStaffs();
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1); // sắp xếp lại thì về trang 1
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  const sortedStaffs = React.useMemo(() => {
    const sortable = [...staffs];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (["gender", "isAdmin", "isActive", "isDeleted"].includes(sortConfig.key)) {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        } else if (sortConfig.key === "dateOfBirth") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else {
          aValue = aValue?.toString().toLowerCase();
          bValue = bValue?.toString().toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [staffs, sortConfig]);

  // --- TÍNH TOÁN PHÂN TRANG ---
  const total = sortedStaffs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = sortedStaffs.slice(start, end);
  // -----------------------------

  return (
    <div className="container mt-4">
      <h2>Danh sách Nhân viên</h2>
      <div className="d-flex gap-2 mb-3">
        {/* <button className="btn btn-success" onClick={openAdd}>Thêm</button> */}
        <input
          className="form-control w-25"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Chọn kích thước trang */}
        <div className="ms-auto d-flex align-items-center gap-2">
          <span>Kích thước trang:</span>
          <select
            className="form-select w-auto"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            {[
              ["familyName", "Họ"],
              ["givenName", "Tên"],
              ["dateOfBirth", "Ngày sinh"],
              ["gender", "Giới tính"],
              ["phone", "SĐT"],
              ["email", "Email"],
              ["address", "Địa chỉ"],
              ["citizenIdentification", "CCCD"],
              ["isAdmin", "Vai trò"],
              ["isActive", "Đang hoạt động"],
              ["isDeleted", "Đã xoá"],
            ].map(([key, label]) => (
              <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                {label} {renderSortIcon(key)}
              </th>
            ))}
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center">Không có dữ liệu</td>
            </tr>
          ) : (
            pageItems.map((s, i) => (
              <tr key={s.id}>
                <td>{start + i + 1}</td>
                <td>{s.familyName}</td>
                <td>{s.givenName}</td>
                <td>{s.dateOfBirth}</td>
                <td>{s.gender ? "Nữ" : "Nam"}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>{s.citizenIdentification}</td>
                <td>{s.isAdmin ? "Quản trị viên" : "Nhân viên"}</td>
                <td><input type="checkbox" checked={s.isActive} readOnly /></td>
                <td><input type="checkbox" checked={s.isDeleted} readOnly /></td>
                <td>
                  <button className="btn btn-info btn-sm me-2" onClick={() => openEdit(s)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(s.id)}>Xoá</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Điều hướng phân trang (trượt + …) */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>–<strong>{Math.min(end, total)}</strong> / <strong>{total}</strong> bản ghi
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
            const makePages = (totalP, current) => {
              const MAX_SIMPLE = 7;
              if (totalP <= MAX_SIMPLE) {
                return Array.from({ length: totalP }, (_, i) => i + 1);
              }
              const pages = [];
              const delta = 1; // số trang kề 2 bên trang hiện tại

              const left = Math.max(2, current - delta);
              const right = Math.min(totalP - 1, current + delta);

              pages.push(1);
              if (left > 2) pages.push("…");
              for (let p = left; p <= right; p++) pages.push(p);
              if (right < totalP - 1) pages.push("…");
              pages.push(totalP);

              return pages;
            };

            return makePages(totalPages, safePage).map((p, idx) =>
              p === "…" ? (
                <button key={`e-${idx}`} className="btn btn-outline-secondary" disabled>
                  …
                </button>
              ) : (
                <button
                  key={p}
                  className={`btn ${p === safePage ? "btn-primary" : "btn-outline-secondary"}`}
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

      {/* Modal thêm/sửa */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? "Sửa" : "Thêm"} nhân viên</h5>
                <button className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body row g-3">
                {[
                  { label: "Họ", name: "familyName" },
                  { label: "Tên", name: "givenName" },
                  { label: "Ngày sinh", name: "dateOfBirth", type: "date" },
                  { label: "Địa chỉ", name: "address" },
                  { label: "SĐT", name: "phone" },
                  { label: "Email", name: "email" },
                  { label: "CCCD", name: "citizenIdentification" },
                ].map(({ label, name, type }) => (
                  <div key={name} className="col-md-6">
                    <label>{label}</label>
                    <input
                      type={type || "text"}
                      className="form-control"
                      value={form[name] || ""}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    />
                  </div>
                ))}

                <div className="col-md-6 d-flex align-items-center gap-2">
                  <label>Giới tính:</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value === "true" })}
                  >
                    <option value="false">Nam</option>
                    <option value="true">Nữ</option>
                  </select>
                </div>

                <div className="col-md-6 d-flex align-items-center gap-2">
                  <label>Vai trò:</label>
                  <select
                    className="form-select"
                    value={form.isAdmin}
                    onChange={(e) => setForm({ ...form, isAdmin: e.target.value === "true" })}
                  >
                    <option value="false">Nhân viên</option>
                    <option value="true">Quản trị viên</option>
                  </select>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label>Actived:</label>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label>Đã xoá:</label>
                  <input
                    type="checkbox"
                    checked={form.isDeleted}
                    onChange={(e) => setForm({ ...form, isDeleted: e.target.checked })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>Huỷ</button>
                <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
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
                <button className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xoá nhân viên này?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Huỷ</button>
                <button className="btn btn-danger" onClick={handleDelete}>Xoá</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
