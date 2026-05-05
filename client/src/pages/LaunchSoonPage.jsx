import { ArrowRight, BookOpenText, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
import launchSoonService from "../services/launchSoonService";

const launchCardsBase = [
  {
    key: "digital",
    icon: Download,
    status: "Ruošiama",
    target: "2026 m. gegužė",
  },
  {
    key: "journal",
    icon: BookOpenText,
    status: "Laikoma atidarymui",
    target: "Po skaitmeninės kolekcijos",
  },
];

const launchCopy = {
  lt: {
    focus: {
      default: {
        eyebrow: "Netrukus",
        title: "Skaitmeninė kolekcija ir Journal ruošiami tikslesniam atidarymui.",
        text: "Abi sekcijos laikinai laikomos čia, kad atsidarytų pilnesnės, aiškesnės ir vertos sugrįžimo.",
      },
      digital: {
        eyebrow: "Skaitmeninė kolekcija",
        title: "Skaitmeninė kolekcija ruošiama ramesniam atidarymui.",
        text: "PDF produktai, rinkiniai ir atsisiuntimo patirtis dar ruošiami prieš pilną atidarymą.",
      },
      journal: {
        eyebrow: "Journal",
        title: "Journal ruošiama ramesniam atidarymui.",
        text: "Užrakintas redakcinis sluoksnis tvarkomas taip, kad nario skaitymo patirtis nuo pirmos dienos būtų verta atrakinti.",
      },
    },
    cardsTitle: "Kas ruošiama",
    cardsText:
      "Abi zonos šiuo metu laikomos viename aiškiame laukimo puslapyje, kol patirtis bus paruošta.",
    cards: {
      digital: {
        eyebrow: "Skaitmeninė kolekcija",
        title: "PDF gidai, rinkiniai ir iškart pasiekiami produktai",
        description:
          "Skaitmeninė lentyna dar tvarkoma, kad pirmas atidarymas jaustųsi pilnas, aiškus ir paruoštas pirkimui.",
        bullets: ["Spausdinami plakatų rinkiniai", "PDF gidai ir planavimo įrankiai", "Aiškesnė atidarymo seka ir rinkinių logika"],
      },
      journal: {
        eyebrow: "Journal",
        title: "Ramesnis redakcinis sluoksnis nariams",
        description:
          "Journal laikomas atskirai iki stipresnio paleidimo sluoksnio, kad privatūs tekstai jaustųsi pilnai paruošti.",
        bullets: ["Straipsniai tik nariams", "Aiškesnis redakcinis kalendorius", "Pilnesnė užrakinta skaitymo patirtis"],
      },
    },
    statusLabel: "Statusas",
    targetLabel: "Tikslas",
    notifyButton: "Gauti pranešimą",
    notifyLoading: "Išsaugoma...",
    contactCta: "Susisiekti",
    whileWaitingEyebrow: "Kol lauki",
    whileWaitingTitle: "Gyvas sluoksnis vis dar atidarytas.",
    whileWaitingText:
      "Kol skaitmeninė kolekcija ir Journal dar ruošiami, gali peržiūrėti pagrindinę kolekciją, narystę ir Stilloak programą.",
    browseCollection: "Peržiūrėti kolekciją",
    viewMembership: "Peržiūrėti narystę",
    launchMap: "Paleidimo planas",
    stagingTag: "Ruošiama",
    invalidEmail: "Įvesk tvarkingą el. pašto adresą, kad galėtume išsaugoti tavo susidomėjimą.",
    successDefault: "Susidomėjimas išsaugotas. Parašysime, kai ši sekcija atsidarys.",
    errorDefault: "Nepavyko išsaugoti susidomėjimo. Pabandyk dar kartą kiek vėliau.",
  },
  en: {
    focus: {
      default: {
        eyebrow: "Launch soon",
        title: "Digital Collection and Journal are being prepared for a cleaner launch.",
        text: "Both sections are temporarily held here so they can open in a fuller, clearer, more useful state.",
      },
      digital: {
        eyebrow: "Digital collection",
        title: "The digital collection is being prepared for a cleaner launch.",
        text: "The collection, product framing, and delivery path are being refined before full release.",
      },
      journal: {
        eyebrow: "Journal",
        title: "The Journal is temporarily held in launch-soon mode.",
        text: "The locked editorial layer is being refined so the member reading experience feels worth unlocking from day one.",
      },
    },
    cardsTitle: "What is being prepared",
    cardsText:
      "Both areas currently live on one clear waiting page until the experience is ready.",
    cards: {
      digital: {
        eyebrow: "Digital collection",
        title: "Printable guides and ready-to-use digital tools",
        description:
          "The digital shelf is being refined so the first release feels complete, premium, and ready to buy.",
        bullets: ["Printable art bundles", "PDF guides and planners", "Cleaner launch sequence and bundle logic"],
      },
      journal: {
        eyebrow: "Journal",
        title: "A calmer editorial layer for members",
        description:
          "The Journal is being held back until the launch layer is tighter, so the private reading experience feels more considered from day one.",
        bullets: ["Members-only articles", "Sharper editorial calendar", "A more complete locked reading experience"],
      },
    },
    statusLabel: "Status",
    targetLabel: "Target",
    notifyButton: "Get notified",
    notifyLoading: "Saving interest...",
    contactCta: "Contact the studio",
    whileWaitingEyebrow: "While you wait",
    whileWaitingTitle: "The live layer is still open.",
    whileWaitingText:
      "While Digital Collection and Journal are still being prepared, you can browse the main collection, view membership, and explore Stilloak.",
    browseCollection: "Browse collection",
    viewMembership: "View membership",
    launchMap: "Launch map",
    stagingTag: "In preparation",
    invalidEmail: "Enter a valid email address so we can save your interest.",
    successDefault: "Interest saved. We’ll write when this section opens.",
    errorDefault: "Could not save your interest. Please try again later.",
  },
};

["pl", "de", "fr", "es"].forEach((languageCode) => {
  launchCopy[languageCode] = launchCopy.en;
});

const notifyStorageKey = "stilloak_launch_soon_interest";

const LaunchSoonPage = ({ focus = "default" }) => {
  const { language } = useLanguage();
  const copy = launchCopy[language] || launchCopy.lt;
  const content = copy.focus[focus] || copy.focus.default;
  const [email, setEmail] = useState("");
  const [notifyState, setNotifyState] = useState("idle");
  const [notifyMessage, setNotifyMessage] = useState("");

  const handleNotifySubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      setNotifyState("error");
      setNotifyMessage(copy.invalidEmail);
      return;
    }

    try {
      setNotifyState("loading");
      setNotifyMessage("");

      const response = await launchSoonService.notifyInterest({
        email: normalizedEmail,
        focus,
      });

      localStorage.setItem(
        notifyStorageKey,
        JSON.stringify({
          email: normalizedEmail,
          focus,
          submittedAt: new Date().toISOString(),
        })
      );

      setNotifyState("success");
      setNotifyMessage(response.message || copy.successDefault);
      setEmail("");
    } catch (error) {
      setNotifyState("error");
      setNotifyMessage(error.response?.data?.message || copy.errorDefault);
    }
  };

  return (
    <div className="space-y-10 pb-6">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <span className="hero-chip">{content.eyebrow}</span>
            <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{content.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="button-primary gap-2">
                {copy.browseCollection}
                <ArrowRight size={16} />
              </Link>
              <Link to="/pricing" className="hero-outline-button">
                {copy.viewMembership}
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">{copy.statusLabel}</p>
              <p className="mt-3 font-display text-3xl font-bold">{content.eyebrow}</p>
              <p className="mt-2 text-sm text-white/60">{content.text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">{copy.launchMap}</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{copy.cardsTitle}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{copy.cardsText}</p>
          </div>
          <div className="premium-tag">{copy.stagingTag}</div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {launchCardsBase.map((card) => {
            const localizedCard = copy.cards[card.key];
            const Icon = card.icon;
            const isFocused = focus === card.key;

            return (
              <article
                key={card.key}
                className={`marketing-card p-6 transition ${
                  isFocused ? "ring-2 ring-[rgb(var(--accent))]/40 shadow-[0_24px_70px_rgba(33,26,18,0.08)]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">{localizedCard.eyebrow}</p>
                    <h3 className="mt-4 font-display text-3xl font-bold text-[rgb(28,24,20)]">{localizedCard.title}</h3>
                  </div>
                  <div className="rounded-full bg-[rgb(var(--accent))]/10 p-3">
                    <Icon size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                  </div>
                </div>

                <p className="mt-4 text-base leading-7 text-muted">{localizedCard.description}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgb(128,90,42)]">{copy.statusLabel}</p>
                    <p className="mt-2 text-sm text-[rgb(98,87,74)]">{card.status}</p>
                  </div>
                  <div className="rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgb(128,90,42)]">{copy.targetLabel}</p>
                    <p className="mt-2 text-sm text-[rgb(98,87,74)]">{card.target}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {localizedCard.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-[18px] border border-[rgb(238,231,223)] bg-[rgb(252,249,244)] px-4 py-3 text-sm text-[rgb(98,87,74)]"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="public-section">
        <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[rgb(34,28,24)] px-6 py-7 text-white sm:px-8">
          <form className="space-y-4" onSubmit={handleNotifySubmit}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-full border border-white/10 bg-white/6 px-5 py-4 text-sm text-white outline-none placeholder:text-white/34"
              />
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="button-primary" disabled={notifyState === "loading"}>
                  {notifyState === "loading" ? copy.notifyLoading : copy.notifyButton}
                </button>
                <Link to="/contact" className="hero-outline-button">
                  {copy.contactCta}
                </Link>
              </div>
          </form>
          {notifyMessage ? (
            <p
              className={`mt-4 text-sm leading-6 ${
                notifyState === "success" ? "text-[rgb(210,233,193)]" : "text-[rgb(255,193,193)]"
              }`}
            >
              {notifyMessage}
            </p>
          ) : null}
        </div>
      </section>

      <section className="public-section">
        <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
                {copy.whileWaitingEyebrow}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(29,24,19)]">
                {copy.whileWaitingTitle}
              </h2>
              <p className="mt-2 max-w-3xl text-base leading-7 text-[rgb(98,87,74)]">{copy.whileWaitingText}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="button-primary">
                {copy.browseCollection}
              </Link>
              <Link to="/pricing" className="button-secondary">
                {copy.viewMembership}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LaunchSoonPage;
