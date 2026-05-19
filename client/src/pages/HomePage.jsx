import { Link } from "react-router-dom";

import MembershipPricingShowcase from "../components/MembershipPricingShowcase";
import { useLanguage } from "../context/LanguageContext";

const HomePage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 pb-8">
      <MembershipPricingShowcase />
      <section className="public-section">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="eyebrow">{t("home.digitalEyebrow")}</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t("home.digitalTitle")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{t("home.digitalText")}</p>
          </div>
          <Link to="/digital-products" className="button-primary">
            {t("home.digitalButton")}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
