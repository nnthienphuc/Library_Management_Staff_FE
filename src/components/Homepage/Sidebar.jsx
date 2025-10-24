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
  FaLayerGroup,
  FaAddressCard,
  FaIdCard,
  FaCogs,
} from "react-icons/fa";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const fullName = localStorage.getItem("fullName");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const sectionStyle = {
  backgroundColor: "#0d3b4c", // Màu nhấn nền nhẹ
  color: "#f0f0f0",           // Màu chữ sáng
  padding: "8px 12px",
  marginTop: 20,
  borderRadius: 6,
  fontSize: 14,
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

  const menuItems = [
    {
      section: "Quản lý sách",
      items: [
        { label: "Sách", path: "/admin/book", icon: <FaBook /> },
        { label: "Thể loại sách", path: "/admin/category", icon: <FaLayerGroup /> },
        { label: "Tác giả", path: "/admin/author", icon: <FaUserEdit /> },
        { label: "Nhà xuất bản", path: "/admin/publisher", icon: <FaBuilding /> },
      ],
    },
    {
      section: "Khách & Hội viên",
      items: [
        { label: "Khách hàng", path: "/admin/customer", icon: <FaUsers /> },
        { label: "Gói hội viên", path: "/admin/membership-plan", icon: <FaIdCard /> },
        { label: "Hội viên", path: "/admin/membership", icon: <FaAddressCard />, adminOnly: true },
      ],
    },
    {
      section: "Tài khoản & Nhân sự",
      items: [
        { label: "Nhân viên", path: "/admin/staff", icon: <FaUserShield />, adminOnly: true },
        { label: "Đổi mật khẩu", path: "/admin/change-password", icon: <FaLock /> },
      ],
    },
  ];

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

        {/* MENU */}
        <nav>
          {menuItems.map((section, index) => (
            <div key={index}>
              <div style={sectionStyle}>{section.section}</div>
              {section.items.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                const isActive = pathname === item.path;
                return (
                  <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 12px",
                      marginBottom: 6,
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
            </div>
          ))}
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
