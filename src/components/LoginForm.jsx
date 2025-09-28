import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MDBBtn, MDBCard, MDBCardBody,
  MDBCardImage, MDBInput, MDBIcon, MDBCheckbox
} from 'mdb-react-ui-kit';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function LoginForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('activated') === 'true') {
      setMessage('Tài khoản đã được kích hoạt. Vui lòng đăng nhập.');
    } else if (params.get('activated') === 'false') {
    setError('Token không hợp lệ hoặc tài khoản đã được kích hoạt trước đó.');
  }

    if (params.get('reset') === 'success') {
      setMessage('Mật khẩu đã được đặt lại thành 123456. Vui lòng đăng nhập.');
    }else if (params.get('reset') === 'failed') {
    setError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
  }
  }, [location]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await axios.post('http://localhost:5286/api/admin/auth/login', formData);
    localStorage.setItem('token', res.data.token);
    navigate('/admin/category');  // Đổi sang trang Category CRUD
  } catch (err) {
    setError(err.response?.data?.message || 'Đăng nhập thất bại!');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
      <MDBCard className="text-black w-100 mx-3" style={{ maxWidth: '900px', borderRadius: '25px' }}>
        <MDBCardBody>
          <div className="row g-0">
            {/* FORM */}
            <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
              <p className="text-center h1 fw-bold mb-4 mt-4">ĐĂNG NHẬP</p>
              <form onSubmit={handleSubmit} className="w-100 px-4">
                <div className="d-flex align-items-center mb-4">
                  <MDBIcon fas icon="envelope me-3" size="lg" />
                  <MDBInput
                    label="Email"
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="text-black"
                  />
                </div>

                <div className="d-flex align-items-center mb-3">
                  <MDBIcon fas icon="lock me-3" size="lg" />
                  <MDBInput
                    label="Mật khẩu"
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="text-black"
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                  <MDBCheckbox
                    name="remember"
                    value="remember"
                    label="Ghi nhớ đăng nhập"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <Link to="/forgot-password" className="text-primary">Quên mật khẩu?</Link>
                </div>

                <MDBBtn type="submit" className="mb-3 w-100" size="lg" disabled={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </MDBBtn>

                {message && <p className="text-success text-center">{message}</p>}
                {error && <p className="text-danger text-center">{error}</p>}

                <div className="text-center mt-3">
                  <span>Bạn chưa có tài khoản? </span>
                  <Link to="/register" className="text-primary">Đăng ký</Link>
                </div>
              </form>
            </div>

            {/* IMAGE */}
            <div className="col-md-6 d-flex align-items-center justify-content-center">
              <MDBCardImage
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                fluid
              />
            </div>
          </div>
        </MDBCardBody>
      </MDBCard>
    </div>
  );
}
