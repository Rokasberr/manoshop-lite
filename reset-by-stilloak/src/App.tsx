import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminRoute, ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { AuthProvider } from "./context/AuthContext";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage, ForgotPasswordPage, ResetPasswordPage } from "./pages/AuthPages";
import { HabitsPage } from "./pages/HabitsPage";
import { LandingPage } from "./pages/LandingPage";
import { LearnPage } from "./pages/LearnPage";
import { LegalPage } from "./pages/LegalPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PricingPage, UpgradeSuccessPage } from "./pages/PricingPage";
import { ProgramPage } from "./pages/ProgramPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TodayPage } from "./pages/TodayPage";

export default function App() {
  return <BrowserRouter><AuthProvider><Routes><Route path="/" element={<LandingPage />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/signup" element={<AuthPage mode="signup" />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} /><Route path="/reset-password" element={<ResetPasswordPage />} /><Route path="/pricing" element={<PricingPage />} /><Route path="/privacy" element={<LegalPage type="privacy" />} /><Route path="/terms" element={<LegalPage type="terms" />} /><Route path="/cookies" element={<LegalPage type="cookies" />} /><Route element={<ProtectedRoute />}><Route path="/onboarding" element={<OnboardingPage />} /><Route element={<AppShell />}><Route path="/today" element={<TodayPage />} /><Route path="/habits" element={<HabitsPage />} /><Route path="/program" element={<ProgramPage />} /><Route path="/progress" element={<ProgressPage />} /><Route path="/learn" element={<LearnPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="/upgrade/success" element={<UpgradeSuccessPage />} /><Route element={<AdminRoute />}><Route path="/admin" element={<AdminPage />} /></Route></Route></Route><Route path="*" element={<NotFoundPage />} /></Routes></AuthProvider></BrowserRouter>;
}
