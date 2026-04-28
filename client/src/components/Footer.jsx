import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const footerCopy = {
  lt: {
    ctaEyebrow: "Įeik į erdvę",
    ctaTitle: "Pasiruošęs ramesnei, aiškesnei nario patirčiai?",
    ctaText: "Stilloak sujungia narystę, aiškų pinigų vaizdą ir tvarkingą paskyros istoriją į vieną vientisą patirtį.",
    ctaButton: "Peržiūrėti narystę",
    summary: "Stilloak padeda aiškiau valdyti išlaidas, sekti biudžetus ir ramiau judėti link taupymo tikslų vienoje apgalvotoje nario erdvėje.",
    columns: {
      house: "Studija",
      services: "Paslaugos",
      clientCare: "Pagalba",
      contact: "Kontaktai",
    },
    links: {
      story: "Mūsų istorija",
      collection: "Kolekcija",
      membership: "Narystė",
      launchSoon: "Netrukus",
      secureCheckout: "Saugus apmokėjimas",
      receiptArchive: "Sąskaitų archyvas",
      memberPricing: "Nario kainodara",
      privateSupport: "Privati pagalba",
      shipping: "Pristatymas",
      returns: "Grąžinimai",
      privacy: "Privatumas",
      terms: "Taisyklės",
      visitContact: "Atidaryti kontaktų puslapį",
      rights: "Visos teisės saugomos.",
      hours: "I–V 9:00–18:00",
    },
  },
  en: {
    ctaEyebrow: "Enter the house",
    ctaTitle: "Ready for a calmer, clearer member experience?",
    ctaText: "Stilloak brings membership, money clarity, and a tidy account archive into one consistent experience.",
    ctaButton: "View membership",
    summary: "Stilloak helps members understand spending, track budgets, and move toward savings goals with more clarity.",
    columns: {
      house: "Studio",
      services: "Services",
      clientCare: "Client care",
      contact: "Contact",
    },
    links: {
      story: "Our story",
      collection: "Collection",
      membership: "Membership",
      launchSoon: "Launch soon",
      secureCheckout: "Secure checkout",
      receiptArchive: "Receipt archive",
      memberPricing: "Member pricing",
      privateSupport: "Private support",
      shipping: "Shipping",
      returns: "Returns",
      privacy: "Privacy",
      terms: "Terms",
      visitContact: "Visit contact page",
      rights: "All rights reserved.",
      hours: "Mon–Fri 9:00–18:00",
    },
  },
  pl: {
    ctaEyebrow: "Wejdź do środka",
    ctaTitle: "Gotowy na spokojniejsze i jaśniejsze doświadczenie członkowskie?",
    ctaText: "Stilloak łączy członkostwo, przejrzystość finansową i uporządkowaną historię konta w jedno spójne doświadczenie.",
    ctaButton: "Zobacz członkostwo",
    summary: "Stilloak pomaga lepiej rozumieć wydatki, śledzić budżety i spokojniej zbliżać się do celów oszczędnościowych.",
    columns: {
      house: "Studio",
      services: "Usługi",
      clientCare: "Pomoc",
      contact: "Kontakt",
    },
    links: {
      story: "Nasza historia",
      collection: "Kolekcja",
      membership: "Członkostwo",
      launchSoon: "Wkrótce",
      secureCheckout: "Bezpieczna płatność",
      receiptArchive: "Archiwum rachunków",
      memberPricing: "Ceny dla członków",
      privateSupport: "Prywatne wsparcie",
      shipping: "Dostawa",
      returns: "Zwroty",
      privacy: "Prywatność",
      terms: "Warunki",
      visitContact: "Otwórz stronę kontaktu",
      rights: "Wszelkie prawa zastrzeżone.",
      hours: "Pon–Pt 9:00–18:00",
    },
  },
  de: {
    ctaEyebrow: "Willkommen",
    ctaTitle: "Bereit für ein ruhigeres und klareres Member-Erlebnis?",
    ctaText: "Stilloak verbindet Mitgliedschaft, Finanzklarheit und ein ordentliches Kontoarchiv zu einem stimmigen Erlebnis.",
    ctaButton: "Mitgliedschaft ansehen",
    summary: "Stilloak hilft dabei, Ausgaben klarer zu verstehen, Budgets zu verfolgen und ruhiger auf Sparziele hinzuarbeiten.",
    columns: {
      house: "Studio",
      services: "Services",
      clientCare: "Support",
      contact: "Kontakt",
    },
    links: {
      story: "Unsere Geschichte",
      collection: "Kollektion",
      membership: "Mitgliedschaft",
      launchSoon: "Bald",
      secureCheckout: "Sicherer Checkout",
      receiptArchive: "Belegarchiv",
      memberPricing: "Mitgliederpreise",
      privateSupport: "Privater Support",
      shipping: "Versand",
      returns: "Retouren",
      privacy: "Datenschutz",
      terms: "Bedingungen",
      visitContact: "Kontaktseite öffnen",
      rights: "Alle Rechte vorbehalten.",
      hours: "Mo–Fr 9:00–18:00",
    },
  },
  fr: {
    ctaEyebrow: "Entrez",
    ctaTitle: "Prêt pour une expérience membre plus calme et plus claire ?",
    ctaText: "Stilloak réunit l’abonnement, la clarté financière et un historique de compte soigné dans une seule expérience cohérente.",
    ctaButton: "Voir l’abonnement",
    summary: "Stilloak aide à mieux comprendre les dépenses, suivre les budgets et avancer plus sereinement vers les objectifs d’épargne.",
    columns: {
      house: "Studio",
      services: "Services",
      clientCare: "Aide",
      contact: "Contact",
    },
    links: {
      story: "Notre histoire",
      collection: "Collection",
      membership: "Abonnement",
      launchSoon: "Bientôt",
      secureCheckout: "Paiement sécurisé",
      receiptArchive: "Archive des reçus",
      memberPricing: "Tarifs membres",
      privateSupport: "Support privé",
      shipping: "Livraison",
      returns: "Retours",
      privacy: "Confidentialité",
      terms: "Conditions",
      visitContact: "Ouvrir la page contact",
      rights: "Tous droits réservés.",
      hours: "Lun–Ven 9:00–18:00",
    },
  },
  es: {
    ctaEyebrow: "Entra",
    ctaTitle: "¿Listo para una experiencia de membresía más clara y serena?",
    ctaText: "Stilloak une membresía, claridad financiera e historial de cuenta ordenado en una sola experiencia coherente.",
    ctaButton: "Ver membresía",
    summary: "Stilloak ayuda a entender mejor el gasto, seguir presupuestos y avanzar con más calma hacia objetivos de ahorro.",
    columns: {
      house: "Estudio",
      services: "Servicios",
      clientCare: "Ayuda",
      contact: "Contacto",
    },
    links: {
      story: "Nuestra historia",
      collection: "Colección",
      membership: "Membresía",
      launchSoon: "Próximamente",
      secureCheckout: "Pago seguro",
      receiptArchive: "Archivo de recibos",
      memberPricing: "Precios para miembros",
      privateSupport: "Soporte privado",
      shipping: "Envío",
      returns: "Devoluciones",
      privacy: "Privacidad",
      terms: "Términos",
      visitContact: "Abrir página de contacto",
      rights: "Todos los derechos reservados.",
      hours: "Lun–Vie 9:00–18:00",
    },
  },
};

