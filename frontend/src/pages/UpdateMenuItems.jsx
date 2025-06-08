import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = 'https://via.placeholder.com/150x100?text=Yemek';

const UpdateMenuItems = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Menü ürünlerini getir
  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/menu_items');
      setMenuItems(response.data);
    } catch (err) {
      setError('Menü ürünleri yüklenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Form değişikliklerini yönet
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        // Güncelleme işlemi
        await axios.put(`http://localhost:3000/menu_items/${editingId}`, formData);
        setSuccess('Ürün başarıyla güncellendi!');
      } else {
        // Yeni ürün ekleme
        await axios.post('http://localhost:3000/menu_items', formData);
        setSuccess('Yeni ürün başarıyla eklendi!');
      }
      
      // Formu temizle ve listeyi güncelle
      setFormData({ name: '', description: '', price: '', image_url: '' });
      setEditingId(null);
      setIsModalOpen(false);
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu.');
    }
  };

  // Ürün silme
  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      await axios.delete(`http://localhost:3000/menu_items/${id}`);
      setSuccess('Ürün başarıyla silindi!');
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Silme işlemi başarısız oldu.');
    }
  };

  // Düzenleme moduna geç
  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url || ''
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  // Modal'ı kapat
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', image_url: '' });
  };

  // Arama filtresi
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
          title="Geri Dön"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold flex-1">Menü Yönetimi</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          <span>Yeni Ürün Ekle</span>
        </button>
      </div>

      {/* Arama Kutusu */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

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

      {/* Menü Ürünleri Listesi */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMenuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-3 flex flex-col items-center text-center">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-24 object-cover rounded mb-2"
              />
            )}
            <h3 className="text-base font-semibold truncate w-full" title={item.name}>{item.name}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            <p className="text-sm font-bold mt-1">{item.price} TL</p>
            <div className="mt-2 flex justify-center space-x-1">
              <button
                onClick={() => handleEdit(item)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded-full text-sm"
                title="Düzenle"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded-full text-sm"
                title="Sil"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fiyat</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Görsel URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateMenuItems; 