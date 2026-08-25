import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsentBanner from "./CookieConsentBanner";
import { useCookieConsent } from "../context/CookieConsentContext";
import { applyTrackingConsent, trackPageView } from "../utils/analytics";

const Layout = () => {
  const location = useLocation();
  const { pathname } = location;
  const { categories } = useCookieConsent();
  const isSavingsStudioWorkspace = pathname === "/members/savings-studio";
  const isBusinessWorkspace = pathname === "/business" || pathname.startsWith("/business/");
  const isWideWorkspace = isSavingsStudioWorkspace || isBusinessWorkspace;
  const mainContainerClassName = isWideWorkspace
    ? "mx-auto w-full max-w-[1800px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:px-10"
    : "mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8";

  useEffect(() => {
    applyTrackingConsent(categories);
  }, [categories]);

  useEffect(() => {
    if (!categories.analytics) {
      return;
    }

    applyTrackingConsent(categories);
    trackPageView(`${location.pathname}${location.search}`);
  }, [categories, location.pathname, location.search]);

  return (
    <div className="app-surface relative min-h-screen overflow-x-hidden">
      <div className="site-backdrop pointer-events-none absolute inset-0 -z-10" />
      <a
        href="#main-content"
        className="sr-only z-[90] rounded-lg bg-[rgb(var(--surface))] px-4 py-3 text-sm font-semibold text-[rgb(var(--text))] shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pereiti prie turinio
      </a>

      <Navbar />

      <main id="main-content" className={mainContainerClassName}>
        <Outlet />
      </main>

      <Footer />
      <CookieConsentBanner />
    </div>
  );
};

export default Layout;
