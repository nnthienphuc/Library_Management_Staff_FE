import React from 'react';

const Homepage = () => {
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 px-4">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Đăng nhập thành công 🎉</h1>
      <div className="bg-white shadow-lg p-6 rounded max-w-xl break-words">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Mã JWT của bạn:</h2>
        <code className="text-sm text-gray-600">{token}</code>
      </div>
    </div>
  );
};

export default Homepage;
