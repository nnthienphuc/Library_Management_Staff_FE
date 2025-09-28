import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MDBBtn, MDBContainer, MDBCard, MDBCardBody, MDBInput, MDBRadio
} from 'mdb-react-ui-kit';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const LABEL_WIDTH = '150px';
const INPUT_WIDTH = '250px';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    familyName: '',
    givenName: '',
    dateOfBirth: null,
    address: '',
    phone: '',
    email: '',
    citizenIdentification: '',
    gender: 0, // 0: Nam, 1: Nữ
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'gender' ? Number(value) : value,
    });
    setError('');
    setMessage('');
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateOfBirth: date,
    });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // gender = true (Nữ), false (Nam) đúng chuẩn backend
    let sendData = { ...formData };
    sendData.dateOfBirth = formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : '';
    sendData.gender = formData.gender === 1 ? true : false;

    try {
      const res = await axios.post('http://localhost:5286/api/admin/auth/register', sendData);
      setMessage(res.data.message || 'Đăng ký thành công!');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại!');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  // STYLE
  const labelStyle = {
    minWidth: LABEL_WIDTH,
    width: LABEL_WIDTH,
    textAlign: 'left',
    paddingRight: '10px',
    fontWeight: 500,
    color: '#222'
  };

  const inputStyle = {
    width: INPUT_WIDTH,
    maxWidth: INPUT_WIDTH,
    minWidth: '0'
  };

  const rowStyle = {
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  // Group fields theo 2 cột
  const leftFields = [
    {
      label: "Họ:",
      name: "familyName",
      type: "text",
      placeholder: "Nhập họ",
      component: "input"
    },
    {
      label: "Ngày sinh:",
      name: "dateOfBirth",
      type: "date",
      placeholder: "yyyy/mm/dd",
      component: "datepicker"
    },
    {
      label: "Email:",
      name: "email",
      type: "email",
      placeholder: "Nhập email",
      component: "input"
    },
    {
      label: "CCCD/CMND:",
      name: "citizenIdentification",
      type: "text",
      placeholder: "Nhập số CCCD/CMND",
      component: "input"
    },
    {
      label: "Xác nhận mật khẩu:",
      name: "confirmPassword",
      type: "password",
      placeholder: "Nhập lại mật khẩu",
      component: "input"
    }
  ];

  const rightFields = [
    {
      label: "Tên:",
      name: "givenName",
      type: "text",
      placeholder: "Nhập tên",
      component: "input"
    },
    {
      label: "Địa chỉ:",
      name: "address",
      type: "text",
      placeholder: "Nhập địa chỉ",
      component: "input"
    },
    {
      label: "Số điện thoại:",
      name: "phone",
      type: "text",
      placeholder: "Nhập số điện thoại",
      component: "input"
    },
    {
      label: "Mật khẩu:",
      name: "password",
      type: "password",
      placeholder: "Nhập mật khẩu",
      component: "input"
    },
    {
      label: "Giới tính:",
      name: "gender",
      component: "radio"
    }
  ];

  // Thêm vào component RegisterForm, trước return:
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .react-datepicker-wrapper,
      .react-datepicker__input-container,
      .react-datepicker__input-container input {
        width: ${INPUT_WIDTH} !important;
        max-width: ${INPUT_WIDTH} !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <MDBContainer fluid className="my-5 d-flex justify-content-center">
      <MDBCard className="text-black" style={{ borderRadius: '25px', maxWidth: 900, margin: 'auto' }}>
        <MDBCardBody>
          <p className="text-center h1 fw-bold mb-4 mt-2">ĐĂNG KÝ NHÂN VIÊN</p>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              marginBottom: '10px'
            }}>
              {/* Cột trái */}
              <div style={{ flex: 1 }}>
                {leftFields.map((field, idx) => (
                  <div style={rowStyle} key={idx}>
                    <label htmlFor={field.name} style={labelStyle}>{field.label}</label>
                    {field.component === "input" ? (
                      <MDBInput
                        id={field.name}
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required
                        placeholder={field.placeholder}
                        style={inputStyle}
                        className="text-black"
                      />
                    ) : field.component === "datepicker" ? (
                      <DatePicker
                        id={field.name}
                        selected={formData.dateOfBirth}
                        onChange={handleDateChange}
                        dateFormat="yyyy/MM/dd"
                        maxDate={new Date()}
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        placeholderText={field.placeholder}
                        className="form-control text-black"
                        required
                        style={inputStyle}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              {/* Cột phải */}
              <div style={{ flex: 1 }}>
                {rightFields.map((field, idx) => (
                  <div style={rowStyle} key={idx}>
                    <label htmlFor={field.name} style={labelStyle}>{field.label}</label>
                    {field.component === "input" ? (
                      <MDBInput
                        id={field.name}
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required
                        placeholder={field.placeholder}
                        style={inputStyle}
                        className="text-black"
                      />
                    ) : field.component === "radio" ? (
                      <div style={{ display: 'flex', alignItems: 'center', width: INPUT_WIDTH }}>
                        <MDBRadio
                          name="gender"
                          label="Nam"
                          value={0}
                          checked={formData.gender === 0}
                          onChange={handleChange}
                          inline
                          style={{ marginRight: 20 }}
                        />
                        <MDBRadio
                          name="gender"
                          label="Nữ"
                          value={1}
                          checked={formData.gender === 1}
                          onChange={handleChange}
                          inline
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <MDBBtn type="submit" className="mb-2 mt-2" size="lg" disabled={loading}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </MDBBtn>
              {/* Dòng chuyển về đăng nhập */}
              <div className="text-center mt-3">
                <span>Bạn đã có tài khoản? </span>
                <Link to="/login" className="text-primary">Đăng nhập</Link>
              </div>
            </div>
            {error && <p className="text-danger text-center">{error}</p>}
            {message && <p className="text-success text-center">{message}</p>}
          </form>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}
