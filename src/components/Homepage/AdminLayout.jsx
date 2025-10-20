import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { colors } from "../../theme";

export default function AdminLayout() {
  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        backgroundColor: colors.contentBg, // dùng màu nền dịu hơn
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          boxShadow: "2px 0 4px rgba(0,0,0,0.05)", // tạo viền nhẹ phân cách
          zIndex: 1,
        }}
      >
        <Sidebar />
      </div>

      {/* Nội dung chính */}
      <main
        style={{
          flex: 1,
          height: "100dvh",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
