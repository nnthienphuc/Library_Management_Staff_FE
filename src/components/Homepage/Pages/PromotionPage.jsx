import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

const API_BASE = "http://localhost:5286/api/admin/promotions";

export default function PromotionPage() {
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    startDate: "",
    endDate: "",
    condition: "",
    discountPercent: "",
    quantity: "",
    isDeleted: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // --- PHÂN TRANG (client-side) ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // ---------------------------------

  const fetchPromotions = async () => {
    const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
    const res = await axiosInstance.get(url);
    setPromotions(res.data);
    setPage(1); // mỗi lần tìm kiếm quay về trang 1
  };

  useEffect(() => {
    fetchPromotions();
  }, [search]);

  const openAdd = () => {
    setForm({
      id: "",
      name: "",
      startDate: "",
      endDate: "",
      condition: "",
      discountPercent: "",
      quantity: "",
      isDeleted: false,
    });
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (promo) => {
    setForm({ ...promo });
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (!form.name || !form.startDate || !form.endDate) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
      }

      if (isEdit) {
        await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      } else {
        await axiosInstance.post(API_BASE, payload);
      }

      alert("Lưu thành công");
      setModalVisible(false);
      fetchPromotions();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu khuyến mãi");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      alert("Xoá thành công");
      fetchPromotions();
    } catch (err) {
      alert(err.response?.data?.message || "Xoá thất bại");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1); // sắp xếp thì về trang 1
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  const sortedPromotions = React.useMemo(() => {
    const sorted = [...promotions];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Format date & number fields
        if (sortConfig.key === "startDate" || sortConfig.key === "endDate") {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        } else if (
          sortConfig.key === "condition" ||
          sortConfig.key === "discountPercent" ||
          sortConfig.key === "quantity"
        ) {
          aVal = Number(aVal);
          bVal = Number(bVal);
        } else if (typeof aVal === "string" || typeof bVal === "string") {
          aVal = aVal?.toString().toLowerCase();
          bVal = bVal?.toString().toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [promotions, sortConfig]);

  // --- TÍNH TOÁN PHÂN TRANG ---
  const total = sortedPromotions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = sortedPromotions.slice(start, end);
  // -----------------------------

  return (
    <div className="container mt-4">
      <h2>Danh sách Khuyến mãi</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>Thêm</button>
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
            <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
              Tên {renderSortIcon("name")}
            </th>
            <th onClick={() => handleSort("startDate")} style={{ cursor: "pointer" }}>
              Ngày bắt đầu {renderSortIcon("startDate")}
            </th>
            <th onClick={() => handleSort("endDate")} style={{ cursor: "pointer" }}>
              Ngày kết thúc {renderSortIcon("endDate")}
            </th>
            <th onClick={() => handleSort("condition")} style={{ cursor: "pointer" }}>
              Điều kiện {renderSortIcon("condition")}
            </th>
            <th onClick={() => handleSort("discountPercent")} style={{ cursor: "pointer" }}>
              Giảm{renderSortIcon("discountPercent")}
            </th>
            <th onClick={() => handleSort("quantity")} style={{ cursor: "pointer" }}>
              Số lượng {renderSortIcon("quantity")}
            </th>
            <th onClick={() => handleSort("isDeleted")} style={{ cursor: "pointer" }}>
              Đã xoá {renderSortIcon("isDeleted")}
            </th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center">Không có dữ liệu</td>
            </tr>
          ) : (
            pageItems.map((p, i) => (
              <tr key={p.id}>
                <td>{start + i + 1}</td>
                <td>{p.name}</td>
                <td>{new Date(p.startDate).toLocaleDateString()}</td>
                <td>{new Date(p.endDate).toLocaleDateString()}</td>
                <td>{p.condition}</td>
                <td>{p.discountPercent}</td>
                <td>{p.quantity}</td>
                <td><input type="checkbox" checked={p.isDeleted} readOnly /></td>
                <td>
                  <button className="btn btn-info btn-sm me-2" onClick={() => openEdit(p)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p.id)}>Xoá</button>
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

      {/* Modal Thêm/Sửa */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? "Sửa" : "Thêm"} khuyến mãi</h5>
                <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body row g-3">
                {[
                  { label: "Tên", field: "name" },
                  { label: "Ngày bắt đầu", field: "startDate", type: "date" },
                  { label: "Ngày kết thúc", field: "endDate", type: "date" },
                  { label: "Điều kiện", field: "condition" },
                  { label: "Giảm giá", field: "discountPercent" },
                  { label: "Số lượng", field: "quantity" },
                ].map(({ label, field, type }) => (
                  <div key={field} className="col-12">
                    <label>{label}</label>
                    <input
                      type={type || "text"}
                      className="form-control"
                      value={form[field] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}

                <div className="col-12 d-flex align-items-center">
                  <label className="me-2">Đã xoá:</label>
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
                <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>Huỷ</button>
                <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
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
                <button type="button" className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc muốn xoá khuyến mãi này?</p>
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
