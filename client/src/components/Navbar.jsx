import { ArrowRight, Moon, ShoppingBag, SunMedium, User2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const publicLinks = [
    { label: "Story", to: "/story" },
    { label: "Collection", to: "/shop" },
    { label: "Digital", to: "/digital" },
    { label: "Savings Studio", to: "/savings-studio" },
    { label: "Membership", to: "/pricing" },
    { label: "Journal", to: "/journal" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="header-shell mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[24px] px-4 py-3 shadow-[0_16px_45px_rgba(15,15,35,0.06)] backdrop-blur-xl">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-strong)))",
            }}
          >
            SS
          </div>
          <div className="min-w-0">
            <p className="font-display text-[1.45rem] font-bold leading-none">Stilloak Studio</p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted">curated living</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`nav-link-public ${
                location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)
                  ? "nav-link-public-active"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`nav-link-public ${
                location.pathname.startsWith("/admin") ? "nav-link-public-active" : ""
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="button-secondary h-10 w-10 rounded-full px-0"
            aria-label="Pakeisti temą"
          >
            {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/cart" className="button-secondary gap-2 px-4">
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: "rgb(var(--accent))" }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to={user.role === "admin" ? "/admin" : "/profile"} className="button-secondary gap-2 px-4">
                <User2 size={18} />
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
              </Link>
              <button type="button" onClick={handleLogout} className="button-secondary px-4">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="button-secondary px-4">
              Sign in
            </Link>
          )}

          <Link to="/pricing" className="button-primary gap-2 px-4">
            <span className="hidden sm:inline">Join the circle</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
