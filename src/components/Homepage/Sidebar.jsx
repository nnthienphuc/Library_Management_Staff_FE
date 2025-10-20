// Sidebar.jsx
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Sách", path: "/admin/book" },
  // { label: 'Đơn hàng', path: '/admin/order' },
  { label: "Thể loại sách", path: "/admin/category" },
  { label: "Khách hàng", path: "/admin/customer" },
  { label: "Nhân viên", path: "/admin/staff", adminOnly: true },
  { label: "Tác giả", path: "/admin/author" },
  { label: "Nhà xuất bản", path: "/admin/publisher" },
  // { label: 'Thống kê', path: '/admin/statistics' },
  { label: "Đổi mật khẩu", path: "/admin/change-password" },
  {
    label: "Đăng xuất",
    action: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("fullName");
      localStorage.removeItem("isAdmin");
      window.location.href = "/login";
    },
  },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const fullName = localStorage.getItem("fullName");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 24,
      }}
    >
      <h2 style={{ fontWeight: "bold", marginBottom: 12 }}>
        Library Management
      </h2>

      <div style={{ marginBottom: 36, color: "#fff" }}>
        <div style={{ fontWeight: "bold" }}>{fullName || "Chưa đăng nhập"}</div>
        <div style={{ fontStyle: "italic", fontSize: 14 }}>
          {isAdmin ? "Admin" : "Nhân viên"}
        </div>
      </div>

      {menuItems.map((item) => {
        if (item.adminOnly && !isAdmin) return null;
        const isActive = pathname.startsWith(item.path);
        return (
          <div
            key={item.label}
            onClick={() => {
              if (item.action) item.action();
              else navigate(item.path);
            }}
            style={{
              color: isActive ? "#ffd700" : "#fff",
              padding: "12px 0",
              textDecoration: "none",
              fontWeight: isActive ? "bold" : 400,
              cursor: "pointer",
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
