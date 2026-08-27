export type PricePlan = {
  id: "start" | "business" | "pro" | "custom";
  name: string;
  priceLabel: string;
  basePrice: number | null;
  description: string;
  includes: string[];
  featured?: boolean;
};

export const pricePlans: PricePlan[] = [
  {
    id: "start",
    name: "Start",
    priceLabel: "299 €",
    basePrice: 299,
    description: "Tvarkinga reprezentacinė svetainė mažam verslui, specialistui ar vienai pagrindinei paslaugai.",
    includes: [
      "Iki 3 puslapių",
      "Responsive dizainas",
      "Kontaktų forma",
      "Bazinis SEO",
      "Domeno ir SSL prijungimas"
    ]
  },
  {
    id: "business",
    name: "Business",
    priceLabel: "599 €",
    basePrice: 599,
    description: "Pilna verslo svetainė, skirta aiškiai pristatyti paslaugas ir generuoti klientų užklausas.",
    includes: [
      "Iki 7 puslapių",
      "Individuali struktūra ir dizainas",
      "Kontaktų / užklausos forma",
      "Google Analytics ir SEO paruošimas",
      "2 korekcijų etapai"
    ],
    featured: true
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "999 €",
    basePrice: 999,
    description: "Didesnė svetainė su pažangesnėmis funkcijomis, turinio valdymu ar integracijomis.",
    includes: [
      "Iki 10–15 puslapių",
      "Pažangesnis individualus dizainas",
      "Kelios formos ar integracijos",
      "CMS pagal projekto poreikį",
      "3 korekcijų etapai"
    ]
  },
  {
    id: "custom",
    name: "Pagal poreikius",
    priceLabel: "Individuali kaina",
    basePrice: null,
    description: "Nestandartiniams projektams: e. prekybai, rezervacijoms, klientų zonoms, SaaS ar vidinėms sistemoms.",
    includes: [
      "Trumpa poreikio analizė",
      "Individuali projekto sąmata",
      "Architektūros ir funkcijų planas",
      "Integracijos pagal poreikį",
      "Aiškus darbų etapas prieš startą"
    ]
  }
];
