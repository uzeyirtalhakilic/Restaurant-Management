import { useNavigate } from 'react-router-dom';

const CustomerHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="absolute top-6 right-8">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 font-semibold"
        >
          Çıkış Yap
        </button>
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Hoşgeldiniz, müşteri!</h1>
      <button
        onClick={() => navigate('/customer_order')}
        className="mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200"
      >
        Sipariş Ver
      </button>
    </div>
  );
};

export default CustomerHome; 