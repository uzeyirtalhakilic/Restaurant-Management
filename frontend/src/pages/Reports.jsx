import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const navigate = useNavigate();
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        const response = await fetch('http://localhost:3000/popular_items');
        if (!response.ok) throw new Error('Popüler ürünler yüklenemedi');
        const data = await response.json();
        setPopularItems(data);
      } catch (err) {
        setError('Popüler ürünler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchPopularItems();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-8 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold"
        style={{ zIndex: 10 }}
      >
        Geri Dön
      </button>
      <h1 className="text-4xl font-bold text-gray-800 mb-6 mt-8">Raporlar</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 mt-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Popüler Ürünler</h2>
        {loading ? (
          <div className="text-center text-gray-500">Yükleniyor...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <table className="min-w-full text-left border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Ürün</th>
                <th className="py-2 px-4 border-b">Açıklama</th>
                <th className="py-2 px-4 border-b">Fiyat</th>
                <th className="py-2 px-4 border-b">Toplam Sipariş</th>
              </tr>
            </thead>
            <tbody>
              {popularItems.map(item => (
                <tr key={item.id}>
                  <td className="py-2 px-4 border-b flex items-center gap-2">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded" />}
                    <span>{item.name}</span>
                  </td>
                  <td className="py-2 px-4 border-b">{item.description}</td>
                  <td className="py-2 px-4 border-b">₺{item.price}</td>
                  <td className="py-2 px-4 border-b font-bold text-blue-700">{item.total_ordered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports; 