import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import LoadingSpinner from "./components/LoadingSpinner";
import Layout from "./components/Layout";
import AdminPreviewLayout from "./components/admin-dashboard/AdminPreviewLayout";
import AdminShell from "./components/admin-dashboard/AdminShell";
import BusinessLayout from "./components/business/BusinessLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { infoPages } from "./content/infoPages";

const HomePage = lazy(() => import("./pages/HomePage"));
const DigitalProductsPage = lazy(() => import("./pages/DigitalProductsPage"));
const StoryPage = lazy(() => import("./pages/StoryPage"));
const LaunchSoonPage = lazy(() => import("./pages/LaunchSoonPage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const JournalArticlePage = lazy(() => import("./pages/JournalArticlePage"));
const SavingsStudioDemoPage = lazy(() => import("./pages/SavingsStudioDemoPage"));
const MemberAreaPage = lazy(() => import("./pages/MemberAreaPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccessPage"));
const CheckoutCancelPage = lazy(() => import("./pages/CheckoutCancelPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const BillingSuccessPage = lazy(() => import("./pages/BillingSuccessPage"));
const BillingCancelPage = lazy(() => import("./pages/BillingCancelPage"));
const BusinessDashboardPage = lazy(() => import("./pages/BusinessDashboardPage"));
const BusinessOrdersPage = lazy(() => import("./pages/BusinessOrdersPage"));
const BusinessProductsPage = lazy(() => import("./pages/BusinessProductsPage"));
const PublicStorePage = lazy(() => import("./pages/PublicStorePage"));
const SiteBuilderPage = lazy(() => import("./pages/SiteBuilderPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminDashboardPreviewPage = lazy(() => import("./pages/admin/AdminDashboardPreviewPage"));
const ProductManagerPage = lazy(() => import("./pages/admin/ProductManagerPage"));
const OrdersManagerPage = lazy(() => import("./pages/admin/OrdersManagerPage"));
const WebOrdersManagerPage = lazy(() => import("./pages/admin/WebOrdersManagerPage"));
const WebProposalsPage = lazy(() => import("./pages/admin/WebProposalsPage"));
const InstagramGeneratorPage = lazy(() => import("./pages/admin/InstagramGeneratorPage"));
const AdminDigitalProductsPage = lazy(() => import("./pages/admin/AdminDigitalProductsPage"));
const AdminDigitalProductGeneratorPage = lazy(() => import("./pages/admin/AdminDigitalProductGeneratorPage"));
const App = () => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    <Routes>
      <Route path="/admin-preview" element={<AdminPreviewLayout />}>
        <Route index element={<AdminDashboardPreviewPage />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/launch-soon" element={<LaunchSoonPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/journal/:slug" element={<JournalArticlePage />} />
        <Route path="/savings-studio" element={<SavingsStudioDemoPage />} />
        <Route path="/shop" element={<Navigate to="/digital-products" replace />} />
        <Route path="/collection" element={<Navigate to="/digital-products" replace />} />
        <Route path="/collections" element={<Navigate to="/digital-products" replace />} />
        <Route path="/kolekcija" element={<Navigate to="/digital-products" replace />} />
        <Route path="/digital" element={<Navigate to="/digital-products" replace />} />
        <Route path="/digital-products" element={<DigitalProductsPage />} />
        <Route path="/productivity" element={<Navigate to="/digital-products" replace />} />
        <Route path="/produktyvumas" element={<Navigate to="/digital-products" replace />} />
        <Route path="/productivity-studio" element={<Navigate to="/digital-products" replace />} />
        <Route path="/digital/collection" element={<Navigate to="/digital-products" replace />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/stores/:slug" element={<PublicStorePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/programa" element={<Navigate to="/pricing" replace />} />
        <Route path="/secure-checkout" element={<InfoPage page={infoPages.secureCheckout} />} />
        <Route path="/receipt-archive" element={<InfoPage page={infoPages.receiptArchive} />} />
        <Route path="/member-pricing" element={<InfoPage page={infoPages.memberPricing} />} />
        <Route path="/private-support" element={<InfoPage page={infoPages.privateSupport} />} />
        <Route path="/contact" element={<InfoPage page={infoPages.contact} />} />
        <Route path="/shipping" element={<InfoPage page={infoPages.shipping} />} />
        <Route path="/returns" element={<InfoPage page={infoPages.returns} />} />
        <Route path="/privacy" element={<InfoPage page={infoPages.privacy} />} />
        <Route path="/cookie-policy" element={<InfoPage page={infoPages.cookiePolicy} />} />
        <Route path="/digital-download-policy" element={<InfoPage page={infoPages.digitalDownloadPolicy} />} />
        <Route path="/terms" element={<InfoPage page={infoPages.terms} />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/billing/success" element={<BillingSuccessPage />} />
          <Route path="/billing/cancel" element={<BillingCancelPage />} />
        </Route>

        <Route element={<ProtectedRoute requireMembership />}>
          <Route path="/members/savings-studio" element={<MemberAreaPage />} />
        </Route>

        <Route element={<ProtectedRoute requireBusinessPlan />}>
          <Route path="/business" element={<BusinessLayout />}>
            <Route index element={<BusinessDashboardPage />} />
            <Route path="site-builder" element={<SiteBuilderPage />} />
            <Route path="digital-products" element={<BusinessProductsPage />} />
            <Route path="my-products" element={<BusinessProductsPage mode="selected" />} />
            <Route path="my-store" element={<Navigate to="/business/site-builder" replace />} />
            <Route path="orders" element={<BusinessOrdersPage />} />
            <Route path="earnings" element={<BusinessOrdersPage mode="earnings" />} />
            <Route path="settings" element={<Navigate to="/business/site-builder" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<ProductManagerPage />} />
            <Route path="digital-products" element={<AdminDigitalProductsPage />} />
            <Route path="orders" element={<OrdersManagerPage />} />
            <Route path="web-orders" element={<WebOrdersManagerPage />} />
            <Route path="web-proposals" element={<WebProposalsPage />} />
            <Route path="instagram-generator" element={<InstagramGeneratorPage />} />
            <Route path="digital-product-generator" element={<AdminDigitalProductGeneratorPage />} />
          </Route>
          <Route path="/member/digital-product-generator" element={<Navigate to="/admin/digital-product-generator" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </Suspense>
);

export default App;
