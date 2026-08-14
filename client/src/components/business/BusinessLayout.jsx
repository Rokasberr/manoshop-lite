import {
  ArrowLeft,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  CreditCard,
  LayoutDashboard,
  Palette,
  ShoppingBag,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const businessNavItems = [
  {
    label: "Apžvalga",
    to: "/business",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Site Builder",
    to: "/business/site-builder",
    icon: Palette,
  },
  {
    label: "Skaitmeniniai produktai",
    to: "/business/digital-products",
    icon: Boxes,
  },
  {
    label: "Mano produktai",
    to: "/business/my-products",
    icon: ShoppingBag,
  },
  {
    label: "Užsakymai",
    to: "/business/orders",
    icon: CreditCard,
  },
  {
    label: "Pajamos",
    to: "/business/earnings",
    icon: BarChart3,
  },
];

const getActiveModuleLabel = (pathname) => {
  const activeItem = businessNavItems.find((item) =>
    item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)
  );

  return activeItem?.label || "Verslo zona";
};

const getNavLinkClassName = ({ isActive }) =>
  `inline-flex min-h-[3rem] shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--accent-strong))] lg:w-full lg:justify-start ${
    isActive
      ? "bg-[rgb(var(--accent-strong))] text-white shadow-[0_12px_28px_rgba(29,84,67,0.18)]"
      : "text-muted hover:bg-[rgb(var(--surface-soft))] hover:text-[rgb(var(--text))]"
  }`;

const BusinessNavLinks = () =>
  businessNavItems.map((item) => {
    const Icon = item.icon;

    return (
      <NavLink key={item.to} to={item.to} end={item.end} className={getNavLinkClassName}>
        <Icon className="shrink-0" size={17} aria-hidden="true" />
        <span className="whitespace-nowrap">{item.label}</span>
      </NavLink>
    );
  });

const BusinessLayout = () => {
  const { pathname } = useLocation();
  const activeModuleLabel = getActiveModuleLabel(pathname);

  return (
    <div className="business-workspace w-full min-w-0 space-y-6">
      <section className="panel min-w-0 p-5 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="signal-pill inline-flex items-center gap-2">
              <BriefcaseBusiness size={14} aria-hidden="true" />
              Verslo zona
            </span>
            <p className="mt-3 break-words font-display text-3xl font-bold leading-tight sm:text-4xl">
              {activeModuleLabel}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
              Operacinė darbo zona svetainės kūrimui, produktams, užsakymams ir pajamoms.
            </p>
          </div>
          <Link to="/members/savings-studio" className="button-secondary min-h-[3rem] shrink-0 justify-center gap-2">
            <ArrowLeft size={16} aria-hidden="true" />
            Grįžti į nario zoną
          </Link>
        </div>
      </section>

      <div className="lg:hidden">
        <nav
          aria-label="Verslo zonos navigacija"
          className="soft-card flex w-full max-w-full gap-2 overflow-x-auto rounded-lg p-2 pb-3 shadow-[0_18px_50px_rgba(17,31,26,0.08)]"
        >
          <BusinessNavLinks />
        </nav>
      </div>

      <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-7 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-8 2xl:grid-cols-[280px_minmax(0,1fr)] 2xl:gap-10">
        <aside className="hidden min-w-0 lg:block">
          <nav
            aria-label="Verslo zonos navigacija"
            className="soft-card sticky top-28 rounded-lg p-3 shadow-[0_22px_60px_rgba(17,31,26,0.07)]"
          >
            <p className="px-3 py-2 text-xs font-bold uppercase text-muted">Workspace</p>
            <div className="space-y-1">
              <BusinessNavLinks />
            </div>
          </nav>
        </aside>

        <section className="w-full min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default BusinessLayout;
