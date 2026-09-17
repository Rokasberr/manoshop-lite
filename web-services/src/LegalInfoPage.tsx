import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { useEffect } from "react";
import PublicPageShell from "./components/PublicPageShell";

type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  sections: LegalSection[];
};

const contactEmail = "hello@stilloak-studio.com";

const legalPages: Record<string, LegalPageContent> = {
  "/web-services-privacy": {
    eyebrow: "STILLOAK WEB · PRIVATUMAS",
    title: "Privatumo informacija",
    description: "Kaip tvarkome svetainės projekto užklausos, pasiūlymo, mokėjimo ir projekto vykdymo duomenis.",
    highlights: [
      "Renkame tik paslaugai reikalingus duomenis",
      "Kortelės duomenis tvarko mokėjimų paslaugų teikėjas",
      "Dėl savo duomenų galite kreiptis el. paštu"
    ],
    sections: [
      {
        heading: "Kokius duomenis tvarkome",
        bullets: [
          "vardą, el. pašto adresą, telefono numerį, įmonės pavadinimą ir projekto aprašymą",
          "pasiūlymo pasirinkimus, patvirtinimo informaciją ir projekto komunikaciją",
          "sąskaitai reikalingus rekvizitus ir mokėjimo būseną, bet ne pilnus kortelės duomenis",
          "ribotus techninius bei reklamos šaltinio duomenis, kai tam turime teisinį pagrindą arba jūsų sutikimą"
        ]
      },
      {
        heading: "Tikslai ir teisiniai pagrindai",
        paragraphs: [
          "Duomenis naudojame atsakyti į užklausą, parengti pasiūlymą, sudaryti ir vykdyti susitarimą, administruoti mokėjimus bei dokumentus, užtikrinti sistemos saugumą ir vykdyti teisines prievoles.",
          "Analitikos ir rinkodaros technologijos naudojamos tik pagal jūsų slapukų pasirinkimą. Sutikimą galite bet kada pakeisti puslapio apačioje atidarę slapukų nustatymus."
        ]
      },
      {
        heading: "Gavėjai ir saugojimas",
        paragraphs: [
          "Duomenis pagal būtinybę gali tvarkyti prieglobos, duomenų bazės, el. pašto ir mokėjimų paslaugų teikėjai. Jiems perduodama tik paslaugai būtina informacija.",
          "Duomenis saugome tiek, kiek reikia užklausai ir projektui administruoti, teisėms apginti bei taikomoms apskaitos ir kitoms prievolėms įvykdyti."
        ]
      },
      {
        heading: "Jūsų teisės",
        paragraphs: [
          `Galite prašyti susipažinti su savo duomenimis, juos ištaisyti, apriboti tvarkymą, nesutikti su tvarkymu arba, kai taikoma, prašyti juos ištrinti. Kreipkitės adresu ${contactEmail}.`
        ]
      }
    ]
  },
  "/cookie-policy": {
    eyebrow: "STILLOAK WEB · SLAPUKAI",
    title: "Slapukų politika",
    description: "Aiškiai paaiškiname, kokias slapukų kategorijas naudojame ir kaip galite valdyti savo pasirinkimą.",
    highlights: [
      "Būtini slapukai veikia visada",
      "Analitika įjungiama tik gavus sutikimą",
      "Rinkodaros pasirinkimą galima bet kada pakeisti"
    ],
    sections: [
      {
        heading: "Būtini slapukai",
        paragraphs: [
          "Šie slapukai ir vietinė naršyklės saugykla reikalingi pagrindiniam svetainės veikimui, saugumui ir jūsų privatumo pasirinkimui išsaugoti. Jų išjungti per mūsų nustatymų langą negalima."
        ]
      },
      {
        heading: "Analitika",
        paragraphs: [
          "Gavus jūsų sutikimą, analitikos priemonės padeda suprasti bendrą svetainės naudojimą, lankomus puslapius ir užklausos kelią. Šie duomenys naudojami svetainei gerinti."
        ]
      },
      {
        heading: "Rinkodara",
        paragraphs: [
          "Gavus jūsų sutikimą, rinkodaros priemonės gali padėti įvertinti reklamos rezultatus, priskirti užklausą kampanijai ir formuoti pakartotinės rinkodaros auditorijas."
        ]
      },
      {
        heading: "Kaip pakeisti pasirinkimą",
        paragraphs: [
          "Bet kuriuo metu puslapio apačioje pasirinkite „Slapukų nustatymai“. Galite palikti tik būtinus slapukus arba atskirai įjungti analitiką ir rinkodarą."
        ]
      }
    ]
  },
  "/web-services-terms": {
    eyebrow: "STILLOAK WEB · PASLAUGŲ SĄLYGOS",
    title: "Paslaugų sąlygos",
    description: "Pasiūlymo, mokėjimų, darbų, pakeitimų ir projekto perdavimo tvarka.",
    highlights: [
      "Kaina ir apimtis nustatomos individualiame pasiūlyme",
      "Užklausa pati savaime neįpareigoja pirkti",
      "Papildomi darbai pradedami tik juos suderinus"
    ],
    sections: [
      {
        heading: "Užklausa ir pasiūlymas",
        paragraphs: [
          "Svetainėje pateikta užklausa yra prašymas susisiekti ir pati savaime nesukuria pareigos pirkti. Konkreti darbų apimtis, kaina, terminas, korekcijos, mokėjimo planas ir pasiūlymo galiojimas pateikiami individualiame pasiūlyme.",
          "Susitarimas laikomas patvirtintu klientui priėmus individualų pasiūlymą ir atlikus jame nurodytą pirmą mokėjimą, jeigu pasiūlyme nenustatyta kitaip."
        ]
      },
      {
        heading: "Mokėjimai ir sąskaitos",
        paragraphs: [
          "Pagrindinis pasirinkimas yra visa projekto suma iškart. Kai tai nurodyta pasiūlyme, klientas gali pasirinkti avansą ir likutį. Tiksli suma, PVM, mokėjimo terminai ir rekvizitai pateikiami pasiūlyme bei išrašytame dokumente."
        ]
      },
      {
        heading: "Darbai ir pakeitimai",
        bullets: [
          "klientas sutartu laiku pateikia turinį, prieigas ir grįžtamąjį ryšį",
          "teikėjas vykdo patvirtintą apimtį ir informuoja apie reikšmingus termino ar sprendimo pokyčius",
          "į kainą įtrauktos korekcijos nurodomos individualiame pasiūlyme",
          "papildomi darbai atliekami tik suderinus jų kainą ir terminą"
        ]
      },
      {
        heading: "Perdavimas ir pagalba",
        paragraphs: [
          "Po pilno atsiskaitymo perduodami individualiame pasiūlyme sutarti rezultatai ir prieigos. Trečiųjų šalių priemonėms, šriftams, papildiniams ar turiniui gali būti taikomos atskiros jų licencijos.",
          "Pastebėję su sutarta apimtimi susijusį techninį trūkumą, parašykite mums. Garantijos ar priežiūros laikotarpis, jeigu taikomas, nurodomas pasiūlyme arba perdavimo informacijoje."
        ]
      },
      {
        heading: "Kreipiniai ir ginčai",
        paragraphs: [
          `Pirmiausia kreipkitės adresu ${contactEmail}. Atsakymą pateiksime raštu. Vartotojų teisės nėra ribojamos; vartotojas taip pat gali kreiptis į Valstybinę vartotojų teisių apsaugos tarnybą teisės aktuose nustatyta tvarka.`
        ]
      }
    ]
  },
  "/web-services-refunds": {
    eyebrow: "STILLOAK WEB · ATSISAKYMAS IR GRĄŽINIMAI",
    title: "Atsisakymas ir grąžinimai",
    description: "Kaip nagrinėjami projekto nutraukimo, atsisakymo ir sumokėtų lėšų grąžinimo prašymai.",
    highlights: [
      "Kiekvienas prašymas įvertinamas individualiai",
      "Atsižvelgiama į jau atliktą darbų dalį",
      "Privalomos vartotojų teisės nėra ribojamos"
    ],
    sections: [
      {
        heading: "Prieš darbų pradžią",
        paragraphs: [
          `Jeigu norite atsisakyti projekto dar nepradėjus darbų, kuo greičiau parašykite ${contactEmail}. Įvertinsime mokėjimo išlaidas, individualaus užsakymo aplinkybes ir taikomas vartotojų teises.`
        ]
      },
      {
        heading: "Darbams prasidėjus",
        paragraphs: [
          "Jeigu klientas paprašo pradėti paslaugą iki galimo atsisakymo termino pabaigos, nutraukimo atveju gali tekti apmokėti proporcingai iki pranešimo suteiktą paslaugos dalį. Jau individualiai parengti ir perduoti rezultatai vertinami atskirai."
        ]
      },
      {
        heading: "Visiškai suteikta paslauga",
        paragraphs: [
          "Kai paslauga visiškai suteikta klientui aiškiai paprašius pradėti ją teikti ir patvirtinus taikomas pasekmes, atsisakymo teisė gali nebetaikyti teisės aktuose nustatytais atvejais."
        ]
      },
      {
        heading: "Kaip pateikti prašymą",
        paragraphs: [
          `Parašykite ${contactEmail}, nurodykite užsakymo numerį, savo prašymą ir trumpą situacijos paaiškinimą. Atsakysime raštu ir, jei taikoma, pateiksime grąžinamos sumos apskaičiavimą.`
        ]
      }
    ]
  }
};

