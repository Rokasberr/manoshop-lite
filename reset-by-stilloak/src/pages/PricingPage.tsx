import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Notice } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const features = ["30/60/90 Day Reset", "Unlimited habits", "Advanced progress", "Smoking and screen-time reduction", "Custom routines", "Morning emails", "Evening check-ins", "Weekly reports", "Future core updates"];

export function PricingPage() {
  const { user } = useAuth(); const navigate = useNavigate(); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const checkout = async () => { if (!user) { navigate("/signup?plan=lifetime"); return; } setLoading(true); setError(""); try { const result = await api<{ url: string }>("/billing/checkout", { method: "POST" }); window.location.assign(result.url); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Checkout is unavailable."); setLoading(false); } };
  return <div className="pricing-page"><header><Logo /><Link to={user ? "/today" : "/"}><ArrowLeft size={16} /> Back</Link></header><main><p className="eyebrow">FOUNDING ACCESS</p><h1>Keep the system.<br />Skip the subscription.</h1><p className="pricing-intro">One payment for the complete RESET core product and future core updates.</p>{error && <Notice tone="error">{error}</Notice>}<section className="checkout-card"><span>LIMITED EARLY ACCESS OFFER</span><h2>Founding Lifetime Access</h2><div className="checkout-price">€19 <small>one-time</small></div><p>No monthly fee. No annual renewal.</p><ul>{features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul><button className="button button-primary button-large" onClick={checkout} disabled={loading || user?.lifetime.active}>{user?.lifetime.active ? "Lifetime access active" : loading ? "Opening secure checkout…" : "Get Lifetime Access"}</button><small className="checkout-secure"><ShieldCheck size={15} /> Secure Stripe Checkout. Access is granted only after payment is confirmed.</small></section><p className="wellness-disclaimer">RESET is a habit and behaviour tracking tool. It is not medical treatment or a substitute for professional support.</p></main></div>;
}

export function UpgradeSuccessPage() {
  const { refresh } = useAuth(); const navigate = useNavigate(); const [state, setState] = useState<"checking"|"active"|"waiting"|"error">("checking");
  useEffect(() => { let attempts = 0; let timer = 0; let active = true; const check = async () => { try { const result = await api<{ lifetime: { active: boolean } }>("/billing/status"); if (!active) return; if (result.lifetime.active) { setState("active"); await refresh(); return; } attempts += 1; if (attempts < 10) timer = window.setTimeout(check, 2000); else setState("waiting"); } catch { if (active) setState("error"); } }; void check(); return () => { active = false; window.clearTimeout(timer); }; }, [refresh]);
  return <div className="success-card-page"><section><div className={`success-orbit ${state}`}><Check /></div><p className="eyebrow">STRIPE RETURNED SECURELY</p><h1>{state === "active" ? "Lifetime access is active." : state === "waiting" ? "Payment is still confirming." : state === "error" ? "We could not check the payment yet." : "Confirming your payment…"}</h1><p>{state === "active" ? "Your 30, 60, and 90 day programs are unlocked." : "Access is granted by the signed Stripe webhook, not by this page. This can take a short moment."}</p>{state === "active" && <button className="button button-primary" onClick={() => navigate("/today")}>Open today's plan</button>}{state !== "active" && <button className="button button-ghost" onClick={() => window.location.reload()}>Check again</button>}</section></div>;
}
