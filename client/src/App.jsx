import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import AdminPreviewLayout from "./components/admin-dashboard/AdminPreviewLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import DigitalLandingPage from "./pages/DigitalLandingPage";
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
import InfoPage from "./pages/InfoPage";
import BillingSuccessPage from "./pages/BillingSuccessPage";
import BillingCancelPage from "./pages/BillingCancelPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminDashboardPreviewPage from "./pages/admin/AdminDashboardPreviewPage";
import ProductManagerPage from "./pages/admin/ProductManagerPage";
import OrdersManagerPage from "./pages/admin/OrdersManagerPage";
import AdminShell from "./components/admin-dashboard/AdminShell";
import { infoPages } from "./content/infoPages";

const App = () => (
  <Routes>
    <Route path="/admin-preview" element={<AdminPreviewLayout />}>
      <Route index element={<AdminDashboardPreviewPage />} />
    </Route>

    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/digital" element={<DigitalLandingPage />} />
      <Route path="/digital/collection" element={<ShopPage defaultProductType="digital" />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/secure-checkout" element={<InfoPage page={infoPages.secureCheckout} />} />
      <Route path="/receipt-archive" element={<InfoPage page={infoPages.receiptArchive} />} />
      <Route path="/member-pricing" element={<InfoPage page={infoPages.memberPricing} />} />
      <Route path="/private-support" element={<InfoPage page={infoPages.privateSupport} />} />
      <Route path="/shipping" element={<InfoPage page={infoPages.shipping} />} />
      <Route path="/returns" element={<InfoPage page={infoPages.returns} />} />
      <Route path="/privacy" element={<InfoPage page={infoPages.privacy} />} />
      <Route path="/terms" element={<InfoPage page={infoPages.terms} />} />

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
