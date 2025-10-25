import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5286/api/admin/customers";

export default function CustomerPopup({ open, onSelect, onClose }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  // Modal Thêm (giữ cùng cách đặt tên/trường như CustomerPage)
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    id: "",
    familyName: "",
    givenName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    gender: false,
    isDeleted: false,
  });

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get(API_BASE);
      setRows(res.data.filter((x) => !x.isDeleted));
    } catch (err) {
      toast.error("Không thể tải danh sách khách hàng.");
    }
  };

  useEffect(() => {
    if (open) {
      fetchCustomers();
      setQ("");
      // reset form & đóng modal mỗi lần mở popup
      setModalVisible(false);
      setForm({
        id: "",
        familyName: "",
        givenName: "",
        dateOfBirth: "",
        address: "",
        phone: "",
        gender: false,
        isDeleted: false,
      });
    }
  }, [open]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((c) =>
      [c.familyName, c.givenName, c.phone, c.email]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(kw))
    );
  }, [rows, q]);

  const openAdd = () => {
    setForm({
      id: "",
      familyName: "",
      givenName: "",
      dateOfBirth: "",
      address: "",
      phone: "",
      gender: false,
      isDeleted: false,
    });
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
        gender: form.gender,
        isDeleted: form.isDeleted,
      };

      const res = await axiosInstance.post(API_BASE, payload);

      toast.success(res.data?.message || "Lưu thành công.");
      setModalVisible(false);
      fetchCustomers();
    } catch (err) {
      handleApiError(err, "Lỗi khi lưu khách hàng!");
    }
  };

  if (!open) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Chọn khách hàng</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Thanh công cụ: Thêm + Search (y chang CustomerPage) */}
            <div className="d-flex gap-2 mb-3">
              <button className="btn btn-success" onClick={openAdd}>
                Thêm
              </button>
              <input
                className="form-control w-25"
                placeholder="Tìm kiếm..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Họ</th>
                  <th>Tên</th>
                  <th>Điện thoại</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.familyName}</td>
                    <td>{c.givenName}</td>
                    <td>{c.phone}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          onSelect(c);
                          onClose();
                        }}
                      >
                        Chọn
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      Không tìm thấy kết quả
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal Thêm/Sửa (chỉ Thêm giống CustomerPage, không thêm gì mới) */}
          {modalVisible && (
            <div className="modal show fade d-block" tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Thêm khách hàng</h5>
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
                    ].map(({ label, name, type }) => (
                      <div key={name} className="col-md-6">
                        <label>{label}</label>
                        <input
                          type={type || "text"}
                          className="form-control"
                          value={form[name] || ""}
                          onChange={(e) =>
                            setForm({ ...form, [name]: e.target.value })
                          }
                        />
                      </div>
                    ))}

                    <div className="col-md-6 d-flex align-items-center">
                      <label className="form-check-label me-2">Giới tính:</label>
                      <select
                        className="form-select"
                        value={form.gender}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            gender: e.target.value === "true",
                          })
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

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
