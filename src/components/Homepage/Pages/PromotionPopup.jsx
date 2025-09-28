import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

export default function PromotionPopup({ open, onSelect, onClose }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) {
      axiosInstance
        .get("http://localhost:5286/api/admin/promotions")
        .then((res) => setRows(res.data.filter((x) => !x.isDeleted)))
        .catch(() => alert("Không thể tải khuyến mãi"));
      setQ("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((p) =>
      [p.name, p.condition]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(kw))
    );
  }, [rows, q]);

  if (!open) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Chọn khuyến mãi</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <input
              className="form-control mb-3"
              placeholder="Tìm theo tên hoặc điều kiện..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <table className="table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Ngày bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Điều kiện</th>
                  <th>Giảm</th>
                  <th>Số lượng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{new Date(p.startDate).toLocaleDateString()}</td>
                    <td>{new Date(p.endDate).toLocaleDateString()}</td>
                    <td>{p.condition}</td>
                    <td>{p.discountPercent}</td>
                    <td>{p.quantity}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          onSelect(p);
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
                    <td colSpan={7} className="text-center">
                      Không tìm thấy kết quả
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
