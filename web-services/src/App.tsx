import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Code2,
  Globe2,
  Headphones,
  LayoutDashboard,
  Mail,
  Menu,
  MonitorSmartphone,
  Phone,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X
} from "lucide-react";
import { pricePlans } from "./data/pricing";
import { trackAnalyticsEvent } from "./lib/analytics";
import { getLeadAttribution } from "./lib/leadAttribution";

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
const contactPhone = "+370 638 43445";
const contactPhoneHref = "tel:+37063843445";
const apiBaseUrl = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const leadEndpoint =
  import.meta.env.VITE_WEB_LEAD_ENDPOINT || (apiBaseUrl ? `${apiBaseUrl}/web-service-requests` : "");

const benefits = [
  {
    icon: Rocket,
    title: "Greitas paleidimas",
    text: "Aiški apimtis ir konkretus darbų planas nuo pirmos dienos."
  },
  {
    icon: Sparkles,
    title: "Modernus dizainas",
    text: "Švarus vizualas, pritaikytas jūsų verslui ir auditorijai."
  },
  {
    icon: MonitorSmartphone,
    title: "Pritaikyta telefonui",
    text: "Patogi patirtis telefone, planšetėje ir kompiuteryje."
  },
  {
    icon: Headphones,
    title: "Pagalba po paleidimo",
    text: "Padedame su paleidimu, korekcijomis ir tolimesniais žingsniais."
  }
];

const processSteps = [
  {
    title: "Užklausa",
    text: "Pasirenkate paketą ir trumpai papasakojate, ko reikia jūsų verslui."
  },
  {
    title: "Aptarimas",
    text: "Susisiekiame, patiksliname tikslus, turinį, funkcijas ir terminą."
  },
  {
    title: "Kūrimas",
    text: "Kuriame dizainą ir svetainę, testuojame bei deriname svarbiausias detales."
  },
  {
    title: "Paleidimas",
    text: "Prijungiame domeną, paleidžiame svetainę ir perduodame paruoštą rezultatą."
  }
];

const conceptProjects = [
  {
    className: "concept-architecture",
    kicker: "ARCHITEKTŪRA",
    brand: "NORTH / FORM",
    domain: "northform.lt",
    direction: "Editorial minimal",
    title: "Architektūros studija",
    headline: "Erdvės, kurios tarnauja žmogui.",
    description: "Moderni architektūros studijos svetainė su stipria darbų prezentacija ir aiškiu kontaktiniu keliu.",
    cta: "Peržiūrėti projektus",
    meta: "Šviesi redakcinė kryptis · Daug erdvės · Portfolio centre",
    features: [
      ["Projektai", "Atrinkti darbai"],
      ["Studija", "Požiūris ir komanda"],
      ["Kontaktas", "Aiškus CTA"]
    ]
  },
  {
    className: "concept-industry",
    kicker: "INDUSTRIJA",
    brand: "FERRO / LT",
    domain: "ferro-industries.lt",
    direction: "Dark industrial",
    title: "Pramonės įmonė",
    headline: "Tikslumas, kuriuo galima pasitikėti.",
    description: "Techninis, solidus įvaizdis su paslaugų struktūra, sertifikatų erdve ir užklausos keliu B2B klientui.",
    cta: "Gauti pasiūlymą",
    meta: "Tamsi industrinė kryptis · Techninis tikslumas · B2B autoritetas",
    features: [
      ["Gamyba", "Aiškios kompetencijos"],
      ["Kokybė", "Sertifikatai"],
      ["B2B", "Greita užklausa"]
    ]
  },
  {
    className: "concept-balance",
    kicker: "GROŽIS",
    brand: "ÉLAN / STUDIO",
    domain: "elan-studio.lt",
    direction: "Soft luxury",
    title: "Grožio salonas",
    headline: "Ramybė, estetika ir laikas sau.",
    description: "Premium grožio paslaugų svetainė su lengvu vizualu, paslaugų pristatymu ir rezervacijos akcentu.",
    cta: "Rezervuoti vizitą",
    meta: "Švelni premium kryptis · Emocija · Rezervacijos patirtis",
    features: [
      ["Paslaugos", "Aiškios kategorijos"],
      ["Kainos", "Lengva peržiūra"],
      ["Vizitas", "Rezervacijos CTA"]
    ]
  }
];

