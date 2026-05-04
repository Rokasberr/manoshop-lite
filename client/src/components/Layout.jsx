import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => (
  <div className="app-surface relative min-h-screen overflow-hidden">
    <div className="site-backdrop pointer-events-none absolute inset-0 -z-10" />

    <Navbar />

    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Outlet />
    </main>

    <Footer />
  </div>
);

export default Layout;
