import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import billingService from "../services/billingService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, refreshProfile } = useAuth();
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

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Užpildyk visus laukus.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Slaptažodis turi būti bent 6 simbolių.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Slaptažodžiai nesutampa.");
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
        toast.success("Paskyra sukurta. Demo versija aktyvuota.");
        navigate("/members/savings-studio");
        return;
      }

      if (purchaseProductId) {
        toast.success("Paskyra sukurta. Galite įsigyti pasirinktą produktą.");
        navigate(`/digital-products?product=${encodeURIComponent(purchaseProductId)}`);
        return;
      }

      toast.success("Paskyra sukurta. Pasirink planą.");
      navigate("/pricing");
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Registracija nepavyko.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel flex flex-col justify-between p-8">
          <div>
            <span className="eyebrow">naujas narys</span>
            <h1 className="mt-5 font-display text-4xl font-bold">Sukurk paskyrą ir pradėk ramiau</h1>
            <p className="mt-4 text-muted">
              Po registracijos galėsi pasirinkti Demo versiją arba tęsti į mokamą nario planą.
            </p>
          </div>

          <div className="soft-border mt-8 rounded-[24px] border p-5 text-sm text-muted">
            Paskyroje saugomi užsakymai, sąskaitos ir narystės prieiga nuo pirmo pirkimo.
          </div>
        </div>

        <form className="panel space-y-5 p-8" onSubmit={handleSubmit}>
          <div>
            <h2 className="font-display text-3xl font-bold">Sukurti paskyrą</h2>
            <p className="mt-2 text-muted">Greita pradžia į tavo privačią Stilloak erdvę.</p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">Vardas</label>
            <input
              className="input-field"
              value={formData.name}
              onChange={(event) => handleChange("name", event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">El. paštas</label>
            <input
              className="input-field"
              type="email"
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Slaptažodis</label>
              <input
                className="input-field"
                type="password"
                value={formData.password}
                onChange={(event) => handleChange("password", event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Pakartok slaptažodį</label>
              <input
                className="input-field"
                type="password"
                value={formData.confirmPassword}
                onChange={(event) => handleChange("confirmPassword", event.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="button-primary w-full">
            {loading ? "Kuriama..." : "Sukurti paskyrą"}
          </button>

          <p className="text-sm text-muted">
            Jau turi paskyrą?{" "}
            <Link to="/login" className="font-semibold" style={{ color: "rgb(var(--accent-strong))" }}>
              Prisijungti
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
