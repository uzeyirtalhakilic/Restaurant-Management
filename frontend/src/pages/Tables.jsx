import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editModal, setEditModal] = useState({ open: false, table: null });
  const [editForm, setEditForm] = useState({ name: '', type: '', description: '', username: '', password: '' });
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', type: '', description: '', username: '', password: '' });
  const navigate = useNavigate();

  const fetchTables = async () => {
    try {
      const response = await fetch('http://localhost:3000/tables');
      if (!response.ok) throw new Error('Masalar yüklenemedi');
      const data = await response.json();
      setTables(data);
    } catch (err) {
      setError('Masalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu masayı silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(`http://localhost:3000/tables/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Masa silinemedi');
      setSuccess('Masa başarıyla silindi!');
      fetchTables();
    } catch (err) {
      setError('Masa silinirken bir hata oluştu.');
    }
  };

  // Güncelle butonuna tıkla
  const handleEditClick = (table) => {
    setEditForm({
      name: table.name,
      type: table.type,
      description: table.description,
      username: table.username || '',
      password: table.password || ''
    });
    setEditModal({ open: true, table });
  };

  // Modal form değişikliği
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Modal form gönderimi
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.table) return;
    try {
      const response = await fetch(`http://localhost:3000/tables/${editModal.table.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error('Masa güncellenemedi');
      setSuccess('Masa başarıyla güncellendi!');
      setEditModal({ open: false, table: null });
      fetchTables();
    } catch (err) {
      setError('Masa güncellenirken bir hata oluştu.');
    }
  };

  // Masa ekleme form değişikliği
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  // Masa ekleme form gönderimi
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      if (!response.ok) throw new Error('Masa eklenemedi');
      setSuccess('Masa başarıyla eklendi!');
      setAddModal(false);
      setAddForm({ name: '', type: '', description: '', username: '', password: '' });
      fetchTables();
    } catch (err) {
      setError('Masa eklenirken bir hata oluştu.');
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Geri
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold shadow"
          >
            + Masa Ekle
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Masalar</h1>
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tables.map(table => (
            <div key={table.id} className="bg-white rounded-lg shadow p-6 flex flex-col relative">
              {/* Silme ve Güncelle Butonları */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleEditClick(table)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full text-sm"
                  title="Masayı Güncelle"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full text-sm"
                  title="Masayı Sil"
                >
                  🗑️
                </button>
              </div>
              <h2 className="text-xl font-semibold mb-2">{table.name}</h2>
              <p className="text-sm text-gray-500 mb-1">Tip: <span className="font-medium text-gray-700">{table.type}</span></p>
              <p className="text-sm text-gray-600">{table.description}</p>
            </div>
          ))}
        </div>
        {/* Güncelle Modalı */}
        {editModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Masayı Güncelle</h2>
                <button onClick={() => setEditModal({ open: false, table: null })} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Masa Adı</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tip</label>
                  <input
                    type="text"
                    name="type"
                    value={editForm.type}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şifre</label>
                  <input
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, table: null })}
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
        {/* Masa Ekle Modalı */}
        {addModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Yeni Masa Ekle</h2>
                <button onClick={() => setAddModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Masa Adı</label>
                  <input
                    type="text"
                    name="name"
                    value={addForm.name}
                    onChange={handleAddFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tip</label>
                  <input
                    type="text"
                    name="type"
                    value={addForm.type}
                    onChange={handleAddFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    name="description"
                    value={addForm.description}
                    onChange={handleAddFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                  <input
                    type="text"
                    name="username"
                    value={addForm.username}
                    onChange={handleAddFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şifre</label>
                  <input
                    type="password"
                    name="password"
                    value={addForm.password}
                    onChange={handleAddFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
};

export default Tables; 