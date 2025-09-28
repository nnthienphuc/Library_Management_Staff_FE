import React, { useState } from 'react';
import axios from 'axios';
import {
  MDBBtn, MDBCard, MDBCardBody,
  MDBCardImage, MDBInput, MDBIcon
} from 'mdb-react-ui-kit';
import { Link } from 'react-router-dom';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5286/api/admin/auth/reset-password', { email });
      setMessage(res.data.message || "Đã gửi yêu cầu đặt lại mật khẩu! Vui lòng kiểm tra email.");
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
      setMessage('');
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
              <p className="text-center h3 fw-bold mb-4 mt-4">QUÊN MẬT KHẨU</p>
              <form onSubmit={handleSubmit} className="w-100 px-4">
                <div className="d-flex align-items-center mb-4">
                  <MDBIcon fas icon="envelope me-3" size="lg" />
                  <MDBInput
                    label="Email"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-black"
                  />
                </div>

                <MDBBtn type="submit" className="mb-3 w-100" size="lg" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
                </MDBBtn>

                {message && <p className="text-success text-center">{message}</p>}
                {error && <p className="text-danger text-center">{error}</p>}

                <div className="text-center mt-3">
                  <Link to="/login" className="text-primary">Quay lại đăng nhập</Link>
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
