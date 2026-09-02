import { ArrowLeft, Home, Mail } from "lucide-react";
import "./styles/proposal.css";

const NotFoundPage = () => <main className="proposal-shell proposal-centered">
  <section className="proposal-card web-not-found">
    <p className="proposal-eyebrow">404 · Puslapis nerastas</p>
    <h1>Šios nuorodos nėra</h1>
    <p>Nuoroda galėjo pasikeisti arba būti įvesta neteisingai. Grįžkite į Stilloak Web pradžią arba susisiekite.</p>
    <div className="web-not-found-actions"><a className="proposal-primary-button" href="/"><Home size={18} /> Į pradžią</a><button className="proposal-secondary-button" type="button" onClick={() => window.history.back()}><ArrowLeft size={18} /> Grįžti</button><a className="proposal-secondary-button" href="mailto:hello@stilloak-studio.com"><Mail size={18} /> Kontaktai</a></div>
  </section>
</main>;

export default NotFoundPage;
