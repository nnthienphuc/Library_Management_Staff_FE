import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Homepage/AdminLayout';
import CategoryPage from './components/Homepage/Pages/CategoryPage';
import AuthorPage from './components/Homepage/Pages/AuthorPage';
import PublisherPage from './components/Homepage/Pages/PublisherPage';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPassword';
import PrivateRoute from './components/PrivateRoute';
import BookPage from './components/Homepage/Pages/BookPage';
import CustomerPage from './components/Homepage/Pages/CustomerPage';
import StaffPage from './components/Homepage/Pages/StaffPage';
import StatisticsPage from './components/Homepage/Pages/StatisticsPage';
import ChangePasswordPage from './components/Homepage/Pages/ChangePasswordPage';


function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />

      {/* Protected admin routes */}
      <Route path="/admin" element={
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route path="book" element={<BookPage />} />
        <Route path="category" element={<CategoryPage />} />
        <Route path="author" element={<AuthorPage />} />
        <Route path="publisher" element={<PublisherPage />} />
        <Route path="customer" element={<CustomerPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />


        {/* Add more pages here */}
      </Route>

      {/* Default route */}
      <Route path="*" element={<Navigate to="/admin/book" replace />} />
    </Routes>
  );
}

export default App;
