import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentMethod = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const table = location.state?.table;

  const handlePayment = (method) => {
    alert('Bu işlev henüz eklenmemiştir');
    navigate('/payments');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-8 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold"
        style={{ zIndex: 10 }}
      >
        Geri Dön
      </button>
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Ödeme Yöntemi</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4 text-center">{table?.table_name || 'Masa'} için ödeme</h2>
        <button
          onClick={() => handlePayment('Nakit')}
          className="w-full mb-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 text-xl"
        >
          Nakit
        </button>
        <button
          onClick={() => handlePayment('Kredi Kartı')}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-xl"
        >
          Kredi Kartı
        </button>
      </div>
    </div>
  );
};

export default PaymentMethod; 