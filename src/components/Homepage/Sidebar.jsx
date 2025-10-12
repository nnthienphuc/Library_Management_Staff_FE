// Sidebar.jsx
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
  { label: 'Sách', path: '/admin/book' },
  // { label: 'Đơn hàng', path: '/admin/order' },
  { label: 'Thể loại sách', path: '/admin/category' },
  // { label: 'Khách hàng', path: '/admin/customer' },
  { label: 'Nhân viên', path: '/admin/staff' },
  { label: 'Tác giả', path: '/admin/author' },
  { label: 'Nhà xuất bản', path: '/admin/publisher' },
  // { label: 'Thống kê', path: '/admin/statistics' },
  { label: 'Đổi mật khẩu', path: '/admin/change-password' },
  {
    label: 'Đăng xuất',
    action: () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: 24
    }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: 36 }}>BOOK STORE 🟩</h2>

      {menuItems.map(item => {
        const isActive = pathname.startsWith(item.path);
        return (
          <div
            key={item.label}
            onClick={() => {
              if (item.action) item.action();
              else navigate(item.path);
            }}
            style={{
              color: isActive ? '#ffd700' : '#fff',
              padding: '12px 0',
              textDecoration: 'none',
              fontWeight: isActive ? 'bold' : 400,
              cursor: 'pointer'
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
