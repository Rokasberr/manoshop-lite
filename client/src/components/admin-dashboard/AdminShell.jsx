import {
  BarChart3,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const adminNavigation = [
  {
    label: "Overview",
    to: "/admin",
    icon: BarChart3,
    end: true,
  },
  {
    label: "Products",
    to: "/admin/products",
    icon: Package,
  },
  {
    label: "Orders",
    to: "/admin/orders",
    icon: ShoppingCart,
  },
];

const previewNavigation = [
  {
    label: "Overview",
    to: "/admin-preview",
    icon: BarChart3,
    end: true,
  },
];

const AdminShell = ({ previewMode = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigation = previewMode ? previewNavigation : adminNavigation;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const renderNavContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-sm">
          SC
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[-0.02em] text-slate-950">Sales Console</p>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">SaaS Dashboard</p>
        </div>
      </div>

      <div className="mt-8 flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "dashboard-nav-link dashboard-nav-link-active" : "dashboard-nav-link"
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="dashboard-sidebar-card mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Admin workspace</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Unified control panel for products, orders, revenue, and customer activity.
        </p>
        <Link to="/" className="dashboard-button-secondary mt-5 w-full justify-center">
          <Store size={16} />
          <span>Open storefront</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="dashboard-shell min-h-screen bg-[#f6f9fc] text-slate-900">
      <header className="dashboard-topbar sticky top-0 z-40">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
            aria-label="Open admin menu"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="relative hidden max-w-xl items-center lg:flex">
              <Search size={18} className="pointer-events-none absolute left-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search products, orders, customers..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm sm:block">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workspace</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {previewMode ? "Preview Mode" : user?.role === "admin" ? "Administrator" : "Member"}
              </p>
            </div>

            <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:block">
              <p className="text-sm font-semibold text-slate-900">{previewMode ? "Guest Preview" : user?.name || "Admin User"}</p>
              <p className="text-xs text-slate-500">{previewMode ? "No login required" : user?.email}</p>
            </div>

            {previewMode ? null : (
              <button type="button" onClick={logout} className="dashboard-button-secondary">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="dashboard-sidebar hidden w-[272px] shrink-0 lg:block">
          <div className="sticky top-[89px] h-[calc(100vh-89px)] px-5 py-6">{renderNavContent()}</div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close admin menu overlay"
          />
          <aside className="absolute inset-y-0 left-0 w-[292px] bg-white px-5 py-6 shadow-2xl shadow-slate-900/20">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-base font-semibold tracking-[-0.02em] text-slate-950">Navigation</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500"
                aria-label="Close admin menu"
              >
                <X size={18} />
              </button>
            </div>
            {renderNavContent()}
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default AdminShell;
