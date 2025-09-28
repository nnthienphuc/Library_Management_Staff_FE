// AdminLayout.jsx
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',           // Chiều cao toàn màn hình
      overflow: 'hidden'         // Không để tổng layout bị scroll
    }}>
      {/* Sidebar cố định */}
      <div style={{
        width: 220,
        background: '#176264',
        color: '#fff',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <Sidebar />
      </div>

      {/* Nội dung chính cuộn riêng */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 24,
        background: '#f6f6f6'
      }}>
        <Outlet />
      </div>
    </div>
  );
}