export default function LegalInfoPage({ path }: { path: string }) {
  const page = legalPages[path] || legalPages["/web-services-terms"];

  useEffect(() => {
    const title = `${page.title} | Stilloak Web`;
    const canonicalUrl = `https://web.stilloak-studio.com${path}`;
    document.title = title;
    document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", page.description);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", title);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", page.description);
    document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = canonicalUrl;
  }, [page, path]);

  return (
    <PublicPageShell>
      <main className="detail-page legal-info-page">
        <section className="section legal-hero">
          <a className="detail-back-link" href="/"><ArrowLeft size={17} /> Grįžti į pradžią</a>
          <span className="detail-eyebrow">{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <small className="legal-updated">Atnaujinta 2026 m. rugsėjo 17 d.</small>
        </section>

        <section className="section legal-highlight-grid" aria-label="Svarbiausia informacija">
          {page.highlights.map((highlight) => (
            <div key={highlight}><CheckCircle2 size={19} /><span>{highlight}</span></div>
          ))}
        </section>

        <section className="section legal-content-grid">
          {page.sections.map((section, index) => (
            <article key={section.heading}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
            </article>
          ))}
        </section>

        <section className="section legal-contact-strip">
          <div>
            <span>Kilo klausimų?</span>
            <h2>Prieš patvirtindami pasiūlymą, parašykite mums.</h2>
          </div>
          <a className="button button-primary" href={`mailto:${contactEmail}`}>
            <Mail size={18} /> {contactEmail}
          </a>
        </section>

        <section className="section legal-links-card">
          <div>
            <span>Teisinė informacija</span>
            <h2>Visa projekto informacija vienoje vietoje.</h2>
          </div>
          <div className="legal-link-list">
            <a href="/web-services-details">Rekvizitai <ArrowRight size={17} /></a>
            <a href="/web-services-privacy">Privatumo informacija <ArrowRight size={17} /></a>
            <a href="/cookie-policy">Slapukų politika <ArrowRight size={17} /></a>
            <a href="/web-services-terms">Paslaugų sąlygos <ArrowRight size={17} /></a>
            <a href="/web-services-refunds">Atsisakymas ir grąžinimai <ArrowRight size={17} /></a>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
