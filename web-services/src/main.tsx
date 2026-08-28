import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CookieConsentBanner from "./components/CookieConsentBanner";
import ProposalPage from "./ProposalPage";
import { initializeAnalytics } from "./lib/analytics";
import { captureLeadAttribution } from "./lib/leadAttribution";
import { installLeadTracking } from "./lib/leadTracking";
import { installProposalTracking } from "./lib/proposalTracking";
import "./styles/main.css";
import "./styles/polish.css";
import "./styles/cookies.css";
import "./styles/background.css";
import "./styles/experience.css";
import "./styles/proposal.css";
import "./styles/mobile-menu-fix.css";
import "./styles/footer-refresh.css";

captureLeadAttribution();
initializeAnalytics();
installLeadTracking();
installProposalTracking();

const proposalMatch = window.location.pathname.match(/^\/pasiulymas\/([a-f0-9]{64})\/?$/i);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    {proposalMatch ? <ProposalPage token={proposalMatch[1]} /> : <App />}
    <CookieConsentBanner />
  </StrictMode>
);
