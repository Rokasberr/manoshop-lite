import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  MailCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

const storyCopy = {
  lt: {
    heroChip: "Mūsų istorija",
    heroTitle: "Stilloak Studio buvo sukurtas tam, kad atrodytų ramiau nei įprastas storefront.",
    heroText:
      "Norėjome kažko rafinuotesnio nei standartinis katalogas, bet vis dar pakankamai praktiško realiam pirkimui, narystei ir grįžimui. Rezultatas – privatesnė, ramesnė erdvė aiškesniam pinigų vaizdui.",
    heroPrimary: "Peržiūrėti narystę",
    heroSecondary: "Peržiūrėti programą",
    pillars: [
      { title: "Mažiau triukšmo", text: "Renkamės mažiau, bet aiškesnių sluoksnių, kad žmogus greitai suprastų vertę." },
      { title: "Naudinga estetika", text: "Visa patirtis turi būti ir graži, ir praktiška: nuo pirmo hero iki savaitinio laiško." },
      { title: "Rami kontrolė", text: "Svarbu ne tik rinkti skaičius, bet ir padėti žmogui ramiau priimti sprendimus." },
    ],
    previewEyebrow: "Nario peržiūra",
    previewTitle: "Trumpa istorija apie tai, ką realiai atrakina narystė.",
    previewText:
      "Vietoje abstraktaus pažado rodomas privatus sluoksnis: dashboardas, el. pašto suvestinės ir užrakinta nario aplinka, kuri atsiveria po pirkimo.",
    unlocks: [
      {
        icon: WalletCards,
        title: "Stilloak",
        text: "Privatus dashboardas su biudžetais, taupymo tikslais, recurring išlaidomis, CSV importu ir mėnesio aiškumu.",
      },
      {
        icon: MailCheck,
        title: "AI suvestinės",
        text: "Savaitiniai ir mėnesiniai laiškai su komentaru, rizikos signalais ir aiškiu kitu žingsniu.",
      },
      {
        icon: LockKeyhole,
        title: "Užrakintas nario sluoksnis",
        text: "Journal prieiga, sąskaitų archyvas, downloadai ir privatesnė nario patirtis visoje svetainėje.",
      },
    ],
    unlockPrimary: "Atrakinti narystę",
    unlockSecondary: "Peržiūrėti launch status",
    whyEyebrow: "Kodėl tai egzistuoja",
    whyTitle: "Norėjome house brand mąstymo, ne šabloninio projekto pojūčio.",
    whyText:
      "Stilloak Studio augo iš paprastos idėjos: pinigų valdymas gali jaustis aiškiau, ramiau ir estetiškiau neprarandant praktiškumo.",
    moments: [
      "Brandas prasidėjo nuo noro pabėgti nuo demo-shop energijos ir pereiti į ramesnį, labiau editorial ritmą.",
      "Kiekvienas sluoksnis turi jaustis vientisiau: pirmas įspūdis, planai, atsiskaitymas, laiškai ir nario archyvas.",
      "Tikslas nėra daugiau triukšmo. Tikslas – geresnis ritmas, stipresnis pasitikėjimas ir aiškesnė vertė.",
    ],
    beliefEyebrow: "Kuo tikime",
    beliefTitle: "Stiprus premium jausmas dažniausiai atsiranda iš geresnio redagavimo, ne iš daugiau dekoracijų.",
    beliefText:
      "Tai galioja objektams, sąsajoms, tekstams ir checkout keliui. Kai kiekvienas sluoksnis yra sąmoningesnis, visa svetainė jaučiasi lengvesnė ir patikimesnė.",
    beliefPrimary: "Peržiūrėti narystę",
    beliefSecondary: "Susisiekti",
  },
  en: {
    heroChip: "Our story",
    heroTitle: "Stilloak Studio was built to feel calmer than the average storefront.",
    heroText:
      "We wanted something more refined than a standard catalog, but still practical enough for real purchases, membership, and return visits. The result is a quieter, more private space for financial clarity.",
    heroPrimary: "View membership",
    heroSecondary: "Preview the program",
    pillars: [
      { title: "Less noise", text: "We prefer fewer, clearer layers so people understand the value quickly." },
      { title: "Useful beauty", text: "The whole experience should feel both beautiful and practical, from the first hero to the weekly email." },
      { title: "Calm control", text: "The point is not only to collect numbers, but to help people make calmer decisions." },
    ],
    previewEyebrow: "Member preview",
    previewTitle: "A short story of what membership actually unlocks.",
    previewText:
      "Instead of an abstract promise, we show the private layer: the dashboard, the email summaries, and the locked member environment that opens after purchase.",
    unlocks: [
      {
        icon: WalletCards,
        title: "Stilloak",
        text: "A private dashboard with budgets, savings goals, recurring spend, CSV import, and a clearer monthly view.",
      },
      {
        icon: MailCheck,
        title: "AI summaries",
        text: "Weekly and monthly emails with commentary, risk signals, and a clear next step.",
      },
      {
        icon: LockKeyhole,
        title: "Locked member layer",
        text: "Journal access, invoice archive, downloads, and a more private member experience across the site.",
      },
    ],
    unlockPrimary: "Unlock membership",
    unlockSecondary: "View launch status",
    whyEyebrow: "Why it exists",
    whyTitle: "We wanted a house-brand mindset, not the feel of a template project.",
    whyText:
      "Stilloak Studio grew from a simple idea: money management can feel clearer, calmer, and more intentional without losing practicality.",
    moments: [
      "The brand started as a move away from demo-shop energy and toward a quieter editorial rhythm.",
      "Each layer should feel more coherent: the first impression, plans, checkout, emails, and the member archive.",
      "The goal is not more noise. The goal is better rhythm, stronger trust, and clearer value.",
    ],
    beliefEyebrow: "What we believe",
    beliefTitle: "A strong premium feeling usually comes from better editing, not more decoration.",
    beliefText:
      "That applies to objects, interfaces, copy, and checkout. When every layer is more intentional, the whole site feels lighter and more trustworthy.",
    beliefPrimary: "View membership",
    beliefSecondary: "Contact us",
  },
};

