import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import SelectPopup from "./SelectPopup";
import { toast } from "react-toastify";

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
    isDeleted: false,
    description: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const [popupType, setPopupType] = useState("");
  const [popupData, setPopupData] = useState([]);

  // ---- PHÂN TRANG (client-side) ----
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // -----------------------------------

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
      // Mỗi lần tìm kiếm/sắp xếp xong thì quay về trang 1
      setPage(1);
    } catch (err) {
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
    setPopupData(res.data.filter((item) => !item.isDeleted));
  };

  const openPopup = (type) => {
    setPopupType(type);
    fetchPopupData(type);
  };

  const handleSelect = (item) => {
    const fieldMap = {
      author: { idField: "authorId", nameField: "authorName" },
      category: { idField: "categoryId", nameField: "categoryName" },
      publisher: { idField: "publisherId", nameField: "publisherName" },
    };

    const { idField, nameField } = fieldMap[popupType];

    setForm({
      ...form,
      [idField]: item.id,
      [nameField]: item.name,
    });

    setPopupType("");
  };

  useEffect(() => {
    fetchBooks();
  }, [search, sortConfig]); // giữ nguyên

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
    setIsEdit(false);
    setModalVisible(true);
  };

  const openEdit = (book) => {
    setForm({
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      categoryId: book.categoryId || "",
      categoryName: book.categoryName || "",
      authorId: book.authorId || "",
      authorName: book.authorName || "",
      publisherId: book.publisherId || "",
      publisherName: book.publisherName || "",
      yearOfPublication: book.yearOfPublication,
      quantity: book.quantity,
      totalQuantity: book.totalQuantity,
      description: book.description || "",
      isDeleted: book.isDeleted,
      image: null,
    });
    setPreview(book.image ? `http://localhost:5286/${book.image}` : null);
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    console.log("Form values before submit:", form);

    try {
      if (!form.authorId || !form.categoryId || !form.publisherId) {
        alert("Vui lòng chọn tác giả, thể loại và nhà xuất bản.");
        return;
      }

      const formData = new FormData();

      formData.append("isbn", form.isbn);
      formData.append("title", form.title);
      formData.append("categoryId", form.categoryId);
      formData.append("authorId", form.authorId);
      formData.append("publisherId", form.publisherId);
      formData.append("yearOfPublication", form.yearOfPublication);
      formData.append("quantity", form.quantity);
      formData.append("totalQuantity", form.totalQuantity);
      formData.append("description", form.description || "");
      formData.append("isDeleted", form.isDeleted);

      if (form.image instanceof File) {
        formData.append("imageFile", form.image);
      }

      let res;
      if (isEdit) {
        res = await axiosInstance.put(`${API_BASE}/${form.id}`, formData);
      } else {
        res = await axiosInstance.post(API_BASE, formData);
      }

      toast.success(res.data?.message || "Lưu thành công!");
      setModalVisible(false);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu sách!");
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
      fetchBooks();
    }
  };

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  // ---- TÍNH TOÁN PHÂN TRANG (client-side) ----
  const total = books.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages); // phòng trường hợp total giảm
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = books.slice(start, end);
  // --------------------------------------------

  return (
    <div className="container mt-4">
      <h2>Danh sách sách</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>
          Thêm
        </button>
        <input
          className="form-control w-25"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
        />
        {/* Chọn kích thước trang (không đổi API) */}
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
              onClick={() => toggleSort("isbn")}
              style={{ cursor: "pointer" }}
            >
              ISBN {getSortIcon("isbn")}
            </th>
            <th
              onClick={() => toggleSort("title")}
              style={{ cursor: "pointer" }}
            >
              Tên {getSortIcon("title")}
            </th>
            <th
              onClick={() => toggleSort("authorName")}
              style={{ cursor: "pointer" }}
            >
              Tác giả {getSortIcon("authorName")}
            </th>
            <th
              onClick={() => toggleSort("categoryName")}
              style={{ cursor: "pointer" }}
            >
              Thể loại {getSortIcon("categoryName")}
            </th>
            <th
              onClick={() => toggleSort("publisherName")}
              style={{ cursor: "pointer" }}
            >
              NXB {getSortIcon("publisherName")}
            </th>
            <th
              onClick={() => toggleSort("yearOfPublication")}
              style={{ cursor: "pointer" }}
            >
              Năm {getSortIcon("yearOfPublication")}
            </th>
            <th
              onClick={() => toggleSort("quantity")}
              style={{ cursor: "pointer" }}
            >
              SL Khả dụng {getSortIcon("quantity")}
            </th>
            <th
              onClick={() => toggleSort("totalQuantity")}
              style={{ cursor: "pointer" }}
            >
              Tổng SL {getSortIcon("totalQuantity")}
            </th>
            <th
              onClick={() => toggleSort("isDeleted")}
              style={{ cursor: "pointer" }}
            >
              Đã xoá {getSortIcon("isDeleted")}
            </th>
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
                      alt="book"
                      width={40}
                    />
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
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

      {/** Modal thêm/sửa */}
      {modalVisible && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? "Sửa" : "Thêm"} sách</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body row g-3">
                {["isbn", "title"].map((field) => (
                  <div key={field} className="col-md-6">
                    <label className="form-label text-capitalize">
                      {field === "isbn" ? "ISBN" : "Tiêu đề"}
                    </label>
                    <input
                      className="form-control"
                      value={form[field] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}

                {["category", "author", "publisher"].map((type) => (
                  <div key={type} className="col-md-6">
                    <label className="form-label text-capitalize">
                      {type === "author"
                        ? "Tác giả"
                        : type === "category"
                        ? "Thể loại"
                        : "Nhà xuất bản"}
                    </label>
                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        value={form[`${type}Name`] || ""}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => openPopup(type)}
                      >
                        Chọn
                      </button>
                    </div>
                  </div>
                ))}

                {[
                  { field: "yearOfPublication", label: "Năm xuất bản" },
                  { field: "quantity", label: " SL Khả dụng" },
                  { field: "totalQuantity", label: "Tổng SL" },
                ].map(({ field, label }) => (
                  <div key={field} className="col-md-6">
                    <label className="form-label">{label}</label>
                    <input
                      className="form-control"
                      value={form[field] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}

                <div className="col-12">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Nhập mô tả sách..."
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Ảnh bìa</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setForm({ ...form, image: file });
                      setPreview(URL.createObjectURL(file));
                    }}
                  />
                  {preview && (
                    <img
                      src={preview}
                      alt="preview"
                      className="mt-2"
                      width={100}
                    />
                  )}
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <label className="form-label me-2">Đã xoá:</label>
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

      {/** Modal xác nhận xoá */}
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
                <p>Bạn có chắc chắn muốn xoá sách này?</p>
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
