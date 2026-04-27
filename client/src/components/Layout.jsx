import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => (
  <div className="relative min-h-screen overflow-hidden">
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute left-[-6rem] top-20 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: "rgb(var(--accent) / 0.18)" }}
      />
      <div
        className="absolute bottom-16 right-[-5rem] h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: "rgb(var(--accent) / 0.12)" }}
      />
    </div>

    <Navbar />

    <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Outlet />
    </main>

    <Footer />
  </div>
);

export default Layout;
