import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Mail,
  Menu,
  Send,
  ShieldCheck,
  X
} from "lucide-react";
import logoUrl from "./assets/stilloak-logo.svg";
import { faqs, processSteps, services, trustItems } from "./data/siteContent";
import { pricePlans } from "./data/pricing";

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  packageId: string;
  budget: string;
  message: string;
  consent: boolean;
  website: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type LeadResponse = {
  requestNumber?: string;
  message?: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  packageId: "",
  budget: "",
  message: "",
  consent: false,
  website: ""
};

const contactEmail = import.meta.env.VITE_WEB_CONTACT_EMAIL || "hello@stilloak-studio.com";
const apiBaseUrl = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const leadEndpoint =
  import.meta.env.VITE_WEB_LEAD_ENDPOINT || (apiBaseUrl ? `${apiBaseUrl}/web-service-requests` : "");

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const selectedPlan = pricePlans.find((plan) => plan.id === form.packageId);

  if (form.website.trim()) {
    errors.website = "Forma negali būti pateikta.";
  }

  if (form.name.trim().length < 2) {
    errors.name = "Įrašykite vardą.";
  }

  if (!emailPattern.test(form.email.trim())) {
    errors.email = "Įrašykite teisingą el. pašto adresą.";
  }

  if (!selectedPlan) {
    errors.packageId = "Pasirinkite svetainės kūrimo paketą.";
  }

  if (form.packageId === "custom" && !form.budget) {
    errors.budget = "Pasirinkite orientacinį biudžetą.";
  }

  if (form.message.trim().length < 20) {
    errors.message = "Trumpai aprašykite projektą bent keliais sakiniais.";
  }

  if (!form.consent) {
    errors.consent = "Reikalingas sutikimas susisiekti dėl užklausos.";
  }

  return errors;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "fallback" | "error">("idle");
  const [requestNumber, setRequestNumber] = useState("");

  const selectedPlan = useMemo(
    () => pricePlans.find((plan) => plan.id === form.packageId) || null,
    [form.packageId]
  );

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Svetainės kūrimo užklausa");
    const body = encodeURIComponent(
      `Sveiki,\n\nNoriu užsakyti svetainės kūrimą.\n\nPaketas: ${selectedPlan?.name || "-"}\nKaina: ${selectedPlan?.priceLabel || "-"}\nBiudžetas: ${form.budget || "-"}\nĮmonė: ${form.company || "-"}\nTelefonas: ${form.phone || "-"}\n\nProjekto aprašymas:\n${form.message || "-"}`
    );
    return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  }, [form.budget, form.company, form.message, form.phone, selectedPlan]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus("idle");
    setRequestNumber("");
  };

  const choosePlan = (packageId: FormState["packageId"]) => {
    updateForm("packageId", packageId);
    window.setTimeout(() => {
      document.getElementById("kontaktai")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      return;
    }

    if (!leadEndpoint) {
      setStatus("fallback");
      return;
    }

    setStatus("sending");
    setRequestNumber("");

    try {
      const response = await fetch(leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim() || null,
          packageId: form.packageId,
          budget: form.packageId === "custom" ? form.budget : "",
          message: form.message.trim(),
          website: form.website
        })
      });

      const data = (await response.json().catch(() => ({}))) as LeadResponse;

      if (!response.ok) {
        throw new Error(data.message || "Lead endpoint returned an error");
      }

      setRequestNumber(data.requestNumber || "");
      setForm(initialFormState);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const navLinks = [
    ["Paslaugos", "#paslaugos"],
    ["Portfolio", "#portfolio"],
    ["Procesas", "#procesas"],
    ["Kainos", "#kainos"],
    ["DUK", "#duk"],
    ["Užsakymas", "#kontaktai"]
  ];

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Stilloak Web pradžia">
          <img src={logoUrl} alt="" width="44" height="44" />
          <span>
            <strong>Stilloak Web</strong>
            <small>Stilloak Studio paslaugos</small>
          </span>
        </a>

        <button
          className="icon-button mobile-menu-button"
          type="button"
          aria-label={menuOpen ? "Uždaryti navigaciją" : "Atidaryti navigaciją"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        <nav id="primary-navigation" className={menuOpen ? "nav nav-open" : "nav"} aria-label="Pagrindinė navigacija">
          {navLinks.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <a className="nav-cta" href="#kainos" onClick={() => setMenuOpen(false)}>
            Užsisakyti
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero section" aria-labelledby="hero-title">
          <div className="hero-content reveal">
            <p className="eyebrow">Svetainių kūrimas augančiam verslui</p>
            <h1 id="hero-title">Kuriame svetaines, kurios padeda verslui augti.</h1>
            <p className="hero-copy">
              Pasirinkite aiškų paketą su fiksuota pradine kaina arba individualų sprendimą sudėtingesniam projektui.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#kainos">
                Peržiūrėti paketus <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button button-secondary" href="#portfolio">
                Peržiūrėti pavyzdį
              </a>
            </div>
            <div className="trust-row" aria-label="Techniniai svetainės principai">
              {trustItems.map((item) => (
                <span key={item.label}>
                  <item.icon size={17} aria-hidden="true" /> {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-panel reveal" aria-label="Stilloak Web projekto principų santrauka">
            <div className="browser-frame">
              <div className="browser-top" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="browser-body">
                <div className="mock-nav">
                  <img src={logoUrl} alt="" width="32" height="32" />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="mock-hero">
                  <p>Aiški vertė</p>
                  <strong>Vienas procesas nuo pasirinkto paketo iki veikiančios svetainės.</strong>
                </div>
                <div className="mock-grid">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="mock-cta">Aiški kaina ir projekto eiga</div>
              </div>
            </div>
          </div>
        </section>

        <section id="paslaugos" className="section" aria-labelledby="services-title">
          <div className="section-heading">
            <p className="eyebrow">Paslaugos</p>
            <h2 id="services-title">Skaitmeninis pagrindas, pritaikytas realiam verslo etapui.</h2>
            <p>
              Nuo mažos reprezentacinės svetainės iki individualios sistemos. Kiekvienas darbas pradedamas nuo
              aiškaus tikslo ir sutartos apimties.
            </p>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card reveal" key={service.title}>
                <div className="card-icon">
                  <service.icon size={24} aria-hidden="true" />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="portfolio" className="section portfolio-section" aria-labelledby="portfolio-title">
          <div className="portfolio-copy">
            <p className="eyebrow">Portfolio</p>
            <h2 id="portfolio-title">Vidinis projektas: Stilloak Studio.</h2>
            <p>
              Portfolio pradžiai rodome savo vidinį produktą, nes nekuriame netikrų klientų, atsiliepimų ar rezultatų.
              Stilloak Studio yra mūsų ilgalaikis skaitmeninių produktų ir narių zonos projektas.
            </p>
          </div>
          <article className="portfolio-card reveal">
            <img src={logoUrl} alt="Stilloak Studio logotipas" width="72" height="72" />
            <div>
              <p className="eyebrow">Stilloak Studio</p>
              <h3>Produktinė svetainė su narių zona ir skaitmeninio turinio pagrindu.</h3>
              <p>
                Pavyzdys rodo darbo kryptį: aiški prekės ženklo kalba, tvarkinga informacijos architektūra,
                responsive sąsaja ir pasiruošimas atskiriems komerciniams srautams.
              </p>
            </div>
          </article>
        </section>

        <section id="procesas" className="section process-section" aria-labelledby="process-title">
          <div className="section-heading">
            <p className="eyebrow">Procesas</p>
            <h2 id="process-title">Darbas vyksta etapais, kad sprendimai būtų aiškūs ir patikrinami.</h2>
          </div>
          <div className="process-list">
            {processSteps.map((step, index) => (
              <article className="process-step reveal" key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="kainos" className="section" aria-labelledby="pricing-title">
          <div className="section-heading">
            <p className="eyebrow">Kainos</p>
            <h2 id="pricing-title">Pasirinkite svetainės kūrimo paketą.</h2>
            <p>
              Start, Business ir Pro turi aiškią bazinę kainą. Jei projektas nestandartinis, rinkitės „Pagal
              poreikius“ ir paruošime individualią sąmatą.
            </p>
          </div>
          <div className="pricing-grid">
            {pricePlans.map((plan) => (
              <article className={plan.featured ? "price-card price-card-featured reveal" : "price-card reveal"} key={plan.id}>
                {plan.featured ? <span className="badge">Populiariausias</span> : null}
                <h3>{plan.name}</h3>
                <p className="price">{plan.priceLabel}</p>
                <p>{plan.description}</p>
                <ul>
                  {plan.includes.map((item) => (
                    <li key={item}>
                      <Check size={17} aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
                <button className="button button-secondary" type="button" onClick={() => choosePlan(plan.id)}>
                  {plan.id === "custom" ? "Aprašyti poreikius" : `Rinktis ${plan.name}`}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="duk" className="section faq-section" aria-labelledby="faq-title">
          <div className="section-heading">
            <p className="eyebrow">DUK</p>
            <h2 id="faq-title">Dažniausi klausimai prieš užsakymą.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question} className="faq-item">
                <summary>
                  {faq.question}
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="kontaktai" className="section contact-section" aria-labelledby="contact-title">
          <div className="contact-copy">
            <p className="eyebrow">Užsakymas</p>
            <h2 id="contact-title">Pateikite svetainės kūrimo užsakymą.</h2>
            <p>
              Pasirinkite paketą, įveskite kontaktus ir trumpai aprašykite projektą. Užklausa gaus savo numerį ir
              pateks tiesiai į Stilloak administravimo sistemą.
            </p>
            <a className="email-link" href={`mailto:${contactEmail}`}>
              <Mail size={18} aria-hidden="true" /> {contactEmail}
            </a>
          </div>

          <form className="contact-form" onSubmit={submitLead} noValidate>
            <div className="field-grid">
              <label>
                Vardas
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name ? <span className="field-error">{errors.name}</span> : null}
              </label>
              <label>
                El. paštas
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? <span className="field-error">{errors.email}</span> : null}
              </label>
            </div>

            <div className="field-grid">
              <label>
                Telefonas <span className="optional">neprivaloma</span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                />
              </label>
              <label>
                Įmonė <span className="optional">neprivaloma</span>
                <input
                  type="text"
                  name="company"
                  autoComplete="organization"
                  value={form.company}
                  onChange={(event) => updateForm("company", event.target.value)}
                />
              </label>
            </div>

            <div className="field-grid">
              <label>
                Paketas
                <select
                  name="packageId"
                  value={form.packageId}
                  onChange={(event) => updateForm("packageId", event.target.value)}
                  aria-invalid={Boolean(errors.packageId)}
                >
                  <option value="">Pasirinkite</option>
                  {pricePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {plan.priceLabel}
                    </option>
                  ))}
                </select>
                {errors.packageId ? <span className="field-error">{errors.packageId}</span> : null}
              </label>

              {form.packageId === "custom" ? (
                <label>
                  Orientacinis biudžetas
                  <select
                    name="budget"
                    value={form.budget}
                    onChange={(event) => updateForm("budget", event.target.value)}
                    aria-invalid={Boolean(errors.budget)}
                  >
                    <option value="">Pasirinkite</option>
                    <option value="Iki 1 000 €">Iki 1 000 €</option>
                    <option value="1 000-2 500 €">1 000-2 500 €</option>
                    <option value="2 500-5 000 €">2 500-5 000 €</option>
                    <option value="5 000 €+">5 000 €+</option>
                  </select>
                  {errors.budget ? <span className="field-error">{errors.budget}</span> : null}
                </label>
              ) : (
                <label>
                  Bazinė kaina
                  <input type="text" value={selectedPlan?.priceLabel || "Pasirinkite paketą"} readOnly />
                </label>
              )}
            </div>

            <label>
              Projekto aprašymas
              <textarea
                name="message"
                rows={6}
                placeholder="Kuo užsiima jūsų verslas, kokios svetainės reikia ir kokio rezultato tikitės?"
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message ? <span className="field-error">{errors.message}</span> : null}
            </label>

            <label className="honeypot" aria-hidden="true">
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => updateForm("website", event.target.value)}
              />
            </label>

            <label className="consent-field">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={(event) => updateForm("consent", event.target.checked)}
                aria-invalid={Boolean(errors.consent)}
              />
              <span>Sutinku, kad Stilloak Web susisiektų dėl šios užklausos.</span>
            </label>
            {errors.consent ? <span className="field-error">{errors.consent}</span> : null}

            {status === "fallback" ? (
              <div className="form-notice" role="status">
                Užsakymų API dar neprijungtas šioje aplinkoje. Susisiekite el. paštu:
                <a href={mailtoHref}> {contactEmail}</a>
              </div>
            ) : null}
            {status === "sent" ? (
              <div className="form-notice success" role="status">
                Užsakymas gautas{requestNumber ? ` — jūsų užklausos numeris ${requestNumber}.` : "."}
              </div>
            ) : null}
            {status === "error" ? (
              <div className="form-notice error" role="alert">
                Nepavyko išsiųsti užsakymo. Parašykite el. paštu:
                <a href={mailtoHref}> {contactEmail}</a>
              </div>
            ) : null}

            <button className="button button-primary form-submit" type="submit" disabled={status === "sending"}>
              <Send size={18} aria-hidden="true" />
              {status === "sending" ? "Siunčiama..." : "Pateikti užsakymą"}
            </button>
            <p className="privacy-note">
              <ShieldCheck size={16} aria-hidden="true" /> Forma siunčia tik jūsų pateiktus projekto ir kontaktinius
              duomenis. Fiksuoto paketo kaina patvirtinama serverio pusėje.
            </p>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <a className="brand footer-brand" href="#top">
            <img src={logoUrl} alt="" width="40" height="40" />
            <span>
              <strong>Stilloak Web</strong>
              <small>Svetainės, sistemos ir priežiūra.</small>
            </span>
          </a>
          <p>Profesionali Stilloak Studio kryptis interneto svetainių kūrimui ir skaitmeniniams verslo įrankiams.</p>
        </div>
        <div className="footer-links" aria-label="Footer navigacija">
          {navLinks.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>
        <div className="footer-contact">
          <p>Kontaktai</p>
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
