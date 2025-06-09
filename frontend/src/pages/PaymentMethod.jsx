import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerCart } from '../context/CustomerCartContext';

const PaymentMethod = () => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCustomerCart();

  useEffect(() => {
    const data = location.state?.orderData || JSON.parse(localStorage.getItem('pendingOrder'));
    if (!data) {
      navigate('/');
      return;
    }
    setOrderData(data);

    const fetchMenuItems = async () => {
      try {
        const response = await fetch('http://localhost:3000/menu_items');
        if (!response.ok) throw new Error('Menü yüklenemedi');
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        console.error('Menü yüklenirken hata:', err);
      }
    };
    fetchMenuItems();
  }, [location.state, navigate]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Lütfen bir ödeme yöntemi seçin');
      return;
    }

    if (selectedMethod === 'Nakit') {
      setSuccess('Lütfen Kasaya giderek ödemenizi tamamlayınız!');
      setTimeout(() => {
        navigate('/');
      }, 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          payment_method: selectedMethod,
          payment_status: selectedMethod === 'Nakit' ? 'Ödenmedi' : 'Ödendi'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sipariş oluşturulamadı');
      }

      setSuccess('Ödeme başarılı! Siparişiniz alındı.');
      clearCart();
      localStorage.removeItem('pendingOrder');

      setTimeout(() => {
        navigate(`/table/${orderData.table_id}`);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-all duration-200 hover:bg-indigo-50 px-4 py-2 rounded-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Geri
        </button>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="text-center mb-8">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold shadow-md">
              Masa {orderData.table_id}
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-sm">
              <div className="space-y-3">
                {orderData.order_items.map((item, index) => {
                  const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
                  return (
                    <div key={index} className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-800">{menuItem?.name || `Ürün ${index + 1}`}</span>
                        <span className="text-sm text-gray-500">x {item.quantity}</span>
                      </div>
                      <span className="text-indigo-600 font-semibold">₺{Number(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="pt-3 border-t border-gray-200/50 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Toplam Tutar:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      ₺{Number(orderData.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ödeme Yöntemi Seçin</h2>
            <div className="space-y-4">
              <label className={`flex items-center p-4 border border-gray-200/50 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedMethod === 'Kredi Kartı' 
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' 
                  : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Kredi Kartı"
                  checked={selectedMethod === 'Kredi Kartı'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="ml-3 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium">Kredi Kartı</span>
                </div>
              </label>
              <label className={`flex items-center p-4 border border-gray-200/50 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedMethod === 'Nakit' 
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' 
                  : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Nakit"
                  checked={selectedMethod === 'Nakit'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="ml-3 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">Nakit / Kasaya Ödeme</span>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-medium flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-center font-medium flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold shadow-md flex items-center justify-center gap-2 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ödemeyi Tamamla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod; 