import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR');
};

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', hire_date: '', work_hours: '' });
  const [success, setSuccess] = useState('');
  const [editModal, setEditModal] = useState({ open: false, person: null });
  const [editForm, setEditForm] = useState({ name: '', hire_date: '', work_hours: '' });
  const [addStartTime, setAddStartTime] = useState('');
  const [addEndTime, setAddEndTime] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('http://localhost:3000/staff');
        if (!response.ok) throw new Error('Çalışanlar yüklenemedi');
        const data = await response.json();
        setStaff(data);
      } catch (err) {
        setError('Çalışanlar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      if (!response.ok) throw new Error('Çalışan eklenemedi');
      setSuccess('Çalışan başarıyla eklendi!');
      setAddModal(false);
      setAddForm({ name: '', hire_date: '', work_hours: '' });
      setAddStartTime('');
      setAddEndTime('');
      // Yeniden yükle
      setLoading(true);
      const res = await fetch('http://localhost:3000/staff');
      setStaff(await res.json());
      setLoading(false);
    } catch (err) {
      setError('Çalışan eklenirken bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(`http://localhost:3000/staff/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Çalışan silinemedi');
      setSuccess('Çalışan başarıyla silindi!');
      setLoading(true);
      const res = await fetch('http://localhost:3000/staff');
      setStaff(await res.json());
      setLoading(false);
    } catch (err) {
      setError('Çalışan silinirken bir hata oluştu.');
    }
  };

  const openAddModal = () => {
    setAddForm({ name: '', hire_date: '', work_hours: '' });
    setAddStartTime('');
    setAddEndTime('');
    setAddModal(true);
  };

  const handleEditClick = (person) => {
    let start = '', end = '';
    if (person.work_hours && person.work_hours.includes('-')) {
      [start, end] = person.work_hours.split('-');
    }
    setEditForm({ name: person.name, hire_date: person.hire_date.slice(0, 10), work_hours: person.work_hours || '' });
    setEditStartTime(start);
    setEditEndTime(end);
    setEditModal({ open: true, person });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.person) return;
    try {
      const response = await fetch(`http://localhost:3000/staff/${editModal.person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error('Çalışan güncellenemedi');
      setSuccess('Çalışan başarıyla güncellendi!');
      setEditModal({ open: false, person: null });
      setLoading(true);
      const res = await fetch('http://localhost:3000/staff');
      setStaff(await res.json());
      setLoading(false);
    } catch (err) {
      setError('Çalışan güncellenirken bir hata oluştu.');
    }
  };

  const handleAddTimeChange = (type, value) => {
    if (type === 'start') setAddStartTime(value);
    else setAddEndTime(value);
    const start = type === 'start' ? value : addStartTime;
    const end = type === 'end' ? value : addEndTime;
    setAddForm(prev => ({ ...prev, work_hours: start && end ? `${start}-${end}` : '' }));
  };

  const handleEditTimeChange = (type, value) => {
    if (type === 'start') setEditStartTime(value);
    else setEditEndTime(value);
    const start = type === 'start' ? value : editStartTime;
    const end = type === 'end' ? value : editEndTime;
    setEditForm(prev => ({ ...prev, work_hours: start && end ? `${start}-${end}` : '' }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-2xl text-gray-600">Yükleniyor...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-2xl text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Geri
        </button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">Çalışanlar</h1>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold shadow"
          >
            + Çalışan Ekle
          </button>
        </div>
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b text-left">ID</th>
                <th className="py-3 px-4 border-b text-left">İsim</th>
                <th className="py-3 px-4 border-b text-left">İşe Başlama Tarihi</th>
                <th className="py-3 px-4 border-b text-left">Çalışma Saatleri</th>
                <th className="py-3 px-4 border-b text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(person => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{person.id}</td>
                  <td className="py-2 px-4 border-b">{person.name}</td>
                  <td className="py-2 px-4 border-b">{formatDate(person.hire_date)}</td>
                  <td className="py-2 px-4 border-b">{person.work_hours}</td>
                  <td className="py-2 px-4 border-b text-right">
                    <button
                      onClick={() => handleEditClick(person)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mr-2"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Çalışan Ekle Modalı */}
        {addModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Yeni Çalışan Ekle</h2>
                <button onClick={() => setAddModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">İsim</label>
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
                  <label className="block text-sm font-medium text-gray-700">İşe Başlama Tarihi</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={addForm.hire_date}
                    onChange={handleAddFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Çalışma Saatleri</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={addStartTime}
                      onChange={e => handleAddTimeChange('start', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="mt-2">-</span>
                    <input
                      type="time"
                      value={addEndTime}
                      onChange={e => handleAddTimeChange('end', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
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
        {/* Çalışan Düzenle Modalı */}
        {editModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Çalışanı Düzenle</h2>
                <button onClick={() => setEditModal({ open: false, person: null })} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">İsim</label>
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
                  <label className="block text-sm font-medium text-gray-700">İşe Başlama Tarihi</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={editForm.hire_date}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Çalışma Saatleri</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={e => handleEditTimeChange('start', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="mt-2">-</span>
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={e => handleEditTimeChange('end', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, person: null })}
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
};

export default Staff; 