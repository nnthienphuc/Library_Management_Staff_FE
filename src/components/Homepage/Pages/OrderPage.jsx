import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import CustomerPopup from "./CustomerPopup";
import PromotionPopup from "./PromotionPopup";
import BookPopup from "./BookPopup";

const API_BASE = "http://localhost:5286/api/admin/orders";

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm, setAddForm] = useState({
    customerId: "",
    customerName: "",
    promotionId: "",
    promotionName: "",
    discountPercent: 0,
    paymentMethod: "Tiền mặt",
    items: [{ bookId: "", bookTitle: "", unitPrice: 0, quantity: 1 }],
  });

  const [customerPopup, setCustomerPopup] = useState(false);
  const [promotionPopup, setPromotionPopup] = useState(false);
  const [bookPopupIndex, setBookPopupIndex] = useState(null);

  const [detailPopupOrderId, setDetailPopupOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  // --- PHÂN TRANG (client-side) ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // ---------------------------------

  useEffect(() => {
    fetchOrders();
  }, [search]);

  async function fetchOrders() {
    try {
      const url = search ? `${API_BASE}/search?keyword=${search}` : API_BASE;
      const res = await axiosInstance.get(url);
      setOrders(res.data);
      setPage(1); // mỗi lần tìm kiếm, quay lại trang 1
    } catch {
      alert("Không thể tải danh sách đơn hàng.");
    }
  }

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1); // sắp xếp lại cũng về trang 1
  };

  const renderSortIcon = (key) =>
    sortConfig.key !== key
      ? null
      : sortConfig.direction === "asc"
      ? " ▲"
      : " ▼";

  const sortedOrders = React.useMemo(() => {
    const arr = [...orders];
    if (sortConfig.key) {
      arr.sort((a, b) => {
        let av = a[sortConfig.key],
          bv = b[sortConfig.key];
        if (sortConfig.key === "createdTime") {
          av = new Date(av);
          bv = new Date(bv);
        } else if (["shippingFee", "totalAmount"].includes(sortConfig.key)) {
          av = Number(av);
          bv = Number(bv);
        } else {
          av = av?.toString().toLowerCase();
          bv = bv?.toString().toLowerCase();
        }
        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [orders, sortConfig]);

  // --- TÍNH TOÁN PHÂN TRANG ---
  const total = sortedOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = sortedOrders.slice(start, end);
  // ----------------------------

  const openAdd = () => {
    setAddForm({
      customerId: "",
      customerName: "",
      promotionId: "",
      promotionName: "",
      discountPercent: 0,
      paymentMethod: "Tiền mặt",
      items: [{ bookId: "", bookTitle: "", unitPrice: 0, quantity: 1 }],
    });
    setAddModalVisible(true);
  };

  const handlePopupSelect = (type, item) => {
    if (type === "customer") {
      setAddForm((f) => ({
        ...f,
        customerId: item.id,
        customerName: `${item.familyName} ${item.givenName}`,
      }));
      setCustomerPopup(false);
    }
    if (type === "promotion") {
      setAddForm((f) => ({
        ...f,
        promotionId: item.id,
        promotionName: item.name,
        discountPercent: item.discountPercent || 0,
      }));
      setPromotionPopup(false);
    }
    if (type === "book" && bookPopupIndex !== null) {
      setAddForm((f) => {
        const items = [...f.items];
        items[bookPopupIndex] = {
          bookId: item.id,
          bookTitle: item.title,
          unitPrice: item.price,
          quantity: 1,
        };
        return { ...f, items };
      });
      setBookPopupIndex(null);
    }
  };

  const clearPromotion = () => {
    setAddForm((f) => ({
      ...f,
      promotionId: "",
      promotionName: "",
      discountPercent: 0,
    }));
  };

  const handleCreateOrder = async () => {
    if (!addForm.customerId) {
      alert("Vui lòng chọn khách hàng.");
      return;
    }
    if (addForm.items.length === 0 || addForm.items.some((x) => !x.bookId)) {
      alert("Vui lòng chọn ít nhất một sách hợp lệ.");
      return;
    }

    const payload = {
      customerId: addForm.customerId,
      promotionId: addForm.promotionId || null,
      paymentMethod: addForm.paymentMethod,
      items: addForm.items.map((x) => ({
        bookId: x.bookId,
        quantity: x.quantity,
      })),
    };

    try {
      const res = await axiosInstance.post(API_BASE, payload);

      if (addForm.paymentMethod === "MoMo") {
        const momoUrl = res.data?.payUrl;
        if (momoUrl) {
          window.open(momoUrl, "_blank");
          alert("Tạo đơn hàng thành công. Đã mở trang thanh toán MoMo.");
          fetchOrders();
          setAddModalVisible(false);
          return;
        } else {
          alert("Không thể tạo liên kết thanh toán MoMo.");
          return;
        }
      }

      alert(res.data?.message || "Tạo đơn hàng thành công.");
      fetchOrders();
      setAddModalVisible(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data ||
        "Lỗi tạo đơn hàng.";
      alert(msg);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      const payload = {
        status: form.status,
        note: form.note || "",
        isDeleted: form.isDeleted || false,
      };
      const res = await axiosInstance.put(`${API_BASE}/${form.id}`, payload);
      alert(res.data?.message || "Cập nhật thành công");
      fetchOrders();
      setModalVisible(false);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        alert("Bạn không có quyền sửa đơn hàng này.");
        return;
      }
      alert(err.response?.data?.message || "Lỗi cập nhật đơn hàng");
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE}/${deleteId}`);
      alert(res.data?.message || "Xóa thành công");
      fetchOrders();
      setDeleteId(null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        alert("Bạn không có quyền xoá đơn hàng này.");
        return;
      }
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const res = await axiosInstance.get(`${API_BASE}/items/${orderId}`);
      setOrderItems(res.data);
      setDetailPopupOrderId(orderId);
    } catch {
      alert("Lỗi tải chi tiết đơn hàng.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách Đơn hàng</h2>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={openAdd}>
          Tạo đơn hàng
        </button>
        <input
          placeholder="Tìm kiếm..."
          value={search}
          className="form-control w-25"
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
            {[
              "staffName",
              "customerName",
              "customerPhone",
              "customerAddress",
              "createdTime",
              "status",
              // "shippingFee",
              "totalAmount",
              // "note",
              "isDeleted",
            ].map((key, i) => (
              <th
                key={i}
                onClick={() => handleSort(key)}
                style={{ cursor: "pointer" }}
              >
                {
                  [
                    "Nhân viên",
                    "Khách hàng",
                    "SĐT",
                    "Địa chỉ",
                    "Thời gian",
                    "Trạng thái",
                    // "Phí ship",
                    "Tổng tiền",
                    // "Ghi chú",
                    "Đã xoá",
                  ][i]
                }
                {renderSortIcon(key)}
              </th>
            ))}
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
            pageItems.map((o, i) => (
              <tr key={o.id}>
                <td>{start + i + 1}</td>
                <td>{o.staffName}</td>
                <td>{o.customerName}</td>
                <td>{o.customerPhone}</td>
                <td>{o.customerAddress || "-"}</td>
                <td>{new Date(o.createdTime).toLocaleString()}</td>
                <td>{o.status}</td>
                {/* <td>{o.shippingFee}</td> */}
                <td>{o.totalAmount}</td>
                {/* <td>{o.note || "-"}</td>    */}
                <td>
                  <input type="checkbox" checked={o.isDeleted} readOnly />
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <button
                      className="btn btn-info btn-sm mb-1"
                      onClick={() => {
                        setForm(o);
                        setModalVisible(true);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteId(o.id)}
                    >
                      Xóa
                    </button>
                    <button
                      className="btn btn-secondary btn-sm mb-1"
                      onClick={() => fetchOrderItems(o.id)}
                    >
                      Chi tiết
                    </button>
                  </div>
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

      {/* Modal chi tiết đơn hàng */}
      {detailPopupOrderId && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết đơn hàng</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDetailPopupOrderId(null)}
                ></button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sách</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((it, idx) => (
                      <tr key={it.bookId}>
                        <td>{idx + 1}</td>
                        <td>{it.bookName}</td>
                        <td>{it.price.toLocaleString()} ₫</td>
                        <td>{it.quantity}</td>
                        <td>{(it.price * it.quantity).toLocaleString()} ₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDetailPopupOrderId(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo đơn hàng */}
      {addModalVisible && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo đơn hàng mới</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAddModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* customer */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Khách hàng:</label>
                    <div className="input-group">
                      <input
                        className="form-control"
                        value={addForm.customerName}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setCustomerPopup(true)}
                      >
                        Chọn
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label>Khuyến mãi:</label>
                    <div className="input-group">
                      <input
                        className="form-control"
                        value={addForm.promotionName}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setPromotionPopup(true)}
                      >
                        Chọn
                      </button>
                      {addForm.promotionId && (
                        <button
                          className="btn btn-outline-danger"
                          onClick={clearPromotion}
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label>Phương thức thanh toán:</label>
                    <select
                      className="form-control"
                      value={addForm.paymentMethod}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          paymentMethod: e.target.value,
                        })
                      }
                    >
                      <option>Tiền mặt</option>
                      {/* <option>MoMo</option> */}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label>Sản phẩm:</label>
                  {addForm.items.map((item, index) => (
                    <div key={index} className="row align-items-center mb-2">
                      <div className="col-md-4">
                        <input
                          className="form-control"
                          value={item.bookTitle}
                          readOnly
                          placeholder="Sách"
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => setBookPopupIndex(index)}
                        >
                          Chọn
                        </button>
                      </div>
                      <div className="col-md-2">
                        <input
                          type="number"
                          min={1}
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 1;
                            const newItems = [...addForm.items];
                            newItems[index].quantity = qty;
                            setAddForm({ ...addForm, items: newItems });
                          }}
                        />
                      </div>
                      <div className="col-md-2">
                        <input
                          className="form-control"
                          value={item.unitPrice.toLocaleString()}
                          readOnly
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          className="btn btn-danger w-100"
                          onClick={() => {
                            const items = addForm.items.filter(
                              (_, i) => i !== index
                            );
                            setAddForm({ ...addForm, items });
                          }}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() =>
                      setAddForm({
                        ...addForm,
                        items: [
                          ...addForm.items,
                          {
                            bookId: "",
                            bookTitle: "",
                            unitPrice: 0,
                            quantity: 1,
                          },
                        ],
                      })
                    }
                  >
                    + Thêm sản phẩm
                  </button>
                </div>

                <div className="text-end mt-3">
                  <h5>
                    Tổng tiền:&nbsp;
                    {(() => {
                      const subtotal = addForm.items.reduce(
                        (sum, x) => sum + x.unitPrice * x.quantity,
                        0
                      );
                      const total =
                        subtotal - subtotal * addForm.discountPercent;
                      return total.toLocaleString() + " ₫";
                    })()}
                  </h5>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setAddModalVisible(false)}
                >
                  Huỷ
                </button>
                <button className="btn btn-primary" onClick={handleCreateOrder}>
                  Tạo đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa đơn hàng */}
      {modalVisible && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sửa đơn hàng</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Khách hàng:</strong> {form.customerName}
                </p>
                <p>
                  <strong>Nhân viên:</strong> {form.staffName}
                </p>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  {form.totalAmount?.toLocaleString()} ₫
                </p>
                <div className="mb-2">
                  <label>Trạng thái</label>
                  <select
                    className="form-control"
                    value={form.status || ""}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="Thành công">Thành công</option>
                    <option value="Đang vận chuyển">Đang vận chuyển</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label>Ghi chú</label>
                  <textarea
                    className="form-control"
                    value={form.note || ""}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={form.isDeleted || false}
                    onChange={(e) =>
                      setForm({ ...form, isDeleted: e.target.checked })
                    }
                  />
                  <label className="form-check-label">Đã xoá</label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalVisible(false)}
                >
                  Huỷ
                </button>
                <button className="btn btn-primary" onClick={handleUpdateOrder}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deleteId && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xóa</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc muốn xóa đơn hàng này?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                >
                  Huỷ
                </button>
                <button className="btn btn-danger" onClick={handleDeleteOrder}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popups để chọn dữ liệu */}
      <CustomerPopup
        open={customerPopup}
        onSelect={(c) => handlePopupSelect("customer", c)}
        onClose={() => setCustomerPopup(false)}
      />
      <PromotionPopup
        open={promotionPopup}
        onSelect={(p) => handlePopupSelect("promotion", p)}
        onClose={() => setPromotionPopup(false)}
      />
      {bookPopupIndex !== null && (
        <BookPopup
          open
          onSelect={(b) => handlePopupSelect("book", b)}
          onClose={() => setBookPopupIndex(null)}
        />
      )}
    </div>
  );
}
