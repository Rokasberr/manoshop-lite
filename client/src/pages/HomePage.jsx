import { Link } from "react-router-dom";

import MembershipPricingShowcase from "../components/MembershipPricingShowcase";

const HomePage = () => (
  <div className="space-y-8 pb-8">
    <MembershipPricingShowcase />
    <section className="public-section">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <span className="eyebrow">Nemokamai visiems</span>
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Produktyvumo resursai be prisijungimo</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Atsisiųsk planuoklius, trackerį ir Excel-compatible CSV šablonus dienai, savaitei, tikslams ir įpročiams susidėlioti.
          </p>
        </div>
        <Link to="/productivity" className="button-primary">
          Atidaryti produktyvumo skiltį
        </Link>
      </div>
    </section>
  </div>
);

export default HomePage;
