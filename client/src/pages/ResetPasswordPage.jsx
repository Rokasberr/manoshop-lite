import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Seo from "../components/Seo";
import { useLanguage } from "../context/LanguageContext";
import authService from "../services/authService";

const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const copy = t("auth.passwordRecovery.reset");
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState(token ? "" : copy.missingToken);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError(copy.missingToken);
      return;
    }

    if (formData.password.length < 6) {
      setError(copy.passwordLength);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    try {
      setLoading(true);
      const result = await authService.resetPassword({
        token,
        password: formData.password,
      });
      setMessage(result.message || copy.success);
      setFormData({ password: "", confirmPassword: "" });
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
      <Seo title={copy.title} description={copy.intro} path="/reset-password" robots="noindex,nofollow" />
      <form className="panel space-y-5 p-8" onSubmit={handleSubmit}>
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="mt-5 font-display text-4xl font-bold">{copy.title}</h1>
          <p className="mt-4 text-muted">{copy.intro}</p>
        </div>

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold">{copy.password}</label>
          <input
            className="input-field"
            type="password"
            value={formData.password}
            onChange={(event) => handleChange("password", event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">{copy.confirmPassword}</label>
          <input
            className="input-field"
            type="password"
            value={formData.confirmPassword}
            onChange={(event) => handleChange("confirmPassword", event.target.value)}
          />
        </div>

        <button type="submit" disabled={loading || !token} className="button-primary w-full">
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

export default ResetPasswordPage;
