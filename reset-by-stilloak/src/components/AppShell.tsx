import { BarChart3, BookOpen, CalendarDays, CircleUserRound, House, LogOut, Settings, ShieldCheck, Sparkles } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

const links = [
  { to: "/today", label: "Today", icon: House },
  { to: "/habits", label: "Habits", icon: Sparkles },
  { to: "/program", label: "Reset", icon: CalendarDays },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/learn", label: "Learn", icon: BookOpen }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const exit = async () => {
    await logout();
    navigate("/");
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <nav aria-label="Product navigation">
          {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon size={19} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          {user?.role === "admin" && <NavLink to="/admin"><ShieldCheck size={19} /><span>Admin</span></NavLink>}
          <NavLink to="/settings"><Settings size={19} /><span>Settings</span></NavLink>
          <button onClick={exit}><LogOut size={19} /><span>Log out</span></button>
          <div className="user-chip"><CircleUserRound size={28} /><span><strong>{user?.name}</strong><small>{user?.lifetime.active ? "Lifetime" : "Free · 7 days"}</small></span></div>
        </div>
      </aside>
      <main className="app-main"><Outlet /></main>
      <nav className="bottom-nav" aria-label="Mobile product navigation">
        {links.slice(0, 5).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon size={20} /><span>{label}</span></NavLink>)}
      </nav>
    </div>
  );
}
