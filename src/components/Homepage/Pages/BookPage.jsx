import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import SelectPopup from "./SelectPopup";
import { toast } from "react-toastify";
import { handleApiError } from "../../../utils/errorHandler";

const API_BASE = "http://localhost:5286/api/admin/books";

export default function BookPage() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    id: "",
    isbn: "",
    title: "",
    categoryId: "",
    categoryName: "",
    authorId: "",
    authorName: "",
    publisherId: "",
    publisherName: "",
    yearOfPublication: "",
    quantity: "",
    totalQuantity: "",
    description: "",
    isDeleted: false,
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const [popupType, setPopupType] = useState("");
  const [popupData, setPopupData] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isValidGuid = (id) =>
    id &&
    id !== "" &&
    id !== "00000000-0000-0000-0000-000000000000";

  const fetchBooks = async () => {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
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

      setBooks(data);
      setPage(1);
    } catch {
      toast.error("Không thể tải sách!");
    }
  };

  const fetchPopupData = async (type) => {
    const urlMap = {
      author: "http://localhost:5286/api/admin/authors",
      category: "http://localhost:5286/api/admin/categories",
      publisher: "http://localhost:5286/api/admin/publishers",
    };
    const res = await axiosInstance.get(urlMap[type]);
    setPopupData(res.data.filter((i) => !i.isDeleted));
  };

  const openPopup = (type) => {
    setPopupType(type);
    fetchPopupData(type);
  };

  const handleSelect = (item) => {
    const map = {
      author: { id: "authorId", name: "authorName" },
      category: { id: "categoryId", name: "categoryName" },
      publisher: { id: "publisherId", name: "publisherName" },
    };
    const f = map[popupType];

    setForm((prev) => ({
      ...prev,
      [f.id]: item.id,
      [f.name]: item.name,
    }));

    setPopupType("");
  };

  useEffect(() => {
    fetchBooks();
  }, [search, sortConfig]);

  // ADD
  const openAdd = () => {
    setForm({
      id: "",
      isbn: "",
      title: "",
      categoryId: "",
      categoryName: "",
      authorId: "",
      authorName: "",
      publisherId: "",
      publisherName: "",
      yearOfPublication: "",
      quantity: "",
      totalQuantity: "",
      description: "",
      isDeleted: false,
      image: null,
    });
    setPreview(null);
    setModalVisible(true);
  };

  // EDIT
  const openEdit = (b) => {
    setForm({
      id: b.id,
      isbn: b.isbn,
      title: b.title,
      categoryId: b.categoryId,
      categoryName: b.categoryName,
      authorId: b.authorId,
      authorName: b.authorName,
      publisherId: b.publisherId,
      publisherName: b.publisherName,
      yearOfPublication: b.yearOfPublication,
      quantity: b.quantity,
      totalQuantity: b.totalQuantity,
      description: b.description,
      isDeleted: b.isDeleted,
      image: null,
    });

    setPreview(b.image ? `http://localhost:5286/${b.image}` : null);
    setModalVisible(true);
  };

  // SAVE
  const handleSave = async () => {
    try {
      if (!form.isbn || !form.title) {
        toast.error("ISBN & Tiêu đề là bắt buộc.");
        return;
      }

      // FIX LỖI ADD
      if (
        !isValidGuid(form.categoryId) ||
        !isValidGuid(form.authorId) ||
        !isValidGuid(form.publisherId)
      ) {
        toast.error("Vui lòng chọn Tác giả / Thể loại / NXB.");
        return;
      }

      // Add bắt buộc có ảnh
      if (!form.id && !(form.image instanceof File)) {
        toast.error("Vui lòng chọn ảnh bìa.");
        return;
      }

      const fd = new FormData();
      fd.append("Isbn", form.isbn);
      fd.append("Title", form.title);
      fd.append("CategoryId", form.categoryId);
      fd.append("AuthorId", form.authorId);
      fd.append("PublisherId", form.publisherId);
      fd.append("YearOfPublication", form.yearOfPublication);
      fd.append("Quantity", form.quantity);
      fd.append("TotalQuantity", form.totalQuantity);
      fd.append("Description", form.description);
      fd.append("IsDeleted", form.isDeleted ? "true" : "false");

      if (form.image instanceof File) {
        fd.append("imageFile", form.image);
      }

      let res;

      if (form.id) res = await axiosInstance.put(`${API_BASE}/${form.id}`, fd);
      else res = await axiosInstance.post(API_BASE, fd);

      toast.success(res.data?.message || "Thành công!");
      setModalVisible(false);
      fetchBooks();
    } catch (err) {
      handleApiError(err, "Lỗi khi lưu sách!");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      toast.success(res.data.message);
    } catch (err) {
      handleApiError(err);
    } finally {
      setDeleteId(null);
      fetchBooks();
    }
  };

  const toggleSort = (key) => {
    setSortConfig((p) => ({
      key,
      direction: p.key === key && p.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) =>
    sortConfig.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : "";

  const total = books.length;
  const totalPages = Math.ceil(total / pageSize);
  const safePage = Math.min(page, totalPages || 1);
  const start = (safePage - 1) * pageSize;
  const pageItems = books.slice(start, start + pageSize);

  return (
    <div className="container mt-4">

      {/* HEADER */}
      <h2>Danh sách sách</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>
          Thêm
        </button>
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
            {[5, 10, 20, 50, 100].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => toggleSort("isbn")} style={{ cursor: "pointer" }}>
              ISBN {getSortIcon("isbn")}
            </th>
            <th onClick={() => toggleSort("title")} style={{ cursor: "pointer" }}>
              Tên {getSortIcon("title")}
            </th>
            <th onClick={() => toggleSort("authorName")} style={{ cursor: "pointer" }}>
              Tác giả {getSortIcon("authorName")}
            </th>
            <th onClick={() => toggleSort("categoryName")} style={{ cursor: "pointer" }}>
              Thể loại {getSortIcon("categoryName")}
            </th>
            <th onClick={() => toggleSort("publisherName")} style={{ cursor: "pointer" }}>
              NXB {getSortIcon("publisherName")}
            </th>
            <th onClick={() => toggleSort("yearOfPublication")} style={{ cursor: "pointer" }}>
              Năm {getSortIcon("yearOfPublication")}
            </th>
            <th onClick={() => toggleSort("quantity")} style={{ cursor: "pointer" }}>
              SL {getSortIcon("quantity")}
            </th>
            <th onClick={() => toggleSort("totalQuantity")} style={{ cursor: "pointer" }}>
              Tổng {getSortIcon("totalQuantity")}
            </th>
            <th>Đã xoá</th>
            <th>Ảnh</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {pageItems.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            pageItems.map((b, i) => (
              <tr key={b.id}>
                <td>{start + i + 1}</td>
                <td>{b.isbn}</td>
                <td>{b.title}</td>
                <td>{b.authorName}</td>
                <td>{b.categoryName}</td>
                <td>{b.publisherName}</td>
                <td>{b.yearOfPublication}</td>
                <td>{b.quantity}</td>
                <td>{b.totalQuantity}</td>
                <td>
                  <input type="checkbox" checked={b.isDeleted} readOnly />
                </td>
                <td>
                  {b.image && (
                    <img
                      src={`http://localhost:5286/${b.image}`}
                      width={40}
                      alt="book"
                    />
                  )}
                </td>
                <td>
                  <button className="btn btn-info btn-sm me-2"
                    onClick={() => openEdit(b)}>
                    Sửa
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => setDeleteId(b.id)}>
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Hiển thị <b>{total === 0 ? 0 : start + 1}</b>–
          <b>{Math.min(start + pageSize, total)}</b> / <b>{total}</b>
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
              className={`btn ${p === safePage ? "btn-primary" : "btn-outline-secondary"}`}
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

      {/* MODAL ADD/EDIT */}
      {modalVisible && (
        <div className="modal show fade d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">

              <div className="modal-header">
                <h5>{form.id ? "Sửa sách" : "Thêm sách"}</h5>
                <button className="btn-close" onClick={() => setModalVisible(false)} />
              </div>

              <div className="modal-body row g-3">

                {/* isbn + title */}
                {["isbn", "title"].map((f) => (
                  <div key={f} className="col-md-6">
                    <label className="form-label">
                      {f === "isbn" ? "ISBN" : "Tiêu đề"}
                    </label>
                    <input
                      className="form-control"
                      value={form[f]}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [f]: e.target.value }))
                      }
                    />
                  </div>
                ))}

                {/* category/author/publisher */}
                {["category", "author", "publisher"].map((t) => (
                  <div key={t} className="col-md-6">
                    <label className="form-label">
                      {t === "category"
                        ? "Thể loại"
                        : t === "author"
                        ? "Tác giả"
                        : "Nhà xuất bản"}
                    </label>
                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        readOnly
                        value={form[`${t}Name`] || ""}
                      />
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => openPopup(t)}
                      >
                        Chọn
                      </button>
                    </div>
                  </div>
                ))}

                {/* numbers */}
                {[
                  { f: "yearOfPublication", l: "Năm xuất bản" },
                  { f: "quantity", l: "SL Khả dụng" },
                  { f: "totalQuantity", l: "Tổng SL" },
                ].map(({ f, l }) => (
                  <div key={f} className="col-md-6">
                    <label className="form-label">{l}</label>
                    <input
                      className="form-control"
                      value={form[f]}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [f]: e.target.value }))
                      }
                    />
                  </div>
                ))}

                {/* description */}
                <div className="col-12">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                {/* image */}
                <div className="col-md-6">
                  <label className="form-label">Ảnh bìa</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setForm((prev) => ({ ...prev, image: file }));
                      if (file) setPreview(URL.createObjectURL(file));
                    }}
                  />
                  {preview && (
                    <img src={preview} width={100} alt="preview" className="mt-2" />
                  )}
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label className="form-label me-2">Đã xoá:</label>
                  <input
                    type="checkbox"
                    checked={form.isDeleted}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isDeleted: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>
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

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="modal show fade d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Xác nhận xoá</h5>
                <button className="btn-close" onClick={() => setDeleteId(null)} />
              </div>
              <div className="modal-body">
                Bạn có chắc chắn muốn xoá?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>
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

      {/* POPUP */}
      <SelectPopup
        open={!!popupType}
        title={
          popupType === "author"
            ? "Chọn tác giả"
            : popupType === "category"
            ? "Chọn thể loại"
            : "Chọn nhà xuất bản"
        }
        rows={popupData}
        onSelect={handleSelect}
        onClose={() => setPopupType("")}
      />
    </div>
  );
}
