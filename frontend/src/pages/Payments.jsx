import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Payments = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, menuRes] = await Promise.all([
          fetch('http://localhost:3000/orders'),
          fetch('http://localhost:3000/menu_items')
        ]);
        if (!ordersRes.ok || !menuRes.ok) throw new Error('Veriler yüklenemedi');
        const ordersData = await ordersRes.json();
        const menuData = await menuRes.json();
        setOrders(ordersData);
        setMenuItems(menuData);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Menü ürünlerinden fiyat map'i oluştur
  const priceMap = {};
  menuItems.forEach(item => {
    priceMap[item.id] = item.price;
  });

  // Masalara göre grupla
  const tablesMap = {};
  orders.forEach(order => {
    if (!tablesMap[order.table_id]) {
      tablesMap[order.table_id] = {
        table_id: order.table_id,
        table_name: order.table_name,
        orders: []
      };
    }
    tablesMap[order.table_id].orders.push(order);
  });
  const tables = Object.values(tablesMap);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-8 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold"
        style={{ zIndex: 10 }}
      >
        Geri Dön
      </button>
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Ödeme</h1>
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mt-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Masalar</h2>
        {loading ? (
          <div className="text-center text-gray-500">Yükleniyor...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : tables.length === 0 ? (
          <div className="text-center text-gray-500">Hiç sipariş yok.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {tables.map((table, idx) => (
              <div
                key={idx}
                className="bg-blue-50 hover:bg-blue-100 cursor-pointer rounded-lg shadow p-6 flex flex-col items-center transition-colors duration-200"
                onClick={() => setSelectedTable(table)}
              >
                <h3 className="text-xl font-bold text-blue-700 mb-2">{table.table_name}</h3>
                <span className="text-gray-600">{table.orders.length} sipariş</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Masa Detay Modalı */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setSelectedTable(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">{selectedTable.table_name} - Siparişler</h2>
            {selectedTable.orders.map(order => {
              // Sipariş toplamı
              const orderTotal = order.items.reduce((sum, item) => sum + ((priceMap[item.menu_item_id] || 0) * item.quantity), 0);
              return (
                <div key={order.id} className="mb-4 bg-gray-50 rounded p-4">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="font-semibold">Sipariş No: {order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'Ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status === 'Ready' ? 'Hazır' : 'Hazırlanıyor'}</span>
                  </div>
                  <ul className="mb-2">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="text-gray-600">x{item.quantity}</span>
                        <span className="text-gray-800 font-semibold">₺{Number(priceMap[item.menu_item_id] || 0).toFixed(2)}</span>
                        <span className="text-blue-700 font-bold">₺{Number((priceMap[item.menu_item_id] || 0) * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end text-base font-bold text-blue-700 mb-1">Sipariş Toplamı: ₺{orderTotal.toFixed(2)}</div>
                  <div className="text-right text-sm text-gray-500">Oluşturulma: {new Date(order.created_at).toLocaleString('tr-TR')}</div>
                </div>
              );
            })}
            {/* Masanın toplamı */}
            <div className="flex justify-between items-center mt-4 mb-2 text-xl font-bold text-green-700">
              <span>Toplam Tutar:</span>
              <span>
                ₺{
                  selectedTable.orders.reduce((sum, order) =>
                    sum + order.items.reduce((s, item) => s + ((priceMap[item.menu_item_id] || 0) * item.quantity), 0)
                  , 0).toFixed(2)
                }
              </span>
            </div>
            <button
              onClick={() => navigate('/payment-method', { state: { table: selectedTable } })}
              className="mt-2 w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
            >
              Öde
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments; 