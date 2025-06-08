import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import Kitchen from './pages/Kitchen';
import UpdateMenuItems from './pages/UpdateMenuItems';
import Tables from './pages/Tables';
import Staff from './pages/Staff';
import Login from './pages/Login';
import CustomerHome from './pages/CustomerHome';
import CustomerOrder from './pages/CustomerOrder';
import { CartProvider } from './context/CartContext';
import { CustomerCartProvider } from './context/CustomerCartContext';
import Reports from './pages/Reports';
import Payments from './pages/Payments';
import PaymentMethod from './pages/PaymentMethod';

function RequireAuth({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <CartProvider>
      <CustomerCartProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/customer_home" element={<CustomerCartProvider><CustomerHome /></CustomerCartProvider>} />
            <Route path="/customer_order" element={<CustomerCartProvider><CustomerOrder /></CustomerCartProvider>} />
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/menu" element={<RequireAuth><Menu /></RequireAuth>} />
            <Route path="/order" element={<RequireAuth><Order /></RequireAuth>} />
            <Route path="/kitchen" element={<RequireAuth><Kitchen /></RequireAuth>} />
            <Route path="/update_menu_items" element={<RequireAuth><UpdateMenuItems /></RequireAuth>} />
            <Route path="/tables" element={<RequireAuth><Tables /></RequireAuth>} />
            <Route path="/staff" element={<RequireAuth><Staff /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
            <Route path="/payments" element={<RequireAuth><Payments /></RequireAuth>} />
            <Route path="/payment-method" element={<RequireAuth><PaymentMethod /></RequireAuth>} />
          </Routes>
        </Router>
      </CustomerCartProvider>
    </CartProvider>
  );
}

export default App;
