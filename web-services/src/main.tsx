import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import BusinessDetailsPage from "./BusinessDetailsPage";
import CookieConsentBanner from "./components/CookieConsentBanner";
import FooterLinksPortal from "./components/FooterLinksPortal";
import LegalInfoPage from "./LegalInfoPage";
import PortfolioDetailPage from "./PortfolioDetailPage";
import { initializeAnalytics } from "./lib/analytics";
import { captureLeadAttribution } from "./lib/leadAttribution";
import { installLeadTracking } from "./lib/leadTracking";
import { installProposalTracking } from "./lib/proposalTracking";
import "./styles/main.css";
import "./styles/polish.css";
import "./styles/cookies.css";
import "./styles/background.css";
import "./styles/experience.css";
import "./styles/mobile-menu-fix.css";
import "./styles/footer-refresh.css";
import "./styles/footer-mobile-polish.css";
import "./styles/marketing-upgrade.css";
import "./styles/premium-site.css";
import "./styles/detail-pages.css";

captureLeadAttribution();
initializeAnalytics();
installLeadTracking();
installProposalTracking();

const proposalMatch = window.location.pathname.match(/^\/pasiulymas\/([a-f0-9]{64})\/?$/i);
const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const isHomePage = normalizedPath === "/";
const projectPaths = new Set([
  "/projects/stilloak-studio",
  "/demo/auto-detailing",
  "/demo/beauty-studio",
  "/demo/home-services"
]);
const isProjectPage = projectPaths.has(normalizedPath);
const isBusinessDetailsPage = normalizedPath === "/web-services-details";
const legalPaths = new Set([
  "/web-services-privacy",
  "/cookie-policy",
  "/web-services-terms",
  "/web-services-refunds"
]);
const isLegalInfoPage = legalPaths.has(normalizedPath);
const ProposalPage = lazy(() => import("./ProposalPage"));
const NotFoundPage = lazy(() => import("./NotFoundPage"));

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Suspense fallback={null}>
      {proposalMatch ? (
        <ProposalPage token={proposalMatch[1]} />
      ) : isHomePage ? (
        <App />
      ) : isProjectPage ? (
        <PortfolioDetailPage path={normalizedPath} />
      ) : isBusinessDetailsPage ? (
        <BusinessDetailsPage />
      ) : isLegalInfoPage ? (
        <LegalInfoPage path={normalizedPath} />
      ) : (
        <NotFoundPage />
      )}
    </Suspense>
    <FooterLinksPortal />
    <CookieConsentBanner />
  </StrictMode>
);
