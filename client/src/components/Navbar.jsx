import { ArrowRight, Moon, ShoppingBag, SunMedium, User2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const navbarCopy = {
  lt: {
    nav: {
      story: "Story",
      stilloak: "Stilloak",
      membership: "Narystė",
      launchSoon: "Netrukus",
      admin: "Admin",
    },
    tagline: "ramesnis aiškumas",
    bag: "Krepšelis",
    signOut: "Atsijungti",
    signIn: "Prisijungti",
    join: "Atrakinti narystę",
    languageLabel: "Kalba",
    studioLabel: "nario pinigų erdvė",
  },
  en: {
    nav: {
      story: "Story",
      stilloak: "Stilloak",
      membership: "Membership",
      launchSoon: "Launch soon",
      admin: "Admin",
    },
    tagline: "calmer clarity",
    bag: "Bag",
    signOut: "Sign out",
    signIn: "Sign in",
    join: "Unlock membership",
    languageLabel: "Language",
    studioLabel: "member money space",
  },
  pl: {
    nav: {
      story: "Historia",
      stilloak: "Stilloak",
      membership: "Członkostwo",
      launchSoon: "Wkrótce",
      admin: "Admin",
    },
    tagline: "spokojniejsza kontrola",
    bag: "Koszyk",
    signOut: "Wyloguj",
    signIn: "Zaloguj",
    join: "Odblokuj członkostwo",
    languageLabel: "Język",
    studioLabel: "prywatna przestrzeń finansów",
  },
  de: {
    nav: {
      story: "Story",
      stilloak: "Stilloak",
      membership: "Mitgliedschaft",
      launchSoon: "Bald",
      admin: "Admin",
    },
    tagline: "ruhigere klarheit",
    bag: "Warenkorb",
    signOut: "Abmelden",
    signIn: "Anmelden",
    join: "Mitgliedschaft freischalten",
    languageLabel: "Sprache",
    studioLabel: "private geldübersicht",
  },
  fr: {
    nav: {
      story: "Histoire",
      stilloak: "Stilloak",
      membership: "Abonnement",
      launchSoon: "Bientôt",
      admin: "Admin",
    },
    tagline: "une clarté plus calme",
    bag: "Panier",
    signOut: "Déconnexion",
    signIn: "Connexion",
    join: "Débloquer l’abonnement",
    languageLabel: "Langue",
    studioLabel: "espace financier privé",
  },
  es: {
    nav: {
      story: "Historia",
      stilloak: "Stilloak",
      membership: "Membresía",
      launchSoon: "Próximamente",
      admin: "Admin",
    },
    tagline: "claridad más serena",
    bag: "Bolsa",
    signOut: "Salir",
    signIn: "Entrar",
    join: "Desbloquear membresía",
    languageLabel: "Idioma",
    studioLabel: "espacio privado financiero",
  },
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { language, languageOptions, setLanguage } = useLanguage();
  const copy = navbarCopy[language] || navbarCopy.lt;
  const publicLinks = [
    { label: copy.nav.story, to: "/story" },
    { label: copy.nav.stilloak, to: "/savings-studio" },
    { label: copy.nav.membership, to: "/pricing" },
    { label: copy.nav.launchSoon, to: "/launch-soon" },
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
            className="flex h-11 w-11 items-center justify-center rounded-[18px] text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-strong)))",
            }}
          >
            ST
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-[1.45rem] font-bold leading-none">Stilloak Studio</p>
              <span
                className="hidden rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] xl:inline-flex"
                style={{
                  border: "1px solid rgb(var(--line) / 0.85)",
                  backgroundColor: "rgb(255 255 255 / 0.62)",
                  color: "rgb(var(--accent-strong))",
                }}
              >
                {copy.studioLabel}
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted">{copy.tagline}</p>
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
              {copy.nav.admin}
            </Link>
          )}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <label className="sr-only" htmlFor="site-language-switcher">
            {copy.languageLabel}
          </label>
          <select
            id="site-language-switcher"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="button-secondary h-10 rounded-full px-4 text-sm"
            aria-label={copy.languageLabel}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>

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
            <span className="hidden sm:inline">{copy.bag}</span>
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
                {copy.signOut}
              </button>
            </>
          ) : (
            <Link to="/login" className="button-secondary px-4">
              {copy.signIn}
            </Link>
          )}

          <Link to="/pricing" className="button-primary gap-2 px-4">
            <span className="hidden sm:inline">{copy.join}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
