import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { hasActiveMembership, isAdminUser } from "../utils/membership";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const { t } = useLanguage();
  const copy = t("auth.login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (location.state?.from) {
      navigate(location.state.from, { replace: true });
      return;
    }

    if (isAdminUser(user)) {
      navigate("/admin", { replace: true });
      return;
    }

    if (hasActiveMembership(user)) {
      navigate("/members/savings-studio", { replace: true });
      return;
    }

    navigate("/pricing", { replace: true });
  }, [location.state, navigate, user]);

  const handleChange = (field, value) => {
    setFormData((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError(copy.emptyError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success(copy.success);
    } catch (submitError) {
      setError(submitError.response?.data?.message || copy.fail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
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
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">{copy.email}</label>
            <input
              className="input-field"
              type="email"
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">{copy.password}</label>
            <input
              className="input-field"
              type="password"
              value={formData.password}
              onChange={(event) => handleChange("password", event.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="button-primary w-full">
            {loading ? copy.loading : copy.submit}
          </button>

          <p className="text-sm text-muted">
            {copy.newMember}{" "}
            <Link to="/register" className="font-semibold" style={{ color: "rgb(var(--accent-strong))" }}>
              {copy.createAccount}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
