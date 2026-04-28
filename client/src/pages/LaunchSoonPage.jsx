import { ArrowRight, BookOpenText, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
import launchSoonService from "../services/launchSoonService";

const launchCardsBase = [
  {
    key: "digital",
    icon: Download,
    status: "In staging",
    target: "May 2026",
  },
  {
    key: "journal",
    icon: BookOpenText,
    status: "Held for release",
    target: "After digital launch",
  },
];

const launchCopy = {
  lt: {
    focus: {
      default: {
        eyebrow: "Netrukus",
        title: "Dvi sekcijos dar ruošiamos atidarymui.",
        text: "Digital Collection ir Journal laikinai sugrupuoti čia, kol užveržiame paleidimo sluoksnį ir užtikriname, kad abi sekcijos atsidarytų pilnesnės.",
      },
      digital: {
        eyebrow: "Digital collection",
        title: "Skaitmeninė kolekcija ruošiama švaresniam atidarymui.",
        text: "Produktai, bundle’ai ir instant-download patirtis dar tvarkomi prieš pilną atidarymą.",
      },
      journal: {
        eyebrow: "Journal",
        title: "Journal laikinai laikomas launch-soon režime.",
        text: "Užrakintas editorial sluoksnis tvarkomas taip, kad nario skaitymo patirtis nuo pirmos dienos būtų verta atrakinti.",
      },
    },
    cardsTitle: "Kas laikinai laikoma čia",
    cardsText:
      "Vietoje pusiau atidarytų sekcijų navigacijoje, abi zonos šiuo metu gyvena viename aiškesniame staging sluoksnyje.",
    cards: {
      digital: {
        eyebrow: "Digital collection",
        title: "Printable gidai, bundle’ai ir instant download produktai",
        description:
          "Digital lentyna dar tvarkoma, kad pirmas release jaustųsi pilnas, premium ir paruoštas pirkimui be nebaigtų kraštų.",
        bullets: ["Printable art bundle’ai", "PDF gidai ir planneriai", "Švaresnė launch seka ir bundle logika"],
      },
      journal: {
        eyebrow: "Journal",
        title: "Ramesnis editorial sluoksnis nariams",
        description:
          "Journal laikomas atskirai iki stipresnio paleidimo sluoksnio, kad privatūs tekstai jaustųsi pilnai paruošti.",
        bullets: ["Members-only straipsniai", "Aiškesnis editorial kalendorius", "Pilnesnė užrakinta skaitymo patirtis"],
      },
    },
    statusLabel: "Statusas",
    targetLabel: "Tikslas",
    notifyEyebrow: "Pranešk man",
    notifyTitle: "Leisk žmogui pakelti ranką dar prieš atsidarymą.",
    notifyText:
      "Vietoje aklavietės lankytojas supranta, kad sekcija dar ruošiama, ir gali palikti el. paštą, kad primintume vėliau.",
    notifyButton: "Pranešk man, kai atsidarys",
    notifyLoading: "Išsaugoma...",
    contactCta: "Susisiekti",
    notifyHint:
      "Forma jau prijungta prie Brevo. Kai paleisime sekciją, šiuos kontaktus galėsime panaudoti švariam launch pranešimui.",
    whileWaitingEyebrow: "Kol lauki",
    whileWaitingTitle: "Gyvas sluoksnis vis dar atidarytas.",
    whileWaitingText:
      "Kol Digital Collection ir Journal dar ruošiami, gali peržiūrėti pagrindinę kolekciją, narystę ir Stilloak programą.",
    browseCollection: "Peržiūrėti kolekciją",
    viewMembership: "Peržiūrėti narystę",
    launchMap: "Paleidimo planas",
    stagingTag: "Laikinas staging",
    invalidEmail: "Įvesk tvarkingą el. pašto adresą, kad galėtume išsaugoti tavo susidomėjimą.",
    successDefault: "Susidomėjimas išsaugotas. Parašysime, kai ši sekcija atsidarys.",
    errorDefault: "Nepavyko išsaugoti susidomėjimo. Pabandyk dar kartą kiek vėliau.",
  },
  en: {
    focus: {
      default: {
        eyebrow: "Launch soon",
        title: "Two sections are still being prepared for launch.",
        text: "Digital Collection and Journal are temporarily grouped here while we tighten the release layer and make sure both sections open in a more complete state.",
      },
      digital: {
        eyebrow: "Digital collection",
        title: "The digital collection is being prepared for a cleaner launch.",
        text: "Products, bundles, and the instant-download experience are still being refined before full release.",
      },
      journal: {
        eyebrow: "Journal",
        title: "The Journal is temporarily held in launch-soon mode.",
        text: "The locked editorial layer is being refined so the member reading experience feels worth unlocking from day one.",
      },
    },
    cardsTitle: "What is temporarily held here",
    cardsText:
      "Instead of leaving half-open sections in the navigation, both areas currently live inside one clearer staging layer.",
    cards: {
      digital: {
        eyebrow: "Digital collection",
        title: "Printable guides, bundles, and instant downloads",
        description:
          "The digital shelf is being refined so the first release feels complete, premium, and ready to buy without half-finished edges.",
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
    notifyEyebrow: "Notify me",
    notifyTitle: "Let people raise a hand before the section opens.",
    notifyText:
      "Instead of sending visitors into a dead end, this keeps the page useful: they understand the section is coming, and they can leave an email to be notified later.",
    notifyButton: "Notify me when it opens",
    notifyLoading: "Saving interest...",
    contactCta: "Contact the studio",
    notifyHint:
      "This form is already connected to Brevo, so the launch list can turn into a clean release email when the section is ready.",
    whileWaitingEyebrow: "While you wait",
    whileWaitingTitle: "The live layer is still open.",
    whileWaitingText:
      "While Digital Collection and Journal are still being prepared, you can browse the main collection, view membership, and explore Stilloak.",
    browseCollection: "Browse collection",
    viewMembership: "View membership",
    launchMap: "Launch map",
    stagingTag: "Temporary staging",
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
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <span className="eyebrow">{copy.notifyEyebrow}</span>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">{copy.notifyTitle}</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted">{copy.notifyText}</p>
          </div>

          <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[rgb(34,28,24)] px-6 py-7 text-white">
            <p className="text-xs uppercase tracking-[0.34em] text-white/42">{copy.notifyEyebrow}</p>
            <form className="mt-5 space-y-4" onSubmit={handleNotifySubmit}>
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
            ) : (
              <p className="mt-4 text-sm leading-6 text-white/60">{copy.notifyHint}</p>
            )}
          </div>
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
