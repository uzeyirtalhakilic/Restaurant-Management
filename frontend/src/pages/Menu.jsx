import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

function Menu() {
  const menuCategories = ['Ana Yemek', 'Başlangıç', 'Çorba', 'Salata', 'Tatlı', 'İçecek'];
  
  const { cart, setCart } = useCart();
  const [tableId, setTableId] = useState('');
  const [tables, setTables] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [menu, setMenu] = useState([]);
  const [activeTableCategory, setActiveTableCategory] = useState('');
  const [activeMenuCategory, setActiveMenuCategory] = useState(menuCategories[0]);
  const [tableSelected, setTableSelected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:3000/tables');
        if (!response.ok) throw new Error('Masalar yüklenemedi');
        const data = await response.json();
        setTables(data);
        if (data.length > 0) {
          const firstType = data[0].type || 'Diğer';
          setActiveTableCategory(firstType);
        }
      } catch (err) {
        setError('Masalar yüklenirken bir hata oluştu.');
      }
    };
    fetchTables();
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://localhost:3000/menu_items');
        if (!response.ok) throw new Error('Menü yüklenemedi');
        const data = await response.json();
        const availableItems = data.filter(item => item.is_available);
        setMenu(availableItems);
      } catch (err) {
        setError('Menü yüklenirken bir hata oluştu.');
      }
    };
    fetchMenu();
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
    if (!paymentMethod) {
      setError('Lütfen ödeme yöntemi seçin');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const orderData = {
        table_id: Number(tableId),
        order_items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        total_amount: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        status: 'Hazırlanıyor',
        payment_status: 'Ödenmedi',
        payment_method: paymentMethod,
        notes: orderNote.trim()
      };
      const response = await fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Sipariş gönderilirken bir hata oluştu');
      setCart([]);
      setOrderNote('');
      alert('Siparişiniz başarıyla alındı!');
      navigate('/menu');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Group tables by type
  const groupedTables = tables.reduce((acc, table) => {
    const type = table.type || 'Diğer';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(table);
    return acc;
  }, {});

  const handleTableSelect = (id) => {
    setTableId(id.toString());
    setTableSelected(true);
  };

  const handleQuantityChange = (itemToUpdate, delta) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemToUpdate.id);
      if (!existingItem) return prevCart; // Should not happen if called from cart

      const newQuantity = existingItem.quantity + delta;

      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        return prevCart.filter(cartItem => cartItem.id !== itemToUpdate.id);
      } else {
        // Update quantity
        return prevCart.map(cartItem =>
          cartItem.id === itemToUpdate.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      }
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl flex h-[calc(100vh-2rem)] overflow-hidden border border-gray-200/50">
        {/* Sol Sütun */}
        <div className={`border-r border-gray-200/50 flex flex-col transition-all duration-300 ease-in-out ${tableSelected ? 'w-1/3' : 'w-full'}`}>
          <div className="p-4 border-b border-gray-200/50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {tables.find(t => t.id.toString() === tableId)?.name || 'Masa Seçimi'}
              </h1>
            </div>
            {tableSelected && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTableSelected(false);
                  setTableId('');
                }}
                className="px-3 py-1.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Geri
              </motion.button>
            )}
          </div>

          {/* Masa Seçimi veya Sipariş Detayları */}
          <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
            {!tableSelected && (
              <div className="flex h-full">
                {/* Sol Menü - Masa Türleri */}
                <div className="w-48 border-r border-gray-200/50 bg-white/50 backdrop-blur-sm p-3">
                  <div className="space-y-1">
                    {Object.keys(groupedTables).map((type) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTableCategory(type)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                          ${activeTableCategory === type 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sağ Taraf - Masalar */}
                <div className="flex-1 p-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {activeTableCategory}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {groupedTables[activeTableCategory]?.map(table => (
                      <motion.button
                        key={table.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => handleTableSelect(table.id)}
                        className={`p-4 rounded-xl text-center text-sm font-medium transition-all duration-200 
                          ${tableId === table.id.toString() 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                            : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200/50 shadow-sm'
                          }`}
                      >
                        {table.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tableSelected && (
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                {/* Sipariş Özeti Başlığı ve Temizleme Butonu */}
                <div className="p-4 pb-0 flex-none">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Sepet
                    </h2>
                    {cart.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={clearCart}
                        className="text-gray-400 hover:text-red-500 transition-all duration-200"
                        title="Sepeti Temizle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.166m1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.166m-7.5 0h16.5m-16.5 0L19.5 7.5l-2.67-1.335m-12 0L4.5 7.5l-2.67-1.335M12 2.25L12 2.25m-6 6h12" />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Ürün Listesi (Kaydırılabilir) */}
                <div className="flex-1 overflow-y-auto px-4 min-h-0">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p>Sepetiniz boş.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-200/50"
                        >
                          <div className="flex items-center flex-1">
                            <span className="font-semibold text-gray-800 text-sm mr-2">{item.name}</span>
                          </div>
                          <div className="flex items-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => handleQuantityChange(item, -1)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-lg text-sm transition-all duration-200 hover:bg-indigo-50"
                            >
                              -
                            </motion.button>
                            <span className="text-gray-800 font-medium mx-2 text-sm">{item.quantity}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => handleQuantityChange(item, 1)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-lg text-sm transition-all duration-200 hover:bg-indigo-50"
                            >
                              +
                            </motion.button>
                            <span className="font-bold text-indigo-600 ml-3 text-base">₺{Number(item.price * item.quantity).toFixed(2)}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== item.id))}
                              className="text-red-500 hover:text-red-700 font-bold ml-3 p-1 rounded-lg hover:bg-red-50 transition-all duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Alt Bölüm: Toplam Tutar, Ödeme, Not, Butonlar */}
                <div className="p-4 pt-0 border-t border-gray-200/50 flex-none">
                  <div className="flex justify-between items-center border-t border-gray-200/50 pt-3 mt-3">
                    <span className="text-lg font-bold text-gray-800">Toplam Tutar:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      ₺{Number(totalAmount).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="paymentMethod" className="block text-sm font-semibold text-gray-700 mb-2">
                      Ödeme Yöntemi
                    </label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-3 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm bg-white/80 backdrop-blur-sm"
                    >
                      <option value="">Ödeme yöntemi seçin</option>
                      <option value="Nakit">Nakit</option>
                      <option value="Kredi Kartı">Kredi Kartı</option>
                      <option value="Banka Kartı">Banka Kartı</option>
                      <option value="Mobil Ödeme">Mobil Ödeme</option>
                      <option value="QR ile Ödeme">QR ile Ödeme</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="orderNote" className="block text-sm font-semibold text-gray-700 mb-2">
                      Sipariş Notu
                    </label>
                    <textarea
                      id="orderNote"
                      value={orderNote}
                      onChange={e => setOrderNote(e.target.value)}
                      placeholder="Siparişle ilgili not ekleyin..."
                      rows="2"
                      className="w-full p-3 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm bg-white/80 backdrop-blur-sm"
                    ></textarea>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {error}
                    </motion.div>
                  )}

                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting || cart.length === 0 || !tableId || !paymentMethod}
                      className={`w-full p-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 shadow-md
                        ${isSubmitting || cart.length === 0 || !tableId || !paymentMethod
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg'
                        }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Gönderiliyor...
                        </div>
                      ) : (
                        'Ödeme Al'
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sağ Sütun: Menü ve Kategoriler */}
        {tableSelected && (
          <div className="w-2/3 flex flex-col bg-white/50 backdrop-blur-sm rounded-r-2xl">
            {/* Kategori Sekmeleri */}
            <div className="p-4 border-b border-gray-200/50 flex space-x-2 overflow-x-auto bg-white/80 backdrop-blur-sm shadow-sm">
              {menuCategories.map(category => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveMenuCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm whitespace-nowrap
                    ${activeMenuCategory === category
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/50'
                    }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>

            {/* Menü Öğeleri */}
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
              {menu
                .filter(item => item.category === activeMenuCategory)
                .map(item => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col border border-gray-200/50"
                    onClick={() => {
                      const existingItem = cart.find(cartItem => cartItem.id === item.id);
                      if (existingItem) {
                        setCart(cart.map(cartItem =>
                          cartItem.id === item.id
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem
                        ));
                      } else {
                        setCart([...cart, { ...item, quantity: 1 }]);
                      }
                    }}
                  >
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                    )}
                    <h3 className="font-semibold text-gray-800 text-base mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ₺{Number(item.price).toFixed(2)}
                      </span>
                      {cart.find(cartItem => cartItem.id === item.id)?.quantity > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-md absolute -top-2 -right-2"
                        >
                          {cart.find(cartItem => cartItem.id === item.id)?.quantity}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu; 