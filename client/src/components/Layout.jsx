import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsentBanner from "./CookieConsentBanner";

const Layout = () => (
  <div className="app-surface relative min-h-screen overflow-hidden">
    <div className="site-backdrop pointer-events-none absolute inset-0 -z-10" />
    <a
      href="#main-content"
      className="sr-only z-[90] rounded-lg bg-[rgb(var(--surface))] px-4 py-3 text-sm font-semibold text-[rgb(var(--text))] shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Pereiti prie turinio
    </a>

    <Navbar />

    <main id="main-content" className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Outlet />
    </main>

    <Footer />
    <CookieConsentBanner />
  </div>
);

export default Layout;
