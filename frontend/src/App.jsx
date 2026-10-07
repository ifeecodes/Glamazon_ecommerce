
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";
import { useEffect } from "react";

//Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";

//Components
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";



function App() {
  const { user, checkAuth, CheckingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      getCartItems();
    }
  }, [user, getCartItems]);

  if (CheckingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-800 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,#7546E8_0%,#000080_46%,#020817_100%)]" />
        </div>
      </div>

      <div className="relative z-50 pt-20 ">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/signup"
            element={!user ? <SignupPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/secret-dashboard"
            element={user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/category/:category"
            element={<CategoryPage />}
          />
          <Route
            path="/cart"
            element={ user ? <CartPage /> : <Navigate to="/login" /> }
          />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
