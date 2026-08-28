import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { initializeAnalytics } from "./lib/analytics";
import { captureLeadAttribution } from "./lib/leadAttribution";
import { installLeadTracking } from "./lib/leadTracking";
import "./styles/main.css";
import "./styles/polish.css";
import "./styles/cookies.css";
import "./styles/background.css";
import "./styles/experience.css";

captureLeadAttribution();
initializeAnalytics();
installLeadTracking();

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
    <CookieConsentBanner />
  </StrictMode>
);
