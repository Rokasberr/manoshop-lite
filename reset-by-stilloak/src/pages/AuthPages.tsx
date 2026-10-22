import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Notice } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { User } from "../types";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (user) return <Navigate to={user.onboardingComplete ? "/today" : "/onboarding"} replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api<{ user: User }>(`/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", body: values });
      setUser(result.user);
      const requested = (location.state as { from?: string } | null)?.from;
      navigate(result.user.onboardingComplete ? requested || "/today" : `/onboarding${search.get("plan") === "lifetime" ? "?plan=lifetime" : ""}`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not continue."); }
    finally { setLoading(false); }
  };
  return (
    <div className="auth-page"><div className="auth-visual"><Link to="/" className="back-link"><ArrowLeft size={17} /> Back</Link><Logo /><div><p className="eyebrow">RESET BY STILLOAK</p><h1>{mode === "login" ? "Return to the next useful action." : "Your life does not need a new personality."}</h1><p>{mode === "login" ? "Your plan and progress are waiting." : "It needs a routine you can return to after an imperfect day."}</p></div><blockquote>“Consistency is not never missing. It is returning sooner.”</blockquote></div><main className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><p className="eyebrow">{mode === "login" ? "WELCOME BACK" : "START YOUR RESET"}</p><h2>{mode === "login" ? "Log in" : "Create your account"}</h2><p>{mode === "login" ? "Continue your reset." : "Start free with a 7 Day Reset. No card required."}</p>{error && <Notice tone="error">{error}</Notice>}{mode === "signup" && <label>Name<input name="name" autoComplete="name" minLength={2} maxLength={80} required placeholder="Your name" /></label>}<label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>Password<div className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={10} required placeholder="At least 10 characters" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>{mode === "login" && <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>}<button className="button button-primary button-large" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Log in" : "Start Your Reset"}</button><small>By continuing, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</small><p className="switch-auth">{mode === "login" ? "New to RESET?" : "Already have an account?"} <Link to={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Start free" : "Log in"}</Link></p></form></main></div>
  );
}

export function ForgotPasswordPage() {
  const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(""); const email = String(new FormData(event.currentTarget).get("email") || ""); try { const result = await api<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } }); setMessage(result.message); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not send the email."); } };
  return <SimpleAuthFrame title="Reset your password" text="Enter your account email. The secure link expires in 15 minutes."><form onSubmit={submit}>{error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}<label>Email<input name="email" type="email" required /></label><button className="button button-primary">Send reset link</button></form></SimpleAuthFrame>;
}

export function ResetPasswordPage() {
  const [params] = useSearchParams(); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(""); const password = String(new FormData(event.currentTarget).get("password") || ""); try { const result = await api<{ message: string }>("/auth/reset-password", { method: "POST", body: { token: params.get("token"), password } }); setMessage(result.message); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not reset password."); } };
  return <SimpleAuthFrame title="Choose a new password" text="Use at least 10 characters with uppercase, lowercase, and a number."><form onSubmit={submit}>{error && <Notice tone="error">{error}</Notice>}{message ? <><Notice tone="success">{message}</Notice><Link className="button button-primary" to="/login">Go to login</Link></> : <><label>New password<input name="password" type="password" minLength={10} required /></label><button className="button button-primary">Save new password</button></>}</form></SimpleAuthFrame>;
}

function SimpleAuthFrame({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return <div className="simple-auth"><Logo /><main><p className="eyebrow">ACCOUNT SECURITY</p><h1>{title}</h1><p>{text}</p>{children}<Link className="back-login" to="/login"><ArrowLeft size={16} /> Back to login</Link></main></div>;
}
