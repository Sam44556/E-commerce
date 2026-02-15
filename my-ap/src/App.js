import { Routes, Route } from "react-router-dom";
import { Provider } from './context/provider';
import About from "./components/About";
import Account from "./components/acc/Account";
import Home from "./components/home";
import Car from "./components/Cart";
import Product from "./components/Product";
import NotFound from "./components/NotFound";
import Navbar from "./components/navbar";
import SingleProduct from "./components/singleproduct";
import Foot from "./components/footer";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./components/Checkout";
import PaymentSuccess from "./components/PaymentSuccess";
import { Toaster } from "./components/ui/use-toast";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Provider>
        <Navbar />

        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/account" element={<Account />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/product/:id" element={<SingleProduct />} />
          <Route path="/cart" element={<Car />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="mt-auto">
          <Foot />
        </footer>

        <Toaster />
      </Provider>
    </div>
  );
}