const Footer = () => {
  const { language } = useLanguage();
  const copy = footerCopy[language] || footerCopy.lt;
  const footerColumns = [
    {
      title: copy.columns.house,
      items: [
        { label: copy.links.story, to: "/story" },
        { label: copy.links.collection, to: "/shop" },
        { label: copy.links.membership, to: "/pricing" },
        { label: copy.links.launchSoon, to: "/launch-soon" },
      ],
    },
    {
      title: copy.columns.services,
      items: [
        { label: copy.links.secureCheckout, to: "/secure-checkout" },
        { label: copy.links.receiptArchive, to: "/receipt-archive" },
        { label: copy.links.memberPricing, to: "/member-pricing" },
        { label: copy.links.privateSupport, to: "/private-support" },
      ],
    },
    {
      title: copy.columns.clientCare,
      items: [
        { label: copy.links.shipping, to: "/shipping" },
        { label: copy.links.returns, to: "/returns" },
        { label: copy.links.privacy, to: "/privacy" },
        { label: copy.links.terms, to: "/terms" },
      ],
    },
  ];

  return (
    <footer className="surface-dark mt-10 rounded-[38px] px-6 py-8 sm:px-8 lg:px-10">
    <div className="rounded-[30px] bg-white/6 px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgb(var(--accent-strong))" }}>
            {copy.ctaEyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold">{copy.ctaTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/66">
            {copy.ctaText}
          </p>
        </div>
        <Link to="/pricing" className="button-primary">
          {copy.ctaButton}
        </Link>
      </div>
    </div>

    <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.1fr]">
      <div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-strong)))",
            }}
          >
            SS
          </div>
          <div>
            <p className="font-display text-xl font-bold">Stilloak Studio</p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/36">private money clarity</p>
          </div>
        </div>
        <p className="mt-5 max-w-xs text-sm leading-7 text-white/62">
          {copy.summary}
        </p>
      </div>

      {footerColumns.map((column) => (
        <div key={column.title}>
          <p className="font-semibold text-white">{column.title}</p>
          <div className="mt-4 space-y-3 text-sm text-white/58">
            {column.items.map((item) =>
              item.to ? (
                <Link key={item.label} to={item.to} className="block transition hover:text-white">
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className="block transition hover:text-white">
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      ))}

      <div>
        <Link to="/contact" className="font-semibold text-white transition hover:text-white/80">
          {copy.columns.contact}
        </Link>
        <div className="mt-4 space-y-3 text-sm text-white/58">
          <a href="mailto:hello@stilloakstudio.com" className="block transition hover:text-white">
            hello@stilloakstudio.com
          </a>
          <p>+370 600 12345</p>
          <p>Vilnius, Lithuania</p>
          <p>{copy.links.hours}</p>
        </div>
        <Link to="/contact" className="mt-5 inline-flex text-sm font-medium accent-text transition hover:opacity-80">
          {copy.links.visitContact}
        </Link>
      </div>
    </div>

    <div className="mt-10 border-t border-white/8 pt-5 text-sm text-white/44">
      © 2026 Stilloak Studio. {copy.links.rights}
    </div>
  </footer>
  );
};

export default Footer;