const trustSignals = [
  {
    icon: ShieldCheck,
    title: "Saugus ryšys",
    text: "HTTPS ir saugus užklausų perdavimas."
  },
  {
    icon: MonitorSmartphone,
    title: "Responsive dizainas",
    text: "Patogu telefone, planšetėje ir kompiuteryje."
  },
  {
    icon: Sparkles,
    title: "SEO pagrindai",
    text: "Tvarkinga struktūra paieškos sistemoms."
  },
  {
    icon: Globe2,
    title: "Domeno prijungimas",
    text: "Padedame paleisti svetainę jūsų domene."
  },
  {
    icon: Headphones,
    title: "Pagalba po paleidimo",
    text: "Lieka aiškus kontaktas ir tolimesnė pagalba."
  }
];

const clientExperience = [
  {
    icon: LayoutDashboard,
    title: "Visa eiga vienoje vietoje",
    text: "Per privačią nuorodą matysite projekto būseną, terminą ir darbų planą."
  },
  {
    icon: WalletCards,
    title: "Aiškūs mokėjimai",
    text: "Avansas, likutis ir sąskaitos pateikiami aiškiai, be informacijos paieškų laiškuose."
  },
  {
    icon: ShieldCheck,
    title: "Patvirtinimai ir pastabos",
    text: "Prie kiekvieno darbo galėsite pateikti pastabą, prašyti pakeitimo arba patvirtinti rezultatą."
  }
];

