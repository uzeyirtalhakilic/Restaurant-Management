import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username === 'ali' && password === '123') {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/');
    } else {
      // Müşteri girişi için backend'e istek at
      try {
        const response = await fetch('http://localhost:3000/customer_login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (!response.ok) throw new Error('Kullanıcı adı veya şifre hatalı!');
        const data = await response.json();
        // Masa bilgisini kaydet
        localStorage.setItem('customerTable', JSON.stringify(data.table));
        navigate('/customer_home');
      } catch (err) {
        setError('Kullanıcı adı veya şifre hatalı!');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h2>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Kullanıcı Adı</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-gray-700">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
        >
          Giriş Yap
        </button>
      </form>
    </div>
  );
};

export default Login; 