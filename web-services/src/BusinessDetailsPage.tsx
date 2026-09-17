import { ArrowLeft, ArrowRight, Check, Mail, Phone } from "lucide-react";
import { useEffect } from "react";
import PublicPageShell from "./components/PublicPageShell";

export default function BusinessDetailsPage() {
  useEffect(() => {
    const title = "Stilloak Web rekvizitai | Stilloak Web";
    const description = "Vieši Stilloak Web paslaugų kontaktiniai ir PVM rekvizitai.";
    const canonicalUrl = "https://web.stilloak-studio.com/web-services-details";
    document.title = title;
    document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", title);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", description);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = canonicalUrl;
  }, []);

  return (
    <PublicPageShell>
      <main className="detail-page business-details-page">
        <section className="section legal-hero">
          <a className="detail-back-link" href="/"><ArrowLeft size={17} /> Grįžti į pradžią</a>
          <span className="detail-eyebrow">STILLOAK WEB · REKVIZITAI</span>
          <h1>Aiški informacija prieš pradedant projektą.</h1>
          <p>Vieši Stilloak Web paslaugų kontaktiniai ir PVM rekvizitai.</p>
        </section>

        <section className="section legal-card-grid">
          <article className="legal-primary-card">
            <span>Paslaugų teikėjas</span>
            <h2>Stilloak Studio</h2>
            <div className="legal-detail-row"><Check size={18} /><div><small>Prekės ženklas</small><strong>Stilloak Studio</strong></div></div>
            <div className="legal-detail-row"><Check size={18} /><div><small>PVM mokėtojo kodas</small><strong>LT100020711618</strong></div></div>
          </article>

          <article className="legal-contact-card">
            <span>Kontaktai</span>
            <a href="mailto:hello@stilloak-studio.com"><Mail size={20} /><div><small>El. paštas</small><strong>hello@stilloak-studio.com</strong></div></a>
            <a href="tel:+37063843445"><Phone size={20} /><div><small>Telefonas</small><strong>+370 638 43445</strong></div></a>
          </article>
        </section>

        <section className="section legal-links-card">
          <div>
            <span>Teisinė informacija</span>
            <h2>Prieš užsakymą susipažinkite su paslaugų informacija.</h2>
          </div>
          <div className="legal-link-list">
            <a href="https://www.stilloak-studio.com/web-services-privacy">Privatumo informacija <ArrowRight size={17} /></a>
            <a href="https://www.stilloak-studio.com/web-services-terms">Paslaugų sąlygos <ArrowRight size={17} /></a>
            <a href="https://www.stilloak-studio.com/web-services-refunds">Atsisakymas ir grąžinimai <ArrowRight size={17} /></a>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
