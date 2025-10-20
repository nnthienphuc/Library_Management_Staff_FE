import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../../theme";

import {
  FaBook,
  FaThLarge,
  FaUsers,
  FaUserShield,
  FaUserEdit,
  FaBuilding,
  FaLock,
  FaSignOutAlt,
} from "react-icons/fa";

const menuItems = [
  { label: "Sách", path: "/admin/book", icon: <FaBook /> },
  { label: "Thể loại sách", path: "/admin/category", icon: <FaThLarge /> },
  { label: "Khách hàng", path: "/admin/customer", icon: <FaUsers /> },
  { label: "Nhân viên", path: "/admin/staff", icon: <FaUserShield />, adminOnly: true },
  { label: "Tác giả", path: "/admin/author", icon: <FaUserEdit /> },
  { label: "Nhà xuất bản", path: "/admin/publisher", icon: <FaBuilding /> },
  { label: "Đổi mật khẩu", path: "/admin/change-password", icon: <FaLock /> },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const fullName = localStorage.getItem("fullName");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        width: "240px",
        height: "100vh",
        backgroundColor: colors.primary,
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        padding: "16px 12px",
      }}
    >
      {/* HEADER */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          📚 Library
          <div style={{ fontSize: 13, fontWeight: 400, color: "#ccc" }}>
            Management System
          </div>
        </h2>

        {/* USER INFO */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#bbb" }}>👋 Xin chào,</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{fullName}</div>
          <div style={{ fontSize: 12, fontStyle: "italic", color: "#aaa" }}>
            {isAdmin ? "Admin" : "Nhân viên"}
          </div>
        </div>

        {/* MENU ITEMS */}
        <nav>
          {menuItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = pathname.startsWith(item.path);
            return (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  marginBottom: 8,
                  backgroundColor: isActive ? colors.highlight : "transparent",
                  color: isActive ? colors.darkText : "#fff",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: isActive ? "bold" : 400,
                  transition: "background 0.3s, color 0.3s",
                }}
              >
                {item.icon}
                {item.label}
              </div>
            );
          })}
        </nav>
      </div>

      {/* LOGOUT */}
      <div
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: colors.danger,
          color: "#fff",
          padding: "10px 12px",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        <FaSignOutAlt />
        Đăng xuất
      </div>
    </div>
  );
}
