export const serviceLinks = [
  { label: "Secure checkout", to: "/secure-checkout" },
  { label: "Receipt archive", to: "/receipt-archive" },
  { label: "Member pricing", to: "/member-pricing" },
  { label: "Private support", to: "/private-support" },
];

export const clientCareLinks = [
  { label: "Shipping", to: "/shipping" },
  { label: "Returns", to: "/returns" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

export const houseLinks = [
  { label: "Our story", href: "/#story" },
  { label: "Collection", to: "/shop" },
  { label: "Membership", to: "/pricing" },
  { label: "Journal", href: "/#journal" },
];

export const infoPages = {
  secureCheckout: {
    title: "Secure checkout",
    eyebrow: "Services",
    summary:
      "Apmokėjimas Stilloak Studio svetainėje sukurtas taip, kad jaustųsi ramus, aiškus ir patikimas tiek fiziniams, tiek skaitmeniniams produktams.",
    lastUpdated: "April 28, 2026",
    highlights: [
      "Stripe kortelių apmokėjimai",
      "Aiškus užsakymo suvestinės peržiūrėjimas prieš mokant",
      "PDF sąskaita ir užsakymo įrašas po pirkimo",
    ],
    sections: [
      {
        heading: "Kaip vyksta apmokėjimas",
        paragraphs: [
          "Mokėjimo metu klientas mato visą užsakymo suvestinę, pasirinktą pristatymo būdą ir galutinę sumą prieš patvirtindamas pirkimą.",
          "Kortelių apmokėjimai apdorojami per Stripe. Stilloak Studio tiesiogiai nekaupia pilnų kortelės duomenų savo serveryje.",
        ],
      },
      {
        heading: "Ką gausi po pirkimo",
        bullets: [
          "patvirtintą užsakymo įrašą savo paskyroje",
          "PDF sąskaitą, kurią gali atsisiųsti vėliau",
          "skaitmeninių produktų atsisiuntimą profilyje arba el. paštu, kai ši funkcija aktyvi",
        ],
      },
      {
        heading: "Jei kažkas nepavyksta",
        paragraphs: [
          "Jei mokėjimas nepraeina, rekomenduojame patikrinti kortelės limitus, 3D Secure patvirtinimą arba pabandyti dar kartą po kelių minučių.",
          "Jei matai nurašymą, bet užsakymas nepasirodė profilyje, parašyk mums ir patikrinkime situaciją rankiniu būdu.",
        ],
      },
    ],
    cta: { label: "View collection", to: "/shop" },
  },
  receiptArchive: {
    title: "Receipt archive",
    eyebrow: "Services",
    summary:
      "Kiekvienas pirkimas išsaugomas tavo paskyroje, kad bet kada galėtum greitai rasti užsakymo istoriją, PDF sąskaitas ir skaitmeninius atsisiuntimus.",
    lastUpdated: "April 28, 2026",
    highlights: [
      "Visa užsakymų istorija vienoje vietoje",
      "PDF sąskaitos atsisiuntimas",
      "Skaitmeninių failų prieiga po apmokėjimo",
    ],
    sections: [
      {
        heading: "Kas saugoma paskyroje",
        bullets: [
          "užsakymo numeris ir data",
          "pirkinių sąrašas ir bendra suma",
          "mokėjimo ir užsakymo būsena",
          "sąskaitos PDF failas",
        ],
      },
      {
        heading: "Skaitmeniniai produktai",
        paragraphs: [
          "Jei įsigyji skaitmeninį produktą, jo atsisiuntimas lieka susietas su tavo užsakymu. Tai leidžia sugrįžti prie failo vėliau, o ne tik pirkimo akimirką.",
        ],
      },
      {
        heading: "Kada verta parašyti mums",
        paragraphs: [
          "Jei užsakymas paskyroje nerodomas teisingai, nerandi sąskaitos arba neatsidaro atsisiuntimas, susisiek su mūsų komanda ir pridėk užsakymo numerį.",
        ],
      },
    ],
    cta: { label: "Open profile", to: "/profile" },
  },
  memberPricing: {
    title: "Member pricing",
    eyebrow: "Services",
    summary:
      "Narystės sluoksnis sukurtas tam, kad nuolatiniai klientai gautų ankstesnę prieigą, aiškesnę vertę ir švelnesnę kainodarą be agresyvių nuolaidų kultūros.",
    lastUpdated: "April 28, 2026",
    highlights: [
      "Ankstyva prieiga prie selected drops",
      "Specialūs membership tarifai, kai taikoma",
      "Aiškus planų palyginimas pricing puslapyje",
    ],
    sections: [
      {
        heading: "Kaip veikia narystės kaina",
        paragraphs: [
          "Kai kuriems produktams ar kolekcijoms gali būti taikomi member-only tarifai, ankstyvos prieigos langai arba papildomi vertės paketai.",
          "Aktualius planus, įtrauktas naudas ir jų kainas visada rasi membership puslapyje prieš priimdamas sprendimą.",
        ],
      },
      {
        heading: "Ko tikėtis iš narystės",
        bullets: [
          "ramesnės, geriau atrinktos kolekcijos patirties",
          "ankstesnės prieigos prie naujų pasiūlymų",
          "aiškaus, be triukų pateikto plano",
        ],
      },
      {
        heading: "Svarbi pastaba",
        paragraphs: [
          "Narystės kainodara gali būti atnaujinama augant kolekcijai ar paslaugų apimčiai, tačiau nauji tarifai visada aiškiai nurodomi prieš pratęsimą arba naują pirkimą.",
        ],
      },
    ],
    cta: { label: "View membership", to: "/pricing" },
  },
  privateSupport: {
    title: "Private support",
    eyebrow: "Services",
    summary:
      "Jei reikia pagalbos dėl užsakymo, atsisiuntimo ar paskyros, Stilloak Studio support siekia atsakyti aiškiai, žmogiškai ir be papildomo triukšmo.",
    lastUpdated: "April 28, 2026",
    highlights: [
      "Pagalba dėl užsakymų ir atsisiuntimų",
      "Aiškus atsakymas dėl grąžinimų ar mokėjimų",
      "Kontaktas el. paštu darbo valandomis",
    ],
    sections: [
      {
        heading: "Kaip susisiekti",
        paragraphs: [
          "Rašyk mums el. paštu hello@stilloakstudio.com ir pridėk savo užsakymo numerį, jei klausimas susijęs su konkrečiu pirkimu.",
          "Standartinis atsakymo laikas yra per 1–2 darbo dienas. Sudėtingesniais atvejais galime paprašyti papildomos informacijos, kad problemą išspręstume tiksliai.",
        ],
      },
      {
        heading: "Kuo galime padėti",
        bullets: [
          "mokėjimo ir checkout klausimais",
          "užsakymo būsenos patikslinimu",
          "sąskaitos ar atsisiuntimo prieiga",
          "grąžinimo ar keitimo proceso paaiškinimu",
        ],
      },
      {
        heading: "Ko paprastai prireikia",
        paragraphs: [
          "Kad galėtume padėti greičiau, laiške nurodyk vardą, el. paštą, užsakymo numerį ir trumpą problemos aprašymą.",
        ],
      },
    ],
    cta: { label: "Contact us", to: "/contact" },
  },
  contact: {
    title: "Contact",
    eyebrow: "Client care",
    summary:
      "Jei turi klausimą dėl užsakymo, skaitmeninio atsisiuntimo, narystės ar bendro bendradarbiavimo, Stilloak Studio komanda pasiruošusi padėti aiškiai ir be bereikalingo triukšmo.",
    lastUpdated: "April 28, 2026",
    highlights: [
      "Atsakymas per 1–2 darbo dienas",
      "Pagalba dėl fizinių ir skaitmeninių produktų",
      "Kontaktas el. paštu ir aiškus support kelias",
    ],
    sections: [
      {
        heading: "Pagrindinis kontaktas",
        paragraphs: [
          "Rašyk mums el. paštu hello@stilloakstudio.com. Jei klausimas susijęs su konkrečiu pirkimu, pridėk užsakymo numerį ir trumpą situacijos aprašymą.",
          "Jei kreipiesi dėl skaitmeninio produkto, mums ypač padeda nurodyti, kuris failas neatsidaro arba kurio atsisiuntimo nerandi.",
        ],
      },
      {
        heading: "Kada dirbame",
        bullets: [
          "Pirmadienis–penktadienis: 9:00–18:00",
          "Savaitgaliais atsakome rečiau, bet skubius klausimus peržiūrime kaip įmanoma greičiau",
          "Bendras atsakymo laikas: 1–2 darbo dienos",
        ],
      },
      {
        heading: "Klausimų tipai",
        bullets: [
          "mokėjimai ir checkout",
          "fizinių prekių pristatymas",
          "skaitmeninių failų prieiga",
          "narystės planai ir sąskaitos",
          "bendradarbiavimas ar brand partnerystės",
        ],
      },
      {
        heading: "Studijos lokacija",
        paragraphs: [
          "Stilloak Studio dirba internetu, o administracinis kontaktas šiuo metu valdomas iš Vilniaus, Lietuvoje.",
        ],
      },
    ],
    cta: { label: "Write to support", to: "/private-support" },
  },
  shipping: {
    title: "Shipping",
    eyebrow: "Client care",
    summary:
      "Fiziniai ir skaitmeniniai produktai Stilloak Studio svetainėje apdorojami skirtingai, todėl pristatymo logika visada aiškiai rodoma checkout metu.",
    lastUpdated: "April 28, 2026",
    highlights: [
      "Skaitmeniniams produktams pristatymas netaikomas",
      "Fiziniams produktams kaina rodoma checkout suvestinėje",
      "Pristatymo informacija lieka ir tavo paskyroje",
    ],
    sections: [
      {
        heading: "Fiziniai produktai",
        paragraphs: [
          "Fiziniai užsakymai paprastai paruošiami per 1–3 darbo dienas, nebent produkto puslapyje nurodyta kitaip.",
          "Pristatymo mokestis ir galutinis užsakymo laikas pateikiami checkout metu prieš apmokėjimą.",
        ],
      },
      {
        heading: "Skaitmeniniai produktai",
        paragraphs: [
          "Skaitmeniniams produktams pristatymo mokestis netaikomas. Po apmokėjimo failai tampa pasiekiami profilyje, o kai el. pašto siuntimas sukonfigūruotas, jie gali būti pristatyti ir tiesiai į el. paštą.",
        ],
      },
      {
        heading: "Vėlavimai",
        paragraphs: [
          "Jei pristatymas vėluoja dėl kurjerių apkrovos, švenčių ar nenumatytų aplinkybių, apie tai informuosime kaip įmanoma greičiau.",
        ],
      },
    ],
    cta: { label: "Browse products", to: "/shop" },
  },
  returns: {
    title: "Returns",
    eyebrow: "Client care",
    summary:
      "Siekiame, kad grąžinimų politika būtų aiški ir sąžininga tiek fiziniams, tiek skaitmeniniams produktams.",
    lastUpdated: "April 28, 2026",
    highlights: [
      "Fizinius produktus galima grąžinti per 14 dienų",
      "Skaitmeniniai produktai paprastai negrąžinami po prieigos suteikimo",
      "Visais atvejais svarbu pateikti užsakymo numerį",
    ],
    sections: [
      {
        heading: "Fiziniai produktai",
        paragraphs: [
          "Jei nori grąžinti fizinį produktą, parašyk mums per 14 kalendorinių dienų nuo pristatymo dienos. Produktas turi būti nenaudotas, nepažeistas ir grąžinamas saugioje pakuotėje.",
        ],
      },
      {
        heading: "Skaitmeniniai produktai",
        paragraphs: [
          "Dėl savo pobūdžio skaitmeniniai produktai paprastai nėra grąžinami po to, kai suteikiama atsisiuntimo prieiga. Jei failas sugadintas, neatsidaro arba gavai ne tą produktą, susisiek su mumis ir spręsime problemą individualiai.",
        ],
      },
      {
        heading: "Refund eiga",
        paragraphs: [
          "Patvirtinus grąžinimą, lėšos į pradinį mokėjimo metodą grąžinamos pagal mokėjimo tiekėjo terminus. Tiksli grąžinimo trukmė priklauso nuo tavo banko ar kortelės išdavėjo.",
        ],
      },
    ],
    cta: { label: "Need support?", to: "/private-support" },
  },
  privacy: {
    title: "Privacy",
    eyebrow: "Client care",
    summary:
      "Stilloak Studio renka tik tuos duomenis, kurių reikia užsakymams, paskyrai ir saugesnei pirkimo patirčiai užtikrinti.",
    lastUpdated: "April 28, 2026",
    highlights: [
      "Tvarkome paskyros ir užsakymo duomenis",
      "Mokėjimus apdoroja Stripe",
      "Nenaudojame duomenų daugiau, nei reikia paslaugai suteikti",
    ],
    sections: [
      {
        heading: "Kokius duomenis renkame",
        bullets: [
          "vardą ir el. paštą paskyrai bei užsakymams",
          "pristatymo informaciją fiziniams produktams",
          "užsakymo ir sąskaitos istoriją",
          "techninius duomenis, reikalingus prisijungimui ir saugumui",
        ],
      },
      {
        heading: "Kam naudojame duomenis",
        paragraphs: [
          "Duomenys naudojami užsakymams vykdyti, mokėjimams apdoroti, skaitmeniniams produktams pristatyti, paskyros funkcijoms palaikyti ir klientų aptarnavimui.",
        ],
      },
      {
        heading: "Trečiosios šalys",
        paragraphs: [
          "Mokėjimo duomenis apdoroja Stripe. Svetainės veikimui ir hostinimui naudojame išorines platformas, kurios padeda saugiai pateikti paslaugą, tačiau jos tvarko tik būtinus duomenis.",
        ],
      },
      {
        heading: "Tavo pasirinkimai",
        paragraphs: [
          "Gali kreiptis į mus dėl savo paskyros duomenų patikslinimo ar pašalinimo, jei tai neprieštarauja mūsų apskaitos ir užsakymų saugojimo prievolėms.",
        ],
      },
    ],
    cta: { label: "Contact support", to: "/private-support" },
  },
  terms: {
    title: "Terms",
    eyebrow: "Client care",
    summary:
      "Naudodamasis Stilloak Studio svetaine ir pirkdamas produktus sutinki su toliau pateiktomis pagrindinėmis naudojimo ir pirkimo sąlygomis.",
    lastUpdated: "April 28, 2026",
    highlights: [
      "Produktų kainos ir aprašymai gali būti atnaujinami",
      "Skaitmeniniai failai skirti asmeniniam naudojimui",
      "Paskyros ir užsakymo duomenys turi būti pateikti tiksliai",
    ],
    sections: [
      {
        heading: "Pirkimai ir kainos",
        paragraphs: [
          "Visos kainos ir produktų aprašymai gali būti atnaujinami be išankstinio įspėjimo, tačiau už jau patvirtintą ir apmokėtą užsakymą taikoma checkout metu parodyta kaina.",
        ],
      },
      {
        heading: "Skaitmeninių produktų licencija",
        paragraphs: [
          "Skaitmeniniai produktai parduodami asmeniniam naudojimui, jei aiškiai nenurodyta kitaip. Jų negalima perparduoti, dalinti viešai ar naudoti kaip savo kūrinio be leidimo.",
        ],
      },
      {
        heading: "Paskyros atsakomybė",
        paragraphs: [
          "Klientas atsako už tai, kad registracijos ir užsakymo duomenys būtų tikslūs, ypač el. paštas, pristatymo adresas ir mokėjimo informacija.",
        ],
      },
      {
        heading: "Paslaugos prieinamumas",
        paragraphs: [
          "Stengiamės užtikrinti stabilų svetainės veikimą, tačiau kartais gali pasitaikyti techninių atnaujinimų, trečiųjų šalių sutrikimų ar laikino neprieinamumo.",
        ],
      },
      {
        heading: "Susisiekimas",
        paragraphs: [
          "Jei turi klausimų dėl šių sąlygų, parašyk mums prieš pirkdamas. Mums svarbiau aiškumas ir pasitikėjimas nei painios formuluotės.",
        ],
      },
    ],
    cta: { label: "Back to home", to: "/" },
  },
};
