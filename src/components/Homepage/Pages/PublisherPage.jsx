import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5286/api/admin/publishers";

export default function PublisherPage() {
  const [publishers, setPublishers] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", isDeleted: false });
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPublishers = async () => {
    try {
      const url = search
        ? `${API_BASE}/search?keyword=${encodeURIComponent(search)}`
        : API_BASE;

      const res = await axiosInstance.get(url);
      let data = res.data || [];

      if (sortConfig.key) {
        data.sort((a, b) => {
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];
          if (typeof aVal === "string") aVal = aVal.toLowerCase();
          if (typeof bVal === "string") bVal = bVal.toLowerCase();
          if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      setPublishers(data);
      setPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải dữ liệu nhà xuất bản!");
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, [search, sortConfig]);

  const openAdd = () => {
    setForm({ id: "", name: "", isDeleted: false });
    setIsEdit(true);
    setModalVisible(true);
  };

  const openEdit = (publisher) => {
    setForm(publisher);
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        Name: form.name,
        IsDeleted: form.isDeleted,
      };

      let res;

      if (form.id) {
        res = await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      } else {
        res = await axiosInstance.post(API_BASE, payload);
      }

      toast.success(res.data?.message || "Lưu thành công!");
      setModalVisible(false);
      fetchPublishers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu nhà xuất bản!");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      toast.success(res.data?.message || "Xoá thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xoá thất bại!");
    } finally {
      setDeleteId(null);
      fetchPublishers();
    }
  };

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

  const total = publishers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = publishers.slice(start, end);

  return (
    <div className="container mt-4">
      <h2>Danh sách Nhà xuất bản</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>Thêm</button>
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
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>
              Tên {getSortIcon("name")}
            </th>
            <th onClick={() => toggleSort("isDeleted")} style={{ cursor: "pointer" }}>
              Đã xoá {getSortIcon("isDeleted")}
            </th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center">Không có dữ liệu</td>
            </tr>
          ) : (
            pageItems.map((pub, i) => (
              <tr key={pub.id}>
                <td>{start + i + 1}</td>
                <td>{pub.name}</td>
                <td>
                  <input type="checkbox" checked={pub.isDeleted} readOnly />
                </td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm me-2"
                    onClick={async () => {
                      try {
                        const res = await axiosInstance.get(`${API_BASE}/${pub.id}`);
                        setForm(res.data);
                        setIsEdit(false);
                        setModalVisible(true);
                      } catch {
                        toast.error("Không thể tải chi tiết nhà xuất bản!");
                      }
                    }}
                  >Xem chi tiết</button>
                  <button className="btn btn-info btn-sm me-2" onClick={() => openEdit(pub)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(pub.id)}>Xoá</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>–<strong>{Math.min(end, total)}</strong> / <strong>{total}</strong> bản ghi
        </div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={safePage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            ‹ Trước
          </button>
          {(() => {
            const makePages = (total, current) => {
              const MAX_SIMPLE = 7;
              if (total <= MAX_SIMPLE) return Array.from({ length: total }, (_, i) => i + 1);
              const pages = [];
              const delta = 1;
              const left = Math.max(2, current - delta);
              const right = Math.min(total - 1, current + delta);
              pages.push(1);
              if (left > 2) pages.push("…");
              for (let p = left; p <= right; p++) pages.push(p);
              if (right < total - 1) pages.push("…");
              pages.push(total);
              return pages;
            };
            return makePages(totalPages, safePage).map((p, i) =>
              p === "…" ? (
                <button key={`e-${i}`} className="btn btn-outline-secondary" disabled>…</button>
              ) : (
                <button
                  key={p}
                  className={`btn ${p === safePage ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setPage(p)}
                >{p}</button>
              )
            );
          })()}
          <button className="btn btn-outline-secondary" disabled={safePage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
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
                  {isEdit ? form.id ? "Sửa nhà xuất bản" : "Thêm nhà xuất bản" : "Chi tiết nhà xuất bản"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Tên nhà xuất bản"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!isEdit}
                />
                {isEdit ? (
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={form.isDeleted}
                      onChange={(e) => setForm({ ...form, isDeleted: e.target.checked })}
                      id="isDeletedCheck"
                    />
                    <label className="form-check-label" htmlFor="isDeletedCheck">
                      Đã xoá
                    </label>
                  </div>
                ) : (
                  <div className="mt-2">
                    <strong>Trạng thái: </strong>
                    <span style={{ color: form.isDeleted ? "red" : "green", fontWeight: "bold" }}>
                      {form.isDeleted ? "Đã xoá" : "Chưa bị xoá"}
                    </span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>Đóng</button>
                {isEdit && <button className="btn btn-primary" onClick={handleSave}>Lưu</button>}
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
                <button type="button" className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xoá nhà xuất bản này?</p>
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
