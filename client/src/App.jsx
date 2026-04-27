import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import AdminPreviewLayout from "./components/admin-dashboard/AdminPreviewLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";
import BillingSuccessPage from "./pages/BillingSuccessPage";
import BillingCancelPage from "./pages/BillingCancelPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminDashboardPreviewPage from "./pages/admin/AdminDashboardPreviewPage";
import ProductManagerPage from "./pages/admin/ProductManagerPage";
import OrdersManagerPage from "./pages/admin/OrdersManagerPage";
import AdminShell from "./components/admin-dashboard/AdminShell";

const App = () => (
  <Routes>
    <Route path="/admin-preview" element={<AdminPreviewLayout />}>
      <Route index element={<AdminDashboardPreviewPage />} />
    </Route>

    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/billing/success" element={<BillingSuccessPage />} />
        <Route path="/billing/cancel" element={<BillingCancelPage />} />
      </Route>

      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<ProductManagerPage />} />
          <Route path="orders" element={<OrdersManagerPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default App;
