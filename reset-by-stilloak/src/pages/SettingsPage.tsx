import { Download, ExternalLink, LockKeyhole, LogOut, Save, ShieldCheck, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Notice, PageHeader } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { User } from "../types";

export function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  if (!user) return null;
  const premium = user.lifetime.active || user.role === "admin";

  const saveEmails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const values = new FormData(event.currentTarget);
    try {
      const result = await api<{ user: User }>("/settings/email", {
        method: "PATCH",
        body: {
          morningEnabled: values.get("morningEnabled") === "on",
          morningTime: values.get("morningTime"),
          eveningEnabled: values.get("eveningEnabled") === "on",
          eveningTime: values.get("eveningTime"),
          weeklyEnabled: values.get("weeklyEnabled") === "on"
        }
      });
      setUser(result.user);
      setMessage("Email preferences saved.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save settings.");
    }
  };

  const saveTargets = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api<{ user: User }>("/settings/targets", { method: "PATCH", body: values });
      setUser(result.user);
      setMessage("Targets saved.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save targets.");
    }
  };

  const deleteAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDeleting(true);
    setDeleteError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("/auth/account", { method: "DELETE", body: values });
      setUser(null);
      navigate("/");
    } catch (requestError) {
      setDeleteError(requestError instanceof Error ? requestError.message : "Could not delete the account.");
      setDeleting(false);
    }
  };

  return (
    <div className="product-page settings-page">
      <PageHeader eyebrow="YOUR RESET" title="Settings" description="Keep the system aligned with your current life." />
      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      <section className="settings-card">
        <header><div><h2>Plan</h2><p>Your current access.</p></div><span className={premium ? "plan-badge lifetime" : "plan-badge"}>{premium ? (user.role === "admin" ? "Admin" : "Founding Lifetime") : "Free"}</span></header>
        {premium ? <p className="settings-note"><ShieldCheck size={18} /> {user.role === "admin" ? "Administrative access includes all product features." : "One-time access is active. There is no recurring subscription."}</p> : <div className="upgrade-strip"><div><strong>Unlock the full reset</strong><span>30/60/90 days, unlimited habits, advanced progress, and emails.</span></div><Link className="button button-primary" to="/pricing">Get Lifetime · €19</Link></div>}
      </section>
      <section className="settings-card">
        <header><div><h2>Daily targets</h2><p>Adjust without restarting your reset.</p></div></header>
        <form onSubmit={saveTargets} className="form-grid">
          {premium ? <><label>Cigarettes target<input name="cigaretteTarget" type="number" min="0" max="200" defaultValue={user.preferences.cigaretteTarget} /></label>
          <label>Screen-time target (min)<input name="screenTargetMinutes" type="number" min="0" max="1440" defaultValue={user.preferences.screenTargetMinutes} /></label></> : null}
          <label>Reading (min)<input name="readingMinutes" type="number" min="0" max="600" defaultValue={user.preferences.readingMinutes} /></label>
          <label>Routine mode<select name="scheduleMode" defaultValue={user.preferences.scheduleMode}><option value="exact">Exact times</option><option value="flexible">Flexible anchors</option></select></label>
          <button className="button button-primary"><Save size={16} /> Save targets</button>
        </form>
      </section>
      <section className="settings-card">
        <header><div><h2>Email rhythm</h2><p>Every optional RESET email can be turned off.</p></div></header>
        {premium ? <form onSubmit={saveEmails} className="email-settings">
          <label><input type="checkbox" name="morningEnabled" defaultChecked={user.emailPreferences.morningEnabled} /><span><strong>Morning Reset Email</strong><small>Your personalized plan for the day.</small></span><input name="morningTime" type="time" defaultValue={user.emailPreferences.morningTime} /></label>
          <label><input type="checkbox" name="eveningEnabled" defaultChecked={user.emailPreferences.eveningEnabled} /><span><strong>Evening check-in</strong><small>A short, neutral end-of-day review.</small></span><input name="eveningTime" type="time" defaultValue={user.emailPreferences.eveningTime} /></label>
          <label><input type="checkbox" name="weeklyEnabled" defaultChecked={user.emailPreferences.weeklyEnabled} /><span><strong>Weekly Reset</strong><small>Patterns, trends, and a calm summary.</small></span></label>
          <button className="button button-primary"><Save size={16} /> Save email settings</button>
        </form> : <div className="upgrade-strip"><div><strong><LockKeyhole size={17} /> Scheduled emails are a Lifetime feature</strong><span>Your choices from onboarding remain saved and can be enabled after upgrading.</span></div><Link className="button button-primary" to="/pricing">Unlock emails</Link></div>}
      </section>
      <section className="settings-card">
        <header><div><h2>Privacy and account</h2><p>Export or permanently remove your RESET data.</p></div></header>
        <div className="settings-links">
          <a href="/api/auth/export" download><Download size={17} /> Export account data</a>
          <Link to="/privacy"><ExternalLink size={17} /> Privacy Policy</Link>
          <Link to="/terms"><ExternalLink size={17} /> Terms of Use</Link>
          <Link to="/cookies"><ExternalLink size={17} /> Cookie Policy</Link>
          <button onClick={async () => { await logout(); navigate("/"); }}><LogOut size={17} /> Log out</button>
          <button className="danger-link" onClick={() => setDeleteOpen(true)}><Trash2 size={17} /> Delete account</button>
        </div>
      </section>
      <Modal open={deleteOpen} title="Delete your RESET account" onClose={() => { if (!deleting) setDeleteOpen(false); }}>
        <form className="delete-account-form" onSubmit={deleteAccount}>
          <p>This permanently deletes your routines, habits, check-ins, craving logs, and email history. This cannot be undone.</p>
          {deleteError && <Notice tone="error">{deleteError}</Notice>}
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <label>Type DELETE MY RESET<input name="confirmation" required pattern="DELETE MY RESET" autoComplete="off" /></label>
          <button className="button button-danger" disabled={deleting}>{deleting ? "Deleting…" : "Permanently delete account"}</button>
        </form>
      </Modal>
    </div>
  );
}
