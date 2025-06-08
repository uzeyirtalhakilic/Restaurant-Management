import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { cart, setCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('http://localhost:3000/menu');
        if (!response.ok) {
          throw new Error('Menü yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Sepet değiştiğinde console'a yazdır
  useEffect(() => {
    console.log('Güncel Sepet:', cart);
  }, [cart]);

  const handleAddToCart = (item) => {
    setCart(prevCart => {
      // Ürün sepette var mı kontrol et
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Ürün varsa quantity'yi 1 artır
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Ürün yoksa yeni ürün ekle
        return [...prevCart, {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        }];
      }
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      
      if (existingItem.quantity > 1) {
        // Miktar 1'den fazlaysa, miktarı 1 azalt
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        // Miktar 1 ise, ürünü sepetten tamamen kaldır
        return prevCart.filter(item => item.id !== itemId);
      }
    });
  };

  // Toplam tutarı hesapla
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Arama filtresi
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Menümüz
        </h1>
        
        {/* Arama Kutusu */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        {/* Sepet Kutusu */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Sepetiniz</h2>
            {cart.length > 0 && (
              <button
                onClick={() => navigate('/order')}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Siparişe Geç
              </button>
            )}
          </div>
          
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Sepetiniz boş</p>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} adet x ₺{Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-blue-600">
                        ₺{Number(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Ürünü Sil"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Toplam Tutar:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₺{Number(totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ₺{Number(item.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Menu; 