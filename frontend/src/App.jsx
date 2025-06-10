import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CustomerCartProvider } from './context/CustomerCartContext';
import Login from './pages/Login';
import Home from './pages/Home';
import CustomerOrder from './pages/CustomerOrder';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const { user } = useAuth();

  return (
    <AuthProvider>
      <CartProvider>
        <CustomerCartProvider>
          <Router>
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
              <Route path="/table/:tableId" element={<CustomerOrder />} />
              
              {/* Admin sayfaları - PrivateRoute ile */}
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </CustomerCartProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
