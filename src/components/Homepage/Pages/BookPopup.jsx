import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

export default function BookPopup({ open, onSelect, onClose }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) {
      axiosInstance
        .get("http://localhost:5286/api/admin/books")
        .then((res) => setRows(res.data.filter((x) => !x.isDeleted)))
        .catch(() => alert("Không thể tải sách"));
      setQ(""); // reset ô tìm kiếm mỗi lần mở
    }
  }, [open]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((b) =>
      [b.isbn, b.title]
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
            <h5>Chọn sách</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <input
              className="form-control mb-3"
              placeholder="Tìm theo ISBN hoặc tiêu đề..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <table className="table">
              <thead>
                <tr>
                  <th>ISBN</th>
                  <th>Tiêu đề</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td>{b.isbn}</td>
                    <td>{b.title}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          onSelect(b);
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
                    <td colSpan={3} className="text-center">
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
