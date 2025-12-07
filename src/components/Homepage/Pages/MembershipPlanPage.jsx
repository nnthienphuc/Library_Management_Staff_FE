import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5286/api/admin/membershipplans";

// (Optional) Helper lấy message lỗi từ BE/axios
const getErrorMessage = (error) => {
  // AxiosError chuẩn
  if (error?.response) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
  }

  // Trường hợp interceptor trả thẳng data
  if (error && typeof error === "object" && typeof error.message === "string") {
    return error.message;
  }

  return null;
};

export default function MembershipPlanPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    months: 1,
    price: 10000,
    maxBooks: 1,
    isDeleted: false,
  });

  // 👈 bạn đang dùng `errors` mà chưa khai báo, thêm dòng này:
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const validateForm = () => {
    const newErrors = {};

    if (!form.name || form.name.trim() === "")
      newErrors.name = "Vui lòng nhập tên gói.";

    if (!form.months || form.months < 1 || form.months > 12)
      newErrors.months = "Số tháng phải từ 1 đến 12.";

    if (!form.price || form.price <= 10000)
      newErrors.price = "Giá phải lớn hơn 10.000 vnd.";

    if (!form.maxBooks || form.maxBooks <= 0)
      newErrors.maxBooks = "Số sách tối đa phải lớn hơn 0.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true nếu không có lỗi
  };

  const getSortedItems = () => {
    let sorted = [...items];
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
      const msg = getErrorMessage(err) || "Không thể tải danh sách!";
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const openAdd = () => {
    setForm({
      id: "",
      name: "",
      months: 1,
      price: 10000,
      maxBooks: 1,
      isDeleted: false,
    });
    setErrors({});       // 👈 clear lỗi cũ
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setForm(item);
    setErrors({});       // 👈 clear lỗi cũ
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    // validate FE trước
    if (!validateForm()) {
      toast.error("Vui lòng điền đúng dữ liệu!");
      return;
    }

    try {
      const payload = {
        Name: form.name,
        Months: form.months,
        Price: form.price,
        MaxBooks: form.maxBooks,
        IsDeleted: form.isDeleted,
      };

      const res = isEdit
        ? await axiosInstance.put(`${API_BASE}/${form.id}`, payload)
        : await axiosInstance.post(API_BASE, payload);

      toast.success(res.data?.message || "Lưu thành công!");
      setModalVisible(false);
      fetchData();
    } catch (err) {
      const msg = getErrorMessage(err) || "Lỗi khi lưu gói thành viên!";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      toast.success(res.data?.message || "Xoá thành công!");
    } catch (err) {
      const msg = getErrorMessage(err) || "Xoá thất bại!";
      toast.error(msg);
    } finally {
      setDeleteId(null);
      fetchData();
    }
  };

  const total = getSortedItems().length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = getSortedItems().slice(start, end);

  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách Gói hội viên</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>
          Thêm
        </button>
        <input
          type="text"
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
              onClick={() => toggleSort("name")}
              style={{ cursor: "pointer" }}
            >
              Tên{getSortIcon("name")}
            </th>
            <th
              onClick={() => toggleSort("months")}
              style={{ cursor: "pointer" }}
            >
              Tháng{getSortIcon("months")}
            </th>
            <th
              onClick={() => toggleSort("price")}
              style={{ cursor: "pointer" }}
            >
              Giá{getSortIcon("price")}
            </th>
            <th
              onClick={() => toggleSort("maxBooks")}
              style={{ cursor: "pointer" }}
            >
              Sách tối đa{getSortIcon("maxBooks")}
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
                <td>{item.name}</td>
                <td>{item.months}</td>
                <td>{item.price.toLocaleString()}₫</td>
                <td>{item.maxBooks}</td>
                <td>
                  <input type="checkbox" checked={item.isDeleted} readOnly />
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => openEdit(item)}
                  >
                    Sửa
                  </button>
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

      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEdit ? "Sửa" : "Thêm"} gói thành viên
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tên gói</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Số tháng</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.months ? "is-invalid" : ""
                    }`}
                    min={1}
                    max={12}
                    value={form.months}
                    onChange={(e) =>
                      setForm({ ...form, months: Number(e.target.value) })
                    }
                  />
                  {errors.months && (
                    <div className="invalid-feedback">{errors.months}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Giá (VND)</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.price ? "is-invalid" : ""
                    }`}
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                  />
                  {errors.price && (
                    <div className="invalid-feedback">{errors.price}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Số sách tối đa</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.maxBooks ? "is-invalid" : ""
                    }`}
                    value={form.maxBooks}
                    onChange={(e) =>
                      setForm({ ...form, maxBooks: Number(e.target.value) })
                    }
                  />
                  {errors.maxBooks && (
                    <div className="invalid-feedback">{errors.maxBooks}</div>
                  )}
                </div>

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
                <p>Bạn có chắc chắn muốn xoá gói thành viên này?</p>
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
