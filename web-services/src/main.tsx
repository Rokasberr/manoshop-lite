import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CookieConsentBanner from "./components/CookieConsentBanner";
import "./styles/main.css";
import "./styles/polish.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
    <CookieConsentBanner />
  </StrictMode>
);
