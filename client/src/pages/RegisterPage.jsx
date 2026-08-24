import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Seo from "../components/Seo";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import billingService from "../services/billingService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const copy = t("auth.register");
  const selectedPlan = location.state?.selectedPlan || "";
  const purchaseProductId = location.state?.purchaseProductId || "";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError(copy.required);
      return;
    }

    if (formData.password.length < 6 || formData.password.length > 128) {
      setError(copy.passwordLength);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    try {
      setLoading(true);
      setError("");
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (selectedPlan === "basic") {
        await billingService.activateDemoPlan();
        await refreshProfile();
        toast.success(copy.demoSuccess);
        navigate("/members/savings-studio");
        return;
      }

      if (purchaseProductId) {
        toast.success(copy.productSuccess);
        navigate(`/digital-products?product=${encodeURIComponent(purchaseProductId)}`);
        return;
      }

      toast.success(copy.success);
      navigate("/pricing");
    } catch (submitError) {
      setError(submitError.response?.data?.message || copy.fail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Seo title={copy.title} description={copy.intro} path="/register" robots="noindex,nofollow" />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel flex flex-col justify-between p-8">
          <div>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1 className="mt-5 font-display text-4xl font-bold">{copy.title}</h1>
            <p className="mt-4 text-muted">{copy.intro}</p>
          </div>

          <div className="soft-border mt-8 rounded-[24px] border p-5 text-sm text-muted">
            {copy.note}
          </div>
        </div>

        <form className="panel space-y-5 p-8" onSubmit={handleSubmit}>
          <div>
            <h2 className="font-display text-3xl font-bold">{copy.formTitle}</h2>
            <p className="mt-2 text-muted">{copy.formText}</p>
          </div>

          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="register-name" className="mb-2 block text-sm font-semibold">{copy.name}</label>
            <input
              id="register-name"
              name="name"
              className="input-field"
              autoComplete="name"
              minLength={2}
              maxLength={80}
              required
              value={formData.name}
              onChange={(event) => handleChange("name", event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="register-email" className="mb-2 block text-sm font-semibold">{copy.email}</label>
            <input
              id="register-email"
              name="email"
              className="input-field"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
            />
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="register-password" className="mb-2 block text-sm font-semibold">{copy.password}</label>
              <input
                id="register-password"
                name="password"
                className="input-field"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
                value={formData.password}
                onChange={(event) => handleChange("password", event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-semibold">{copy.confirmPassword}</label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                className="input-field"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
                value={formData.confirmPassword}
                onChange={(event) => handleChange("confirmPassword", event.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="button-primary w-full">
            {loading ? copy.loading : copy.submit}
          </button>

          <p className="text-sm text-muted">
            {copy.hasAccount}{" "}
            <Link to="/login" className="font-semibold" style={{ color: "rgb(var(--accent-strong))" }}>
              {copy.signIn}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
