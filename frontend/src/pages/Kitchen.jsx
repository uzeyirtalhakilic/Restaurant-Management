import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [success, setSuccess] = useState('');
  const [editModal, setEditModal] = useState({ open: false, order: null });
  const [editForm, setEditForm] = useState({ table_id: '', items: [] });
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [newItem, setNewItem] = useState({ menu_item_id: '', quantity: 1 });
  const [activeTab, setActiveTab] = useState('Preparing'); // 'Preparing' veya 'Ready'
  const [searchTable, setSearchTable] = useState('');
  const navigate = useNavigate();

  // Masaları getir
  const fetchTables = async () => {
    try {
      const response = await axios.get('http://localhost:3000/tables');
      setTables(response.data);
    } catch (err) {
      setError('Masalar yüklenirken bir hata oluştu.');
    }
  };

  // Menü ürünlerini getir (modal açıldığında)
  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/menu_items');
      setMenuItems(response.data);
    } catch (err) {
      setError('Menü ürünleri yüklenirken bir hata oluştu.');
    }
  };

  // Siparişleri çek
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Siparişler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchTables();
    // Her 30 saniyede bir siparişleri güncelle
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sipariş durumunu güncelle
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId); // Yükleme durumunu başlat
      setError(null); // Önceki hataları temizle

      await axios.put(`http://localhost:3000/order/${orderId}/status`, { status: newStatus });
      setSuccess('Sipariş durumu güncellendi!');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Durum güncellenirken bir hata oluştu.');
    } finally {
      setUpdatingOrderId(null); // Yükleme durumunu sonlandır
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) return;

    try {
      await axios.delete(`http://localhost:3000/orders/${orderId}`);
      setSuccess('Sipariş başarıyla silindi!');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Sipariş silinirken bir hata oluştu.');
    }
  };

  // Güncelle butonuna tıklandığında modalı aç
  const handleEditClick = (order) => {
    setEditForm({
      table_id: order.table_id,
      items: order.items.map(item => ({ ...item }))
    });
    setEditModal({ open: true, order });
    fetchMenuItems();
    fetchTables();
  };

  // Modal form değişikliği (masa seçimi)
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Ürün miktarını değiştir
  const handleItemQuantityChange = (idx, value) => {
    setEditForm(prev => {
      const items = [...prev.items];
      items[idx].quantity = Math.max(1, Number(value));
      return { ...prev, items };
    });
  };

  // Ürün çıkar
  const handleRemoveItem = (idx) => {
    setEditForm(prev => {
      const items = prev.items.filter((_, i) => i !== idx);
      return { ...prev, items };
    });
  };

  // Yeni ürün ekle
  const handleAddNewItem = () => {
    if (!newItem.menu_item_id || newItem.quantity < 1) return;
    // Aynı ürün varsa miktarını artır
    setEditForm(prev => {
      const existingIdx = prev.items.findIndex(i => i.menu_item_id === Number(newItem.menu_item_id));
      if (existingIdx !== -1) {
        const items = [...prev.items];
        items[existingIdx].quantity += Number(newItem.quantity);
        return { ...prev, items };
      }
      return {
        ...prev,
        items: [...prev.items, {
          menu_item_id: Number(newItem.menu_item_id),
          name: menuItems.find(m => m.id === Number(newItem.menu_item_id))?.name || '',
          quantity: Number(newItem.quantity)
        }]
      };
    });
    setNewItem({ menu_item_id: '', quantity: 1 });
  };

  // Modal form gönderimi
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.order) return;
    try {
      await axios.put(`http://localhost:3000/orders/${editModal.order.id}`, {
        table_id: Number(editForm.table_id),
        items: editForm.items.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity }))
      });
      setSuccess('Sipariş başarıyla güncellendi!');
      setEditModal({ open: false, order: null });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Sipariş güncellenirken bir hata oluştu.');
    }
  };

  // Siparişleri statü ve masa adı/numarasına göre filtrele
  const filteredOrders = orders
    .filter(order => order.status === activeTab)
    .filter(order =>
      searchTable === '' ||
      (order.table_name && order.table_name.toLowerCase().includes(searchTable.toLowerCase())) ||
      (order.table_id && order.table_id.toString().includes(searchTable))
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
        {/* Sekmeler */}
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors duration-200 ${activeTab === 'Preparing' ? 'bg-white shadow text-blue-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('Preparing')}
          >
            Hazırlanıyor
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors duration-200 ml-2 ${activeTab === 'Ready' ? 'bg-white shadow text-green-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('Ready')}
          >
            Hazır
          </button>
        </div>

        {/* Masa adı/numarasına göre arama kutusu */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Masa adı veya numarası ara..."
            value={searchTable}
            onChange={e => setSearchTable(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Geri Butonu ve Başlık */}
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
          Mutfak Paneli
        </h1>

        {/* Hata ve Başarı Mesajları */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-6 relative"
            >
              {/* Silme ve Güncelle Butonları */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleEditClick(order)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                  title="Siparişi Güncelle"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                  title="Siparişi Sil"
                >
                  🗑️
                </button>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold">{order.table_name}</h3>
                <p className="text-sm text-gray-500">
                  Sipariş No: {order.id}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-gray-600">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === 'Ready' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status === 'Ready' ? 'Hazır' : 'Hazırlanıyor'}
                </span>
                
                <button
                  onClick={() => handleStatusChange(
                    order.id, 
                    order.status === 'Ready' ? 'Preparing' : 'Ready'
                  )}
                  className={`px-4 py-2 rounded-md text-white ${
                    order.status === 'Ready'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {order.status === 'Ready' ? 'Hazırlanıyor' : 'Hazır'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Güncelle Modalı */}
        {editModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Siparişi Güncelle</h2>
                <button onClick={() => setEditModal({ open: false, order: null })} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Masa Seç</label>
                  <select
                    name="table_id"
                    value={editForm.table_id}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Masa seçiniz</option>
                    {tables.map(table => (
                      <option key={table.id} value={table.id}>{table.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sipariş Ürünleri</label>
                  <div className="space-y-2">
                    {editForm.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="flex-1">{item.name}</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemQuantityChange(idx, e.target.value)}
                          className="w-16 px-2 py-1 border rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700"
                          title="Ürünü Çıkar"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={newItem.menu_item_id}
                    onChange={e => setNewItem(prev => ({ ...prev, menu_item_id: e.target.value }))}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Ürün seç</option>
                    {menuItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={e => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-16 px-2 py-1 border rounded"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Ekle
                  </button>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, order: null })}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Kitchen;
  