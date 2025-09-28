import React, { useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmNewPassword) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      alert("Mật khẩu mới và xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.put(
        "http://localhost:5286/api/admin/auth/change-password",
        form
      );
      alert(res.data?.message || "Đã đổi mật khẩu thành công.");
      setForm({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Lỗi đổi mật khẩu.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 500 }}>
      <h3>Thay đổi mật khẩu</h3>
      <div className="mb-3">
        <label>Mật khẩu cũ:</label>
        <input
          type="password"
          className="form-control"
          value={form.oldPassword}
          onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <label>Mật khẩu mới:</label>
        <input
          type="password"
          className="form-control"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <label>Xác nhận mật khẩu mới:</label>
        <input
          type="password"
          className="form-control"
          value={form.confirmNewPassword}
          onChange={(e) =>
            setForm({ ...form, confirmNewPassword: e.target.value })
          }
        />
      </div>
      <button
        className="btn btn-primary"
        onClick={handleChangePassword}
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
      </button>
    </div>
  );
}
