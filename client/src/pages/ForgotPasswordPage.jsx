import { useState } from "react";
import { Link } from "react-router-dom";

import Seo from "../components/Seo";
import { useLanguage } from "../context/LanguageContext";
import authService from "../services/authService";

const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const copy = t("auth.passwordRecovery.forgot");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError(copy.required);
      return;
    }

    try {
      setLoading(true);
      const result = await authService.forgotPassword({ email: email.trim() });
      setMessage(result.message || copy.success);
      setEmail("");
    } catch (submitError) {
      const backendMessage = submitError.response?.data?.message;
      const safeBackendMessage =
        submitError.response?.status < 500 && typeof backendMessage === "string" ? backendMessage : "";
      setError(safeBackendMessage || copy.fail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Seo title={copy.title} description={copy.intro} path="/forgot-password" robots="noindex,nofollow" />
      <form className="panel space-y-5 p-8" onSubmit={handleSubmit}>
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="mt-5 font-display text-4xl font-bold">{copy.title}</h1>
          <p className="mt-4 text-muted">{copy.intro}</p>
        </div>

        {message && (
          <div aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            {message}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="forgot-password-email" className="mb-2 block text-sm font-semibold">{copy.email}</label>
          <input
            id="forgot-password-email"
            name="email"
            className="input-field"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="button-primary w-full">
          {loading ? copy.loading : copy.submit}
        </button>

        <p className="text-sm text-muted">
          <Link to="/login" className="font-semibold" style={{ color: "rgb(var(--accent-strong))" }}>
            {copy.backToLogin}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
