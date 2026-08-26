export type PricePlan = {
  id: "landing-page" | "business-website" | "ecommerce" | "custom-system" | "maintenance";
  name: string;
  price: string;
  description: string;
  includes: string[];
  featured?: boolean;
};

export const pricePlans: PricePlan[] = [
  {
    id: "landing-page",
    name: "Landing page",
    price: "nuo 399 €",
    description: "Vieno tikslo puslapis kampanijai, paslaugai ar naujam pasiūlymui.",
    includes: ["Aiški struktūra", "CTA blokai", "Responsive dizainas", "Bazinis SEO"]
  },
  {
    id: "business-website",
    name: "Verslo svetainė",
    price: "nuo 799 €",
    description: "Profesionali svetainė paslaugų verslui su aiškia navigacija ir turinio sistema.",
    includes: ["Iki 6 pagrindinių skilčių", "Paslaugų puslapiai", "Kontaktų forma", "SEO paruošimas"],
    featured: true
  },
  {
    id: "ecommerce",
    name: "Elektroninė parduotuvė",
    price: "nuo 1 499 €",
    description: "Parduotuvės patirtis produktams, skaitmeniniam turiniui arba paslaugų užsakymams.",
    includes: ["Produktų struktūra", "Krepšelio srautas", "Mokėjimų paruošimas", "Administravimo pagrindas"]
  },
  {
    id: "custom-system",
    name: "Individuali sistema",
    price: "individualus pasiūlymas",
    description: "SaaS, klientų portalai, rezervacijos, vidiniai darbo įrankiai ir integracijos.",
    includes: ["Techninė analizė", "Architektūra", "Autentifikacija", "API integracijos"]
  },
  {
    id: "maintenance",
    name: "Priežiūra",
    price: "nuo 49 €/mėn.",
    description: "Nuolatinis techninis stabilumas, smulkūs pakeitimai ir saugus atnaujinimų ritmas.",
    includes: ["Atnaujinimai", "Smulkūs pakeitimai", "Turinio pagalba", "Techninė stebėsena"]
  }
];