["pl", "de", "fr", "es"].forEach((languageCode) => {
  storyCopy[languageCode] = storyCopy.en;
});

const StoryPage = () => {
  const { language } = useLanguage();
  const copy = storyCopy[language] || storyCopy.lt;

  return (
    <div className="space-y-10 pb-6">
      <section className="marketing-dark overflow-hidden rounded-[38px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="hero-chip">{copy.heroChip}</span>
            <h1 className="mt-8 max-w-3xl font-display text-5xl font-bold leading-[0.94] sm:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{copy.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/pricing" className="button-primary gap-2">
                {copy.heroPrimary}
                <ArrowRight size={16} />
              </Link>
              <Link to="/savings-studio" className="hero-outline-button">
                {copy.heroSecondary}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {copy.pillars.map((pillar) => (
              <div key={pillar.title} className="metric-card">
                <Sparkles size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                <p className="mt-4 font-display text-2xl font-bold">{pillar.title}</p>
                <p className="mt-3 text-sm leading-6 text-white/68">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="eyebrow">{copy.previewEyebrow}</span>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">{copy.previewTitle}</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">{copy.previewText}</p>

          <div className="mt-6 grid gap-4">
            {copy.unlocks.map(({ icon: Icon, text, title }) => (
              <div key={title} className="marketing-card p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))]/12">
                    <Icon size={18} style={{ color: "rgb(var(--accent-strong))" }} />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-[rgb(29,24,19)]">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/pricing" className="button-primary gap-2">
              {copy.unlockPrimary}
              <ArrowRight size={16} />
            </Link>
            <Link to="/launch-soon" className="button-secondary">
              {copy.unlockSecondary}
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {copy.moments.map((moment, index) => (
            <div key={moment} className="marketing-card p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))]/12 text-sm font-semibold text-[rgb(var(--accent-strong))]">
                  0{index + 1}
                </div>
                <p className="text-base leading-7 text-muted">{moment}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section grid gap-8 lg:grid-cols-[0.84fr_1.16fr]">
        <div>
          <span className="eyebrow">{copy.whyEyebrow}</span>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">{copy.whyTitle}</h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">{copy.whyText}</p>
        </div>

        <div className="rounded-[32px] border border-[rgb(232,224,214)] bg-[linear-gradient(135deg,rgba(255,252,247,0.96),rgba(247,241,233,0.94))] px-6 py-7 sm:px-8">
          <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
            {copy.beliefEyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-[rgb(29,24,19)]">
            {copy.beliefTitle}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(98,87,74)]">{copy.beliefText}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/pricing" className="button-primary">
              {copy.beliefPrimary}
            </Link>
            <Link to="/contact" className="button-secondary">
              {copy.beliefSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoryPage;