const commonQuestions = [
  {
    question: "Ar užklausa mane įpareigoja pirkti?",
    answer: "Ne. Pirmiausia peržiūrime poreikį ir pateikiame aiškų pasiūlymą su darbų apimtimi, terminu ir kaina."
  },
  {
    question: "Kada pradedami darbai?",
    answer: "Darbai pradedami patvirtinus pasiūlymą ir gavus jame numatytą avansą. Tiksli pradžia ir terminas nurodomi pasiūlyme."
  },
  {
    question: "Ar matysiu, kas jau atlikta?",
    answer: "Taip. Po pasiūlymo patvirtinimo privati nuoroda tampa projekto puslapiu, kuriame matoma darbų eiga, mokėjimai ir dokumentai."
  },
  {
    question: "Ar svetainė veiks telefone?",
    answer: "Taip. Mobilus vaizdas, aiški navigacija ir patogūs kontaktų veiksmai yra bazinė kiekvieno projekto dalis."
  }
];

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

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    document.documentElement.classList.add("reveal-enabled");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -5% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("reveal-enabled");
    };
  }, []);

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

    if (status !== "sent") {
      setStatus("idle");
      setRequestNumber("");
    }
  };

  const startNewOrder = () => {
    setForm(initialFormState);
    setErrors({});
    setStatus("idle");
    setRequestNumber("");
    window.setTimeout(() => {
      document.getElementById("kontaktai")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const choosePlan = (packageId: FormState["packageId"]) => {
    if (status === "sent") {
      setStatus("idle");
      setRequestNumber("");
    }

    updateForm("packageId", packageId);
    trackAnalyticsEvent("select_package", { package_id: packageId });
    window.setTimeout(() => {
      document.getElementById("kontaktai")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const trackCta = (location: string, action: string) => {
    trackAnalyticsEvent("cta_click", { location, action });
  };

  const navigateToSection = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    setMenuOpen(false);

    const targetId = href.replace(/^#/, "");
    const target = document.getElementById(targetId);
    if (!target) return;

    window.history.replaceState(null, "", href);
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
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
          website: form.website,
          attribution: getLeadAttribution()
        })
      });

      const data = (await response.json().catch(() => ({}))) as LeadResponse;

      if (!response.ok) {
        throw new Error(data.message || "Lead endpoint returned an error");
      }

      setRequestNumber(data.requestNumber || "");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const navLinks = [
    ["Paslaugos", "#paslaugos"],
    ["Kainos", "#kainos"],
    ["Procesas", "#procesas"],
    ["Pavyzdžiai", "#portfolio"],
    ["Kontaktai", "#kontaktai"]
  ];

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Stilloak Web pradžia" onClick={(event) => navigateToSection(event, "#top")}>
          <strong>Stilloak</strong>
          <span>Web Studio</span>
        </a>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? "Uždaryti navigaciją" : "Atidaryti navigaciją"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={25} aria-hidden="true" /> : <Menu size={27} aria-hidden="true" />}
        </button>

        <nav id="primary-navigation" className={menuOpen ? "nav nav-open" : "nav"} aria-label="Pagrindinė navigacija">
          {navLinks.map(([label, href]) => (
            <a key={href} href={href} onClick={(event) => navigateToSection(event, href)}>
              {label}
            </a>
          ))}
          <a className="nav-cta" href="#kontaktai" onClick={(event) => {
            trackCta("navigation", "get_offer");
            navigateToSection(event, "#kontaktai");
          }}>
            Gauti pasiūlymą <ArrowRight size={17} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero section">
          <div className="hero-copy-block">
            <h1>
              Svetainė, kuri kuria jūsų verslo <em>vertę.</em>
            </h1>
            <p>
              Kuriame individualias verslo svetaines, kuriose strategija, dizainas ir technologija veikia kaip
              viena sistema. Jokių atsitiktinių šablonų – tik jūsų verslui sukurta kryptis.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#kontaktai" onClick={(event) => {
                trackCta("hero", "order_website");
                navigateToSection(event, "#kontaktai");
              }}>
                Aptarti projektą <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button button-secondary" href="#portfolio" onClick={(event) => {
                trackCta("hero", "view_work");
                navigateToSection(event, "#portfolio");
              }}>
                Atrasti mūsų kryptį <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>

            <div className="hero-proof" aria-label="Stilloak Web darbo principai">
              <div className="proof-icons" aria-hidden="true">
                <span><ShieldCheck size={18} /></span>
                <span><Code2 size={18} /></span>
                <span><MonitorSmartphone size={18} /></span>
              </div>
              <div>
                <strong>Individualus dizainas ir aiškus procesas</strong>
                <small>Privati projekto erdvė · Matoma eiga · Pagalba po paleidimo</small>
              </div>
            </div>
          </div>

          <div className="hero-premium-media" aria-label="Stilloak Web Studio premium svetainės kūrimo kryptis">
            <img src="/stilloak-premium-hero.webp" alt="Premium svetainės dizaino pristatymas nešiojamame kompiuteryje" fetchPriority="high" />
            <div className="hero-media-caption">
              <span>01</span>
              <p><strong>Strategija · Dizainas · Technologija</strong><small>Vieninga jūsų verslo skaitmeninė kryptis.</small></p>
            </div>
          </div>
        </section>

        <section id="paslaugos" className="benefits section" aria-label="Stilloak Web privalumai">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.title} data-reveal>
              <span className="benefit-icon">
                <benefit.icon size={24} aria-hidden="true" />
              </span>
              <div>
                <h2>{benefit.title}</h2>
                <p>{benefit.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="kainos" className="section pricing-section" aria-labelledby="pricing-title">
          <div className="section-intro compact-intro" data-reveal>
            <span>Studijos pasiūlymai</span>
            <h2 id="pricing-title">Aiški investicija į jūsų įvaizdį.</h2>
            <p>Pasirinkite projekto apimtį. Kiekvieną kryptį pritaikome jūsų verslui, turiniui ir auditorijai.</p>
          </div>

          <div className="pricing-grid">
            {pricePlans.map((plan) => (
              <article className={plan.featured ? "price-card price-card-featured" : "price-card"} key={plan.id} data-reveal>
                {plan.featured ? <span className="badge">Populiariausias</span> : null}
                <h3>{plan.name}</h3>
                <p className="price">{plan.priceLabel}</p>
                <p className="price-description">{plan.description}</p>
                <ul>
                  {plan.includes.slice(0, 4).map((item) => (
                    <li key={item}>
                      <Check size={17} aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
                <button
                  className={plan.featured ? "button price-button price-button-featured" : "button price-button"}
                  type="button"
                  onClick={() => choosePlan(plan.id)}
                >
                  {plan.id === "custom" ? "Susisiekti" : "Pasirinkti paketą"}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="procesas" className="section process-section" aria-labelledby="process-title">
          <div className="section-intro compact-intro process-intro" data-reveal>
            <span>Procesas</span>
            <h2 id="process-title">Kaip viskas vyksta</h2>
          </div>

          <div className="process-grid">
            {processSteps.map((step, index) => (
              <article className="process-step" key={step.title} data-reveal>
                <div className="step-number">{index + 1}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="kliento-zona" className="section client-experience-section" aria-labelledby="client-experience-title">
          <div className="client-experience-panel" data-reveal>
            <div className="client-experience-copy">
              <span className="section-eyebrow">Skaidrus bendradarbiavimas</span>
              <h2 id="client-experience-title">Projektą valdysite ne per padrikus laiškus.</h2>
              <p>
                Gavę privatų projekto puslapį visada žinosite, kas vyksta dabar, ką reikia patvirtinti ir kokie
                mokėjimai ar dokumentai jau paruošti.
              </p>
              <a className="button button-primary" href="#kontaktai" onClick={(event) => {
                trackCta("client_portal", "start_project");
                navigateToSection(event, "#kontaktai");
              }}>
                Aptarti projektą <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <div className="client-experience-grid">
              {clientExperience.map((item) => (
                <article className="client-experience-card" key={item.title}>
                  <span><item.icon size={21} aria-hidden="true" /></span>
                  <div><h3>{item.title}</h3><p>{item.text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="section concepts-section" aria-labelledby="concepts-title">
          <div className="section-intro compact-intro process-intro" data-reveal>
            <span>Vizualinės kryptys</span>
            <h2 id="concepts-title">Viena studija. Skirtingas charakteris.</h2>
            <p>Kiekvieną svetainę kuriame pagal verslo poziciją ir auditoriją. Žemiau – trys skirtingos koncepcinės kryptys.</p>
          </div>

          <div className="concept-grid">
            {conceptProjects.map((project) => (
              <article className="concept-card" key={project.title} data-reveal>
                <div className="portfolio-browser" aria-label={`${project.title} svetainės koncepcija`}>
                  <div className="portfolio-browser-bar" aria-hidden="true">
                    <div className="portfolio-browser-dots"><i /><i /><i /></div>
                    <div className="portfolio-url">{project.domain}</div>
                    <span />
                  </div>
                  <div className={`portfolio-page ${project.className}`}>
                    <div className="portfolio-page-nav">
                      <strong>{project.brand}</strong>
                      <div className="portfolio-page-links" aria-hidden="true">
                        <span>Apie</span>
                        <span>Paslaugos</span>
                        <span>Kontaktai</span>
                      </div>
                      <b>{project.cta}</b>
                    </div>
                    <div className="portfolio-page-hero">
                      <div className="portfolio-page-copy">
                        <small>{project.kicker}</small>
                        <strong>{project.headline}</strong>
                        <p>{project.description}</p>
                        <span>{project.cta}</span>
                      </div>
                      <div className="portfolio-art" aria-hidden="true" />
                    </div>
                    <div className="portfolio-feature-row" aria-hidden="true">
                      {project.features.map(([title, text]) => (
                        <div className="portfolio-feature" key={title}>
                          <strong>{title}</strong>
                          <small>{text}</small>
                        </div>
                      ))}
                    </div>
                    <div className="portfolio-phone" aria-hidden="true">
                      <div className="portfolio-phone-screen">
                        <i />
                        <strong />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="concept-meta">
                  <span>{project.direction}</span>
                  <h3>{project.title}</h3>
                  <p>{project.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section trust-section" aria-labelledby="trust-title">
          <div className="trust-panel" data-reveal>
            <div className="trust-heading">
              <div>
                <h2 id="trust-title">Svetainė paruošiama ne tik gražiai, bet ir tvarkingai.</h2>
                <p>Pasirūpiname svarbiausiais techniniais ir praktiniais dalykais, kad po paleidimo turėtumėte normaliai veikiančią verslo svetainę.</p>
              </div>
              <span>Stilloak Web standartas</span>
            </div>
            <div className="trust-grid">
              {trustSignals.map((signal) => (
                <article className="trust-item" key={signal.title} data-reveal>
                  <span className="trust-item-icon">
                    <signal.icon size={20} aria-hidden="true" />
                  </span>
                  <strong>{signal.title}</strong>
                  <small>{signal.text}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section faq-section" aria-labelledby="faq-title">
          <div className="section-intro compact-intro" data-reveal>
            <span>Dažniausi klausimai</span>
            <h2 id="faq-title">Aiškūs atsakymai prieš pradedant.</h2>
            <p>Trumpai apie pasiūlymą, darbų pradžią ir projekto valdymą.</p>
          </div>
          <div className="faq-list" data-reveal>
            {commonQuestions.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}<span aria-hidden="true">+</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="kontaktai" className="section contact-panel" aria-labelledby="contact-title">
          <div className="contact-copy" data-reveal>
            <span className="contact-kicker">Pradėkime bendradarbiauti</span>
            <h2 id="contact-title">Papasakokite, ką norite sukurti.</h2>
            <p>
              Peržiūrėsime jūsų situaciją, patikslinsime tikslus ir pasiūlysime tinkamiausią projekto kryptį.
              Pirmoji konsultacija nieko neįpareigoja.
            </p>
            <div className="response-time">
              <Clock3 size={21} aria-hidden="true" />
              <span>Atsakome per 24 val.</span>
            </div>
            <a className="contact-email" href={`mailto:${contactEmail}`} onClick={() => trackCta("contact", "email")}>
              <Mail size={18} aria-hidden="true" /> {contactEmail}
            </a>
            <a className="contact-email" href={contactPhoneHref} onClick={() => trackCta("contact", "phone")}>
              <Phone size={18} aria-hidden="true" /> {contactPhone}
            </a>
          </div>

          <form className="contact-form" onSubmit={submitLead} noValidate data-reveal>
            {selectedPlan ? (
              <div className="selected-plan-summary">
                <div>
                  <span>Pasirinktas paketas</span>
                  <strong>{selectedPlan.name}</strong>
                </div>
                <b>{selectedPlan.priceLabel}</b>
              </div>
            ) : null}

            <div className="field-grid">
              <label>
                <span>Vardas</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Jūsų vardas"
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name ? <small className="field-error">{errors.name}</small> : null}
              </label>
              <label>
                <span>Įmonė</span>
                <input
                  type="text"
                  name="company"
                  autoComplete="organization"
                  placeholder="Įmonės pavadinimas"
                  value={form.company}
                  onChange={(event) => updateForm("company", event.target.value)}
                />
              </label>
            </div>

            <div className="field-grid">
              <label>
                <span>El. paštas</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="jusu@pastas.lt"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? <small className="field-error">{errors.email}</small> : null}
              </label>
              <label>
                <span>Telefonas</span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="+370..."
                  value={form.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                />
              </label>
            </div>

            <div className="field-grid">
              <label>
                <span>Pasirinktas paketas</span>
                <select
                  name="packageId"
                  value={form.packageId}
                  onChange={(event) => updateForm("packageId", event.target.value)}
                  aria-invalid={Boolean(errors.packageId)}
                >
                  <option value="">Pasirinkite paketą</option>
                  {pricePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {plan.priceLabel}
                    </option>
                  ))}
                </select>
                {errors.packageId ? <small className="field-error">{errors.packageId}</small> : null}
              </label>

              {form.packageId === "custom" ? (
                <label>
                  <span>Orientacinis biudžetas</span>
                  <select
                    name="budget"
                    value={form.budget}
                    onChange={(event) => updateForm("budget", event.target.value)}
                    aria-invalid={Boolean(errors.budget)}
                  >
                    <option value="">Pasirinkite biudžetą</option>
                    <option value="Iki 1 000 €">Iki 1 000 €</option>
                    <option value="1 000-2 500 €">1 000-2 500 €</option>
                    <option value="2 500-5 000 €">2 500-5 000 €</option>
                    <option value="5 000 €+">5 000 €+</option>
                  </select>
                  {errors.budget ? <small className="field-error">{errors.budget}</small> : null}
                </label>
              ) : (
                <label>
                  <span>Bazinė kaina</span>
                  <input type="text" value={selectedPlan?.priceLabel || "Pasirinkite paketą"} readOnly />
                </label>
              )}
            </div>

            <label className="message-field">
              <span>Projekto aprašymas</span>
              <textarea
                name="message"
                rows={5}
                placeholder="Trumpai papasakokite apie savo projektą, tikslus ir lūkesčius..."
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message ? <small className="field-error">{errors.message}</small> : null}
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
            {errors.consent ? <small className="field-error consent-error">{errors.consent}</small> : null}

            {status === "fallback" ? (
              <div className="form-notice" role="status">
                Užsakymų API šioje aplinkoje neprijungtas. Parašykite el. paštu:
                <a href={mailtoHref}> {contactEmail}</a>
              </div>
            ) : null}

            {status === "sent" ? (
              <div className="form-notice success" role="status">
                <span>Užsakymas gautas{requestNumber ? ` — jūsų užklausos numeris ${requestNumber}.` : "."}</span>
                <button className="button button-secondary" type="button" onClick={startNewOrder}>
                  Pateikti naują užsakymą
                </button>
              </div>
            ) : null}

            {status === "error" ? (
              <div className="form-notice error" role="alert">
                Nepavyko išsiųsti užsakymo. Parašykite el. paštu:
                <a href={mailtoHref}> {contactEmail}</a>
              </div>
            ) : null}

            <button
              className="button button-primary form-submit"
              type="submit"
              disabled={status === "sending" || status === "sent"}
            >
              <span>{status === "sending" ? "Siunčiama..." : status === "sent" ? "Užsakymas pateiktas" : "Pateikti užsakymą"}</span>
              <Send size={18} aria-hidden="true" />
            </button>

            <p className="form-reassurance">Užklausa nieko nekainuoja ir neįpareigoja pirkti.</p>

            <p className="privacy-note">
              <ShieldCheck size={15} aria-hidden="true" /> Užsakymo informacija siunčiama saugiai ir patenka į Stilloak administravimo sistemą.
            </p>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand-block">
          <a className="wordmark footer-wordmark" href="#top" onClick={(event) => navigateToSection(event, "#top")}>
            <strong>Stilloak</strong>
            <span>Web Studio</span>
          </a>
          <p>Svetainės, kurios padeda verslui atrodyti profesionaliai ir augti.</p>
        </div>
        <div>
          <span className="footer-label">Kontaktai</span>
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          <br />
          <a href={contactPhoneHref}>{contactPhone}</a>
        </div>
        <div>
          <span className="footer-label">Stilloak Studio</span>
          <p>© 2026 Stilloak Studio. Visos teisės saugomos.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
