import { Link } from "react-router-dom";

import MembershipPricingShowcase from "../components/MembershipPricingShowcase";

const HomePage = () => (
  <div className="space-y-8 pb-8">
    <MembershipPricingShowcase />
    <section className="public-section">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <span className="eyebrow">Skaitmeniniai produktai</span>
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">PDF gidai ir Excel šablonai vienoje vietoje</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            PDF gidai, Excel šablonai, planavimo sistemos ir praktiniai įrankiai aiškesniam produktyvumui, finansams ir augimui.
          </p>
        </div>
        <Link to="/digital-products" className="button-primary">
          Atidaryti produktus
        </Link>
      </div>
    </section>
  </div>
);

export default HomePage;
