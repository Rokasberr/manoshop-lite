import { ArrowLeft, RotateCcw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import SectionTitle from "../components/SectionTitle";

const BillingCancelPage = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="payment canceled"
        title="Mokėjimas atšauktas"
        subtitle="Checkout nebuvo užbaigtas. Gali grįžti į pricing ir pabandyti dar kartą be prarasto progreso."
      />

      <div className="panel mx-auto max-w-3xl p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
          <RotateCcw size={34} />
        </div>
        <h2 className="mt-6 font-display text-4xl font-bold">Prenumerata neaktyvuota</h2>
        <p className="mt-4 text-muted">
          {plan
            ? `Pasirinktas planas buvo: ${plan}.`
            : "Mokėjimo sesija buvo nutraukta prieš aktyvaciją."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/pricing" className="button-primary gap-2">
            <ArrowLeft size={16} />
            Grįžti į pricing
          </Link>
          <Link to="/profile" className="button-secondary">
            Eiti į profilį
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BillingCancelPage;

