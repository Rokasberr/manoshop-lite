import {
  BadgeCheck,
  Brush,
  Code2,
  LifeBuoy,
  MonitorSmartphone,
  RefreshCcw,
  ShoppingBag,
  Workflow
} from "lucide-react";

export const services = [
  {
    title: "Landing page kūrimas",
    description: "Greitai suprantami puslapiai reklamai, naujam produktui ar konkrečiam pardavimo pasiūlymui.",
    icon: MonitorSmartphone
  },
  {
    title: "Verslo svetainių kūrimas",
    description: "Solidžios reprezentacinės svetainės, kurios paaiškina vertę, paslaugas ir veda į kontaktą.",
    icon: Brush
  },
  {
    title: "Elektroninės parduotuvės",
    description: "Aiškūs pirkimo srautai, produktų struktūra ir techninis pagrindas augančiai prekybai.",
    icon: ShoppingBag
  },
  {
    title: "Individualios sistemos ir SaaS",
    description: "Klientų portalai, vidiniai įrankiai, prenumeratos ir integracijos pagal realų procesą.",
    icon: Code2
  },
  {
    title: "Svetainių atnaujinimas",
    description: "Sutvarkome seną struktūrą, vizualą, greitį, tekstus ir konversijų kelius.",
    icon: RefreshCcw
  },
  {
    title: "Techninė priežiūra",
    description: "Reguliarūs atnaujinimai, smulkūs pakeitimai ir patikima techninė pagalba po paleidimo.",
    icon: LifeBuoy
  }
];

export const processSteps = [
  {
    title: "Kryptis",
    text: "Išgryniname tikslą, auditoriją, pasiūlymą ir svarbiausią veiksmą, kurį turi atlikti lankytojas."
  },
  {
    title: "Struktūra",
    text: "Sudedame puslapio logiką, turinio hierarchiją, paslaugų blokus ir konversijų kelius."
  },
  {
    title: "Dizainas",
    text: "Kuriame vizualinę sistemą, kuri atrodo profesionaliai ir išlieka patogi telefone."
  },
  {
    title: "Įgyvendinimas",
    text: "Sukuriame greitą, prieinamą ir tvarkingai paruoštą svetainę su aiškiomis paleidimo instrukcijomis."
  }
];

export const faqs = [
  {
    question: "Kiek laiko trunka svetainės kūrimas?",
    answer:
      "Paprastas landing page dažniausiai telpa į 1-3 savaites, o didesnė verslo svetainė arba parduotuvė priklauso nuo turinio, integracijų ir derinimo apimties."
  },
  {
    question: "Ar galite atnaujinti jau veikiančią svetainę?",
    answer:
      "Taip. Galime pradėti nuo audito, sutvarkyti struktūrą, tekstus, vizualą, technines klaidas arba perkelti projektą į tvaresnį technologinį pagrindą."
  },
  {
    question: "Ar kainos yra galutinės?",
    answer:
      "Nurodytos kainos yra pradinės. Galutinė sąmata priklauso nuo puslapių kiekio, funkcionalumo, turinio paruošimo, integracijų ir priežiūros poreikio."
  },
  {
    question: "Ar svetainė bus pritaikyta telefonui?",
    answer:
      "Taip. Responsive dizainas, aiškios focus būsenos, skaitomas tekstas ir horizontalaus slinkimo prevencija yra bazinės darbo dalys."
  },
  {
    question: "Kas vyksta po formos užpildymo?",
    answer:
      "Jei svetainėje sukonfigūruotas užklausų endpointas, forma išsiunčia realią užklausą. Jei endpointo nėra, lankytojui parodomas aiškus el. pašto kontaktas."
  }
];

export const trustItems = [
  { label: "Semantinis HTML", icon: BadgeCheck },
  { label: "Greitas Vite pagrindas", icon: Workflow },
  { label: "Responsive dizainas", icon: MonitorSmartphone }
];
