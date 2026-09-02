import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CookieConsentBanner from "./components/CookieConsentBanner";
import FooterLinksPortal from "./components/FooterLinksPortal";
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

captureLeadAttribution();
initializeAnalytics();
installLeadTracking();
installProposalTracking();

const proposalMatch = window.location.pathname.match(/^\/pasiulymas\/([a-f0-9]{64})\/?$/i);
const isHomePage = /^\/?$/.test(window.location.pathname);
const ProposalPage = lazy(() => import("./ProposalPage"));
const NotFoundPage = lazy(() => import("./NotFoundPage"));

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Suspense fallback={null}>
      {proposalMatch ? <ProposalPage token={proposalMatch[1]} /> : isHomePage ? <App /> : <NotFoundPage />}
    </Suspense>
    <FooterLinksPortal />
    <CookieConsentBanner />
  </StrictMode>
);
