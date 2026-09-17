import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import PublicPageShell from "./components/PublicPageShell";

type Project = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  accent: string;
  highlights: string[];
  sections: Array<{ title: string; text: string }>;
};

const projects: Record<string, Project> = {
  "/projects/stilloak-studio": {
    eyebrow: "STILLOAK STUDIO · ATVEJO ANALIZĖ",
    title: "Skaitmeninė sistema, kuri sujungia paslaugas ir kliento kelią.",
    description:
      "Stilloak Studio projektas parodo, kaip vientisas dizainas, aiški paslaugų struktūra ir privati kliento erdvė gali veikti kaip viena verslo sistema.",
    image: "/stilloak-premium-hero.webp",
    imageAlt: "Stilloak Studio premium svetainės kryptis nešiojamame kompiuteryje",
    accent: "Premium verslo sistema",
    highlights: ["Aiški paslaugų struktūra", "Privati projekto erdvė", "Mokėjimų ir dokumentų kelias"],
    sections: [
      { title: "Tikslas", text: "Sukurti profesionalų kelią nuo pirmo apsilankymo iki užklausos, pasiūlymo, mokėjimo ir projekto perdavimo." },
      { title: "Sprendimas", text: "Vieninga vizualinė sistema, aiškios paslaugų kryptys ir klientui suprantama projekto eiga vienoje vietoje." },
      { title: "Vertė", text: "Mažiau padrikų laiškų, aiškesnis sprendimo priėmimas ir nuoseklus prekės ženklo įvaizdis kiekviename etape." }
    ]
  },
  "/demo/auto-detailing": {
    eyebrow: "KONCEPCINIS DEMONSTRACINIS PROJEKTAS",
    title: "Northline Detailing — preciziškas įvaizdis automobilių priežiūrai.",
    description:
      "Tamsi, techniška ir vizualiai stipri svetainės kryptis detailing studijai, kuriai svarbus pasitikėjimas, darbų kokybė ir greitas rezervacijos kelias.",
    image: "/stilloak-direction-technology-v2.webp",
    imageAlt: "Tamsi premium technologinė svetainės kryptis",
    accent: "Dark performance",
    highlights: ["Paslaugų paketai", "Darbų galerija", "Greita rezervacijos užklausa"],
    sections: [
      { title: "Pozicija", text: "Premium priežiūra, pristatoma ne kaip dar viena paslauga, o kaip preciziškas automobilio išvaizdos atnaujinimas." },
      { title: "Struktūra", text: "Aiškūs paketai, darbų pavyzdžiai, pasitikėjimo argumentai ir ryškus kelias į rezervaciją." },
      { title: "Mobilus kelias", text: "Trumpas turinys, greitai pasiekiami kontaktai ir patogus veiksmas klientui, kuris naršo telefonu." }
    ]
  },
  "/demo/beauty-studio": {
    eyebrow: "KONCEPCINIS DEMONSTRACINIS PROJEKTAS",
    title: "Élan Beauty — rami premium patirtis grožio studijai.",
    description:
      "Šviesi redakcinė kryptis su subtilia spalvų palete, aiškiu paslaugų pateikimu ir rezervacijos akcentu.",
    image: "/stilloak-direction-editorial.webp",
    imageAlt: "Šviesi redakcinė premium svetainės kryptis",
    accent: "Soft luxury",
    highlights: ["Paslaugų kategorijos", "Kainų pateikimas", "Vizito rezervacija"],
    sections: [
      { title: "Emocija", text: "Daug erdvės, švelni tipografija ir ramus ritmas padeda sukurti pasitikėjimą dar prieš vizitą." },
      { title: "Aiškumas", text: "Paslaugos ir kainos išdėstomos taip, kad lankytojui nereikėtų ieškoti svarbiausios informacijos." },
      { title: "Veiksmas", text: "Rezervacijos kelias išlieka matomas, tačiau neužgožia estetikos ir prekės ženklo charakterio." }
    ]
  },
  "/demo/home-services": {
    eyebrow: "KONCEPCINIS DEMONSTRACINIS PROJEKTAS",
    title: "Nordcraft Home — aiški svetainė patikimam namų paslaugų verslui.",
    description:
      "Šilta architektūrinė kryptis paslaugų verslui, kuriam reikia aiškiai pristatyti darbus, aptarnaujamą teritoriją ir užklausos procesą.",
    image: "/stilloak-direction-architecture-v2.webp",
    imageAlt: "Šviesi architektūrinė svetainės kryptis",
    accent: "Warm architecture",
    highlights: ["Paslaugų geografija", "Atliktų darbų pristatymas", "Greita kainos užklausa"],
    sections: [
      { title: "Pasitikėjimas", text: "Realistiška darbų prezentacija, aiškūs procesai ir konkretūs kontaktiniai veiksmai padeda sumažinti kliento abejones." },
      { title: "Pasiūlymas", text: "Kiekviena paslauga paaiškinama trumpai, o lankytojas lengvai supranta, ką pateikti kainos pasiūlymui." },
      { title: "Augimas", text: "Struktūra paruošta plėsti paslaugų puslapius ir organinį matomumą skirtinguose miestuose." }
    ]
  }
};

function setMeta(name: string, content: string, property = false) {
  const attribute = property ? "property" : "name";
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function PortfolioDetailPage({ path }: { path: string }) {
  const project = projects[path];

  useEffect(() => {
    const canonicalUrl = `https://web.stilloak-studio.com${path}`;
    document.title = `${project.title} | Stilloak Web`;
    setMeta("description", project.description);
    setMeta("og:title", project.title, true);
    setMeta("og:description", project.description, true);
    setMeta("og:url", canonicalUrl, true);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = canonicalUrl;
  }, [path, project]);

  return (
    <PublicPageShell>
      <main className="detail-page">
        <section className="detail-hero section">
          <div className="detail-hero-copy">
            <a className="detail-back-link" href="/#portfolio"><ArrowLeft size={17} /> Grįžti į pavyzdžius</a>
            <span className="detail-eyebrow">{project.eyebrow}</span>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
            <div className="detail-actions">
              <a className="button button-primary" href="/#kontaktai">Aptarti panašų projektą <ArrowRight size={18} /></a>
              <a className="button button-secondary" href="mailto:hello@stilloak-studio.com">Parašyti el. paštu <ExternalLink size={17} /></a>
            </div>
          </div>
          <div className="detail-hero-media">
            <img src={project.image} alt={project.imageAlt} width="1600" height="900" />
            <span>{project.accent}</span>
          </div>
        </section>

        <section className="section detail-highlights" aria-label="Projekto kryptys">
          {project.highlights.map((item) => <div key={item}><Check size={18} /><span>{item}</span></div>)}
        </section>

        <section className="section detail-sections">
          {project.sections.map((section, index) => (
            <article key={section.title}>
              <span>0{index + 1}</span>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </article>
          ))}
        </section>

        <section className="section detail-cta">
          <div>
            <span>Jūsų verslui pritaikyta kryptis</span>
            <h2>Sukurkime svetainę, kuri atrodo profesionaliai ir veda klientą į veiksmą.</h2>
          </div>
          <a className="button button-primary" href="/#kontaktai">Gauti pasiūlymą <ArrowRight size={18} /></a>
        </section>
      </main>
    </PublicPageShell>
  );
}
