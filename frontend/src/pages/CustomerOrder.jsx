import { useEffect, useState } from 'react';
import { useCustomerCart } from '../context/CustomerCartContext';
import { useNavigate } from 'react-router-dom';

const CustomerOrder = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { cart, addToCart, removeFromCart, clearCart } = useCustomerCart();
  const [success, setSuccess] = useState('');
  // Giriş yapan masanın bilgisi
  const table = JSON.parse(localStorage.getItem('customerTable') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://localhost:3000/menu_items');
        if (!response.ok) throw new Error('Menü yüklenemedi');
        const data = await response.json();
        setMenu(data);
      } catch (err) {
        setError('Menü yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleConfirm = async () => {
    if (!table.id) {
      setError('Masa bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }
    if (cart.length === 0) {
      setError('Sepetiniz boş.');
      return;
    }
    setError('');
    try {
      const response = await fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: table.id,
          order_items: cart.map(item => ({ menu_item_id: item.id, quantity: item.quantity }))
        })
      });
      if (!response.ok) throw new Error('Sipariş gönderilemedi');
      setSuccess('Siparişiniz başarıyla alındı!');
      clearCart();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Sipariş gönderilirken bir hata oluştu.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-2xl text-gray-600">Yükleniyor...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-2xl text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Geri
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sipariş Ver</h1>
        {/* Masa Bilgisi */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Masa</label>
          <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
            {table.name || 'Masa seçilmedi'}
          </div>
        </div>
        {/* Sepet */}
        <div className="mb-8 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Sepet</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Sepetiniz boş</p>
          ) : (
            <>
              <ul className="space-y-2 mb-4">
                {cart.map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span>{item.name} x {item.quantity}</span>
                    <span className="text-blue-600 font-semibold">₺{Number(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                    >
                      Kaldır
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleConfirm}
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
              >
                Siparişi Onayla
              </button>
              {success && <div className="mt-4 text-green-600 text-center font-semibold">{success}</div>}
            </>
          )}
        </div>
        {/* Menü */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menu.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover rounded mb-4" />
              )}
              <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">₺{Number(item.price).toFixed(2)}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Sepete Ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrder; 