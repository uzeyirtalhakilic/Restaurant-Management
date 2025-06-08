import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Order() {
  const { cart, setCart } = useCart();
  const [tableId, setTableId] = useState('');
  const [tables, setTables] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:3000/tables');
        if (!response.ok) throw new Error('Masalar yüklenemedi');
        const data = await response.json();
        setTables(data);
      } catch (err) {
        setError('Masalar yüklenirken bir hata oluştu.');
      }
    };
    fetchTables();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableId) {
      setError('Lütfen bir masa seçin');
      return;
    }
    if (cart.length === 0) {
      setError('Sepetiniz boş');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const orderData = {
        table_id: Number(tableId),
        order_items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        }))
      };
      const response = await fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Sipariş gönderilirken bir hata oluştu');
      setCart([]);
      alert('Siparişiniz başarıyla alındı!');
      navigate('/menu');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Geri Butonu */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Geri
        </button>
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Sipariş Detayları
        </h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Masa Seçimi Dropdown */}
          <div className="mb-6">
            <label htmlFor="tableId" className="block text-sm font-medium text-gray-700 mb-2">
              Masa Seç
            </label>
            <select
              id="tableId"
              value={tableId}
              onChange={e => setTableId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Masa seçiniz</option>
              {tables.map(table => (
                <option key={table.id} value={table.id}>{table.name}</option>
              ))}
            </select>
          </div>
          {/* Sepet Özeti */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sipariş Özeti</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Sepetiniz boş</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} adet x ₺{Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-blue-600">
                      ₺{Number(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Toplam Tutar:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₺{Number(totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Hata Mesajı */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          {/* Gönder Butonu */}
          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white
              ${isSubmitting || cart.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-200`}
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Siparişi Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Order; 