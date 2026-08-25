import { missingRequiredProviderFields, serviceProvider } from "../config/legal";

const updated = "2026-08-24";
const supportEmail = serviceProvider.supportEmail;
const publicEmail = serviceProvider.email;

const providerNotice = missingRequiredProviderFields.length
  ? [
      "Paslaugos teikėjo rekvizitai dar nepilni. Pardavimų paleidimui savininkas turi pateikti realų pavadinimą arba vardą, veiklos formą, registracijos arba individualios veiklos numerį, veiklos adresą ir viešą kontaktą.",
    ]
  : [];

const providerBullets = [
  serviceProvider.name ? `Paslaugos teikėjas: ${serviceProvider.name}` : "Paslaugos teikėjo pavadinimas dar nepaskelbtas.",
  serviceProvider.type ? `Veiklos forma: ${serviceProvider.type}` : "Veiklos forma dar nepaskelbta.",
  serviceProvider.code ? `Kodas / individualios veiklos numeris: ${serviceProvider.code}` : "Juridinio asmens arba individualios veiklos numeris dar nepaskelbtas.",
  serviceProvider.vatCode ? `PVM mokėtojo kodas: ${serviceProvider.vatCode}` : "PVM mokėtojo kodas nepaskelbtas arba netaikomas.",
  serviceProvider.address ? `Registruotos veiklos adresas: ${serviceProvider.address}` : "Registruotos veiklos adresas dar nepaskelbtas.",
  `Viešas kontaktas: ${publicEmail}`,
  `Pagalba: ${supportEmail}`,
  serviceProvider.phone ? `Telefonas: ${serviceProvider.phone}` : "Telefonas viešai nepaskelbtas.",
  `Svetainė: ${serviceProvider.website}`,
  `Dokumentų versija: ${serviceProvider.documentVersion}`,
];

export const serviceLinks = [
  { label: "Prenumeratos sąlygos", to: "/subscription-terms" },
  { label: "Atšaukimo tvarka", to: "/subscription-cancellation" },
  { label: "Sąskaitos ir mokėjimai", to: "/secure-checkout" },
  { label: "Pagalba", to: "/private-support" },
];

export const clientCareLinks = [
  { label: "Privatumo politika", to: "/privacy" },
  { label: "Slapukai ir saugykla", to: "/cookie-policy" },
  { label: "Grąžinimo tvarka", to: "/refund-policy" },
  { label: "Naudojimo sąlygos", to: "/terms" },
];

export const houseLinks = [
  { label: "Istorija", to: "/story" },
  { label: "Narystė", to: "/pricing" },
  { label: "Kontaktai", to: "/contact" },
];

export const infoPages = {
  secureCheckout: {
    title: "Saugus apmokėjimas",
    eyebrow: "Pasitikėjimas",
    summary: "Mokėjimai vykdomi per Stripe. Stilloak Studio nekaupia pilnų kortelės duomenų.",
    lastUpdated: updated,
    highlights: ["Stripe Checkout", "Sąskaitų peržiūra profilyje", "Webhook būsenų sinchronizavimas"],
    sections: [
      {
        heading: "Kaip vyksta mokėjimas",
        paragraphs: [
          "Prenumeratos ir vienkartiniai skaitmeniniai produktai nukreipiami į Stripe Checkout. Serveris pats parenka planą arba produktą pagal patvirtintą konfigūraciją ir nepriima kliento siunčiamos kainos ar Stripe Price ID kaip autoritetingų duomenų.",
          "Po mokėjimo Stripe webhook atnaujina prenumeratos, mokėjimo arba skaitmeninio produkto pirkimo būseną. Profilio puslapyje vartotojas gali matyti prenumeratos sąskaitų santrauką, kai ji prieinama per Stripe.",
        ],
      },
      {
        heading: "Saugumo ribos",
        paragraphs: [
          "Pilnų kortelės duomenų sistema nesaugo. Mokėjimo įrašams saugomi tik tokie techniniai identifikatoriai ir būsenos, kurių reikia užsakymui, prenumeratai, sąskaitoms, auditui ir pagalbai.",
        ],
      },
    ],
    cta: { label: "Atidaryti prenumeratas", to: "/pricing" },
  },
  receiptArchive: {
    title: "Sąskaitų archyvas",
    eyebrow: "Paskyra",
    summary: "Profilio puslapyje vartotojas gali peržiūrėti užsakymus, skaitmeninių produktų prieigą ir Stripe prenumeratos sąskaitų santrauką.",
    lastUpdated: updated,
    highlights: ["Užsakymų istorija", "PDF sąskaitos apmokėtiems užsakymams", "Stripe sąskaitų nuorodos"],
    sections: [
      {
        heading: "Kas saugoma",
        bullets: [
          "užsakymo numeris, data, prekės, suma ir mokėjimo būsena",
          "skaitmeninio produkto pirkimo būsena ir prieigos įrašas",
          "Stripe prenumeratos sąskaitų data, suma, valiuta, statusas ir Stripe pateiktos nuorodos",
        ],
      },
      {
        heading: "Kodėl ne viskas ištrinama iš karto",
        paragraphs: [
          "Paskyros ištrynimo atveju dalis finansinių ir apskaitos įrašų gali būti saugoma pagal teisines prievoles arba ginčo sprendimo poreikį. Todėl neteigiame, kad visi pirkimo duomenys visada nedelsiant pašalinami.",
        ],
      },
    ],
    cta: { label: "Atidaryti profilį", to: "/profile" },
  },
  memberPricing: {
    title: "Nario kainodara",
    eyebrow: "Planai",
    summary: "Demo yra nemokamas, Asmeninis kainuoja 14,99 €/mėn., Verslas kainuoja 44,99 €/mėn.",
    lastUpdated: updated,
    highlights: ["Demo 0 €", "Asmeninis 14,99 €/mėn.", "Verslas 44,99 €/mėn."],
    sections: [
      {
        heading: "Planai",
        bullets: [
          "Demo / basic: nemokamas internal planas be Stripe Checkout.",
          "Asmeninis / personal: mokamas Stripe planas, 14,99 €/mėn.",
          "Verslas / private_business: mokamas Stripe planas, 44,99 €/mėn.; šiame etape jo funkcijos nekeistos.",
        ],
      },
      {
        heading: "Prieš mokėjimą",
        paragraphs: [
          "Prieš mokamą Stripe Checkout vartotojui parodomas planas, mėnesio kaina, automatinis atnaujinimas, atšaukimo galimybė ir nuoroda į prenumeratos sąlygas.",
        ],
      },
    ],
    cta: { label: "Peržiūrėti planus", to: "/pricing" },
  },
  privateSupport: {
    title: "Pagalba",
    eyebrow: "Kontaktas",
    summary: "Dėl paskyros, prenumeratos, mokėjimo, sąskaitos ar skaitmeninio produkto prieigos rašykite pagalbos el. paštu.",
    lastUpdated: updated,
    highlights: ["Pagalba el. paštu", "Užsakymo numeris pagreitina patikrą", "Atsakymai teikiami darbo metu"],
    sections: [
      {
        heading: "Kaip kreiptis",
        paragraphs: [
          `Rašykite el. paštu ${supportEmail}. Jei klausimas susijęs su mokėjimu ar produktu, pridėkite užsakymo numerį, paskyros el. paštą ir trumpą problemos aprašymą.`,
        ],
      },
    ],
    cta: { label: "Kontaktai", to: "/contact" },
  },
  contact: {
    title: "Kontaktai ir paslaugos teikėjas",
    eyebrow: "Rekvizitai",
    summary: "Čia pateikiami vieši kontaktai ir paslaugos teikėjo informacija. Nepilni rekvizitai reiškia, kad pardavimų paleidimui dar reikia savininko duomenų.",
    lastUpdated: updated,
    highlights: ["Viešas kontaktas", "Pagalbos kontaktas", "Rekvizitų būsena"],
    sections: [
      {
        heading: "Paslaugos teikėjo informacija",
        paragraphs: providerNotice,
        bullets: providerBullets,
      },
      {
        heading: "Duomenų ir teisių užklausos",
        paragraphs: [
          `Privatumo, duomenų eksporto, taisymo, apribojimo, prieštaravimo ar paskyros ištrynimo klausimais kreipkitės ${supportEmail}.`,
        ],
      },
    ],
    cta: { label: "Privatumo politika", to: "/privacy" },
  },
  shipping: {
    title: "Pristatymas",
    eyebrow: "Produktai",
    summary: "Aktyvūs vieši produktai šiame etape yra skaitmeniniai failai; fizinio pristatymo srautas paliktas tik esamai užsakymų architektūrai.",
    lastUpdated: updated,
    highlights: ["Skaitmeniniams produktams pristatymas netaikomas", "Prieiga po apmokėjimo", "Failai pasiekiami prisijungus"],
    sections: [
      {
        heading: "Skaitmeniniai produktai",
        paragraphs: [
          "Skaitmeniniams produktams fizinis pristatymas netaikomas. Po sėkmingo mokėjimo prieiga susiejama su vartotojo paskyra ir produktas atsisiunčiamas prisijungus.",
        ],
      },
    ],
    cta: { label: "Skaitmeniniai produktai", to: "/digital-products" },
  },
  returns: {
    title: "Grąžinimai",
    eyebrow: "Pagalba",
    summary: "Šis puslapis nukreipia į pilną grąžinimo ir pinigų grąžinimo tvarką.",
    lastUpdated: updated,
    highlights: ["Atskiriama prenumerata ir grąžinimas", "Išsaugomos vartotojo teisės", "Techninės problemos peržiūrimos individualiai"],
    sections: [
      {
        heading: "Tvarka",
        paragraphs: [
          "Prenumeratos atšaukimas ateičiai, teisė atsisakyti nuotolinės sutarties, pinigų grąžinimo prašymas ir techninės problemos nėra tas pats. Pilna tvarka pateikta grąžinimo politikos puslapyje.",
        ],
      },
    ],
    cta: { label: "Grąžinimo politika", to: "/refund-policy" },
  },
  refundPolicy: {
    title: "Grąžinimo ir pinigų grąžinimo tvarka",
    eyebrow: "Teisinė informacija",
    summary: "Grąžinimo tvarka atskiria prenumeratos atšaukimą, vartotojo atsisakymo teisę, pinigų grąžinimo prašymą ir technines problemas.",
    lastUpdated: updated,
    highlights: ["Ne visi mokėjimai automatiškai negrąžinami", "Teisės vertinamos pagal situaciją", "Techninės problemos sprendžiamos per pagalbą"],
    sections: [
      {
        heading: "Prenumerata",
        paragraphs: [
          "Prenumeratą galima atšaukti ateičiai per Stripe Customer Portal. Tai paprastai sustabdo kitą apmokestinimą, bet savaime nereiškia automatinio jau apmokėto laikotarpio grąžinimo.",
        ],
      },
      {
        heading: "Skaitmeninis turinys",
        paragraphs: [
          "Prieš skaitmeninio produkto checkout prašomas atskiras sutikimas pradėti turinio teikimą iškart. Pradėjus teikimą vartotojas gali prarasti teisę atsisakyti sutarties, kiek tai leidžia taikoma teisė. Jei produktas techniškai neveikia, nepateikiamas ar pateiktas ne tas produktas, kreipkitės pagalbos per protingą terminą.",
        ],
      },
      {
        heading: "Prašymo pateikimas",
        paragraphs: [
          `Pinigų grąžinimo ar techninės problemos prašymą siųskite ${supportEmail}, nurodydami paskyros el. paštą, mokėjimo arba užsakymo datą ir problemos aprašymą.`,
        ],
      },
    ],
    cta: { label: "Susisiekti", to: "/contact" },
  },
  digitalDownloadPolicy: {
    title: "Skaitmeninio turinio sąlygos",
    eyebrow: "Teisinė informacija",
    summary: "Skaitmeniniai produktai yra mokami Excel failai, suteikiami per vartotojo paskyrą po sėkmingo Stripe mokėjimo.",
    lastUpdated: updated,
    highlights: ["Atskiras sutikimas prieš checkout", "Prieiga po mokėjimo", "Asmeninio naudojimo licencija"],
    sections: [
      {
        heading: "Produktų formatas",
        paragraphs: [
          "Vieši skaitmeniniai produktai šiame etape yra XLSX / Excel failai. Produkto kortelėje rodoma kaina, formatas, pagrindinės savybės, versija ir atsisiuntimo sąlygos.",
        ],
      },
      {
        heading: "Prieigos suteikimas",
        paragraphs: [
          "Po sėkmingo Stripe mokėjimo serveris sukuria arba atnaujina pirkimo įrašą ir susieja produktą su vartotoju. Failas pasiekiamas tik prisijungus prie tos paskyros.",
        ],
      },
      {
        heading: "Licencija",
        paragraphs: [
          "Skaitmeniniai produktai skirti asmeniniam naudojimui, nebent konkrečiame pasiūlyme aiškiai nurodyta kitaip. Jų negalima perparduoti, viešai platinti ar pateikti kaip savo produkto be raštiško leidimo.",
        ],
      },
    ],
    cta: { label: "Grąžinimo tvarka", to: "/refund-policy" },
  },
  privacy: {
    title: "Privatumo politika",
    eyebrow: "Teisinė informacija",
    summary: "Privatumo politika aprašo, kokie duomenys tvarkomi paskyrai, Saving Studio, mokėjimams, skaitmeniniams produktams, laiškams ir saugumui.",
    lastUpdated: updated,
    highlights: ["Paskyros ir autentifikacijos duomenys", "Saving Studio finansiniai duomenys", "Stripe, MongoDB, Vercel, Render ir Brevo/SMTP"],
    sections: [
      {
        heading: "Duomenų valdytojas ir kontaktas",
        paragraphs: [
          ...providerNotice,
          `Privatumo užklausoms naudokite ${supportEmail}. Dokumentų versija: ${serviceProvider.documentVersion}.`,
        ],
      },
      {
        heading: "Kokius duomenis renkame",
        bullets: [
          "registracijos duomenis: vardą, el. paštą, slaptažodžio hash, el. pašto patvirtinimo būseną ir sesijos versiją",
          "Saving Studio duomenis: profilį, pajamas, išlaidas, biudžetus, tikslus, pasikartojančias išlaidas, audit logus ir eksportų metaduomenis",
          "mokėjimų ir prenumeratų duomenis: planą, būseną, periodą, Stripe klientų / sesijų / sąskaitų / mokėjimo identifikatorius",
          "skaitmeninių produktų pirkimus: vartotoją, produktą, sumą, valiutą, būseną ir Stripe sesijos ryšį",
          "transakcinių laiškų metaduomenis: laiško tipą, dedupe būseną, siuntimo rezultatą ir klaidos santrauką be paslapčių",
          "techninius logus ir saugumo duomenis: IP pagrindu veikiančius limiterius, request būsenas, webhook įvykių apdorojimą ir klaidų informaciją",
          "sutikimu istorija: sutikimo tipas, dokumentu versija, serverio priemimo laikas, susijes planas arba produktas ir sutikimo / checkout busena",
        ],
      },
      {
        heading: "Tikslai ir galimi teisiniai pagrindai",
        bullets: [
          "sutarties vykdymas: paskyra, prenumerata, skaitmeninis produktas, sąskaitos ir pagalba",
          "teisinė prievolė: finansinių ir apskaitos įrašų saugojimas",
          "teisėtas interesas: saugumas, sukčiavimo prevencija, paslaugos stabilumas ir ginčų sprendimas",
          "sutikimas: registracijos dokumentų patvirtinimas, skaitmeninio turinio pradėjimas iškart, nebūtina analitika ir reklamos konversijų matavimas",
        ],
      },
      {
        heading: "Duomenų gavėjai ir tvarkytojai",
        bullets: [
          "Stripe - mokėjimai, prenumeratos, sąskaitos ir Customer Portal",
          "MongoDB Atlas - duomenų bazės talpinimas",
          "Render - backend talpinimas pagal projekto konfigūraciją",
          "Vercel - frontend talpinimas pagal projekto dokumentaciją",
          "Brevo arba SMTP tiekėjas - transakciniai el. laiškai ir, jei naudojama, launch soon kontaktų sąrašas",
          "Google Analytics, Google Ads arba Meta Pixel - tik jei sukonfigūruoti vieši matavimo ID ir vartotojas duoda atitinkamą sutikimą",
        ],
      },
      {
        heading: "Tarptautiniai perdavimai ir saugojimas",
        paragraphs: [
          "Kai naudojami Stripe, MongoDB Atlas, Render, Vercel ar Brevo, duomenys gali būti tvarkomi už Lietuvos arba EEE ribų pagal tų tiekėjų infrastruktūrą ir sutartinius mechanizmus. Galutinę produkcinę tiekėjų, regionų ir perdavimo mechanizmų informaciją turi patvirtinti savininkas.",
          "Paskyros duomenys saugomi, kol paskyra aktyvi arba reikalinga pagalbai, saugumui ar teisinių reikalavimų vykdymui. Finansiniai įrašai gali būti saugomi ilgiau pagal apskaitos ir teisinių prievolių kriterijus.",
        ],
      },
      {
        heading: "Jūsų teisės",
        paragraphs: [
          "Galite prašyti prieigos, taisymo, duomenų eksporto, ištrynimo, tvarkymo apribojimo arba prieštarauti tvarkymui, kai tai taikoma. Profilio puslapyje yra duomenų eksportas ir saugus paskyros ištrynimo srautas. Taip pat galite kreiptis į Valstybinę duomenų apsaugos inspekciją.",
        ],
      },
      {
        heading: "Pakeitimai",
        paragraphs: [
          "Politika gali būti atnaujinama pasikeitus funkcijoms, tiekėjams arba teisiniams reikalavimams. Reikšmingi pakeitimai turi būti aiškiai paskelbti prieš jiems pradedant galioti.",
        ],
      },
    ],
    cta: { label: "Duomenų subjektų teisės", to: "/data-rights" },
  },
  cookiePolicy: {
    title: "Slapukų ir naršyklės saugyklos politika",
    eyebrow: "Teisinė informacija",
    summary:
      "Nebūtina analitika ir reklamos konversijų matavimas įkeliami tik tada, kai sukonfigūruoti vieši matavimo ID ir vartotojas duoda atitinkamą sutikimą. Naudojama naršyklės saugykla autentifikacijai, krepšeliui, kalbai, temai ir produkto UI būsenoms.",
    lastUpdated: "2026-08-25",
    highlights: ["JWT localStorage nėra slapukas", "Analitika blokuojama iki sutikimo", "Reklamos konversijos matuojamos tik su marketing sutikimu"],
    sections: [
      {
        heading: "Kas naudojama dabar",
        bullets: [
          "localStorage: manoshop_token ir manoshop_user autentifikacijai; tai nėra slapukai, bet yra naršyklės saugykloje laikomi autentifikavimo duomenys",
          "localStorage: krepšelio turinys, kalbos pasirinkimas, temos pasirinkimas ir kai kurios Saving Studio / Demo UI būsenos",
          "localStorage: stilloak_cookie_consent įrašo vartotojo pasirinkimą dėl nebūtinų kategorijų",
          "sessionStorage ir document.cookie naudojimo aktyviame client/src kode nerasta",
        ],
      },
      {
        heading: "Slapukai ir trečiųjų šalių skriptai",
        paragraphs: [
          "Google Analytics gali būti naudojama puslapių peržiūroms tik su analitikos sutikimu ir tik jei sukonfigūruotas viešas VITE_GA_MEASUREMENT_ID. Google Ads ir Meta Pixel konversijos gali būti naudojamos tik su marketing sutikimu ir tik jei sukonfigūruoti vieši matavimo ID.",
          "Be atitinkamo sutikimo šie trečiųjų šalių skriptai neįkeliami. Jei vartotojas atmeta nebūtinuosius slapukus, produktas turi toliau veikti be analitikos ir reklamos matavimo.",
          "Stripe Checkout veikia nukreipiant į Stripe mokėjimo aplinką, o Vercel / Render infrastruktūra gali turėti techninius logus paslaugos veikimui.",
        ],
      },
    ],
    cta: { label: "Privatumo politika", to: "/privacy" },
  },
  subscriptionTerms: {
    title: "Prenumeratos sąlygos",
    eyebrow: "Teisinė informacija",
    summary: "Asmeninis kainuoja 14,99 €/mėn., Verslas - 44,99 €/mėn., Demo yra nemokamas.",
    lastUpdated: updated,
    highlights: ["Automatinis atnaujinimas per Stripe", "Atšaukimas per Customer Portal", "Prieiga pagal Stripe būseną"],
    sections: [
      {
        heading: "Planai ir kainos",
        bullets: [
          "Demo: 0 €, nemokamas internal planas.",
          "Asmeninis: 14,99 €/mėn., mokamas Stripe prenumeratos planas.",
          "Verslas: 44,99 €/mėn., mokamas Stripe prenumeratos planas; jo funkcijos šiame etape nekeistos.",
        ],
      },
      {
        heading: "Apmokestinimas ir prieiga",
        paragraphs: [
          "Mokama prenumerata apmokestinama kas mėnesį ir automatiškai atnaujinama, jei Stripe konfigūracija aktyvi ir prenumerata neatšaukta. Prieiga suteikiama po sėkmingo Stripe mokėjimo arba Stripe webhook patvirtinimo.",
        ],
      },
      {
        heading: "Stripe būsenų poveikis",
        bullets: [
          "active ir trialing: mokamos funkcijos prieinamos.",
          "past_due, unpaid, incomplete, incomplete_expired, paused, inactive ir canceled: mokama prieiga nesuteikiama arba gali būti sustabdyta.",
          "cancelAtPeriodEnd: prenumerata suplanuota atšaukti periodo pabaigoje; prieiga paprastai išlieka iki apmokėto periodo pabaigos, jei būsena active arba trialing.",
        ],
      },
      {
        heading: "Sąskaitos, nepavykę mokėjimai ir pakeitimai",
        paragraphs: [
          "Sąskaitų santrauka rodoma profilyje, kai ją galima gauti iš Stripe. Nepavykus mokėjimui, Stripe ir sistema gali pažymėti būseną past_due, unpaid arba panašią, o prieiga gali būti apribota. Apie kainos ar esminių sąlygų pakeitimus turi būti informuojama aiškiai prieš jų taikymą, kiek to reikalauja teisė ir Stripe / produkto konfigūracija.",
        ],
      },
    ],
    cta: { label: "Atšaukimo tvarka", to: "/subscription-cancellation" },
  },
  subscriptionCancellation: {
    title: "Prenumeratos atšaukimo tvarka",
    eyebrow: "Teisinė informacija",
    summary: "Prenumerata valdoma per Stripe Customer Portal profilio puslapyje.",
    lastUpdated: updated,
    highlights: ["Customer Portal", "cancelAtPeriodEnd", "Prieigos pabaiga"],
    sections: [
      {
        heading: "Kaip atšaukti",
        paragraphs: [
          "Prisijunkite, atidarykite Profilį ir spauskite prenumeratos savitarnos mygtuką. Stripe Customer Portal leidžia valdyti mokėjimo metodą, sąskaitas ir prenumeratos atšaukimą, kai Stripe funkcija sukonfigūruota.",
        ],
      },
      {
        heading: "Kas vyksta po atšaukimo",
        paragraphs: [
          "Jei Stripe grąžina cancelAtPeriodEnd, prenumerata laikoma suplanuota atšaukti periodo pabaigoje. Jei statusas tampa canceled, mokama prieiga nebesuteikiama. Profilio tekstai rodo faktinę serverio sinchronizuotą būseną.",
        ],
      },
    ],
    cta: { label: "Atidaryti profilį", to: "/profile" },
  },
  dataRights: {
    title: "Duomenų subjekto teisės ir paskyros ištrynimas",
    eyebrow: "Teisinė informacija",
    summary: "Profilio puslapyje yra duomenų eksportas ir saugus paskyros ištrynimas. Kai kurie finansiniai įrašai gali būti saugomi pagal teisines prievoles.",
    lastUpdated: updated,
    highlights: ["Duomenų eksportas", "Paskyros ištrynimas", "Finansinių įrašų saugojimo išimtis"],
    sections: [
      {
        heading: "Savitarna",
        paragraphs: [
          "Prisijungęs vartotojas gali atsisiųsti paskyros duomenų eksportą ir inicijuoti paskyros ištrynimą profilyje. Ištrynimui reikia slaptažodžio ir aiškaus patvirtinimo teksto.",
        ],
      },
      {
        heading: "Kas ištrinama ir kas gali likti",
        paragraphs: [
          "Saving Studio profilis, įrašai, biudžetai, tikslai, pasikartojančios išlaidos ir audit logai šalinami pagal paskyros savininką. Vartotojo įrašas anonimizuojamas. Užsakymai, mokėjimai, prenumeratos, skaitmeninių produktų pirkimai, sąskaitų numeriai, sumos, datos ir būsenos gali būti laikinai saugomi dėl apskaitos, audito, ginčų ar teisinių prievolių.",
        ],
      },
      {
        heading: "Kreipimasis",
        paragraphs: [
          `Jei savitarnos nepakanka arba norite pasinaudoti kitomis teisėmis, rašykite ${supportEmail}.`,
        ],
      },
    ],
    cta: { label: "Atidaryti profilį", to: "/profile" },
  },
  terms: {
    title: "Naudojimo sąlygos",
    eyebrow: "Teisinė informacija",
    summary: "Šios sąlygos aprašo paskyros, Saving Studio, prenumeratų, skaitmeninių produktų, atsakomybės ir pagalbos pagrindus.",
    lastUpdated: updated,
    highlights: ["Paskyros duomenys turi būti tikslūs", "Mokamos funkcijos priklauso nuo plano", "Nėra absoliutaus nepertraukiamo veikimo pažado"],
    sections: [
      {
        heading: "Paskyra ir naudojimas",
        paragraphs: [
          "Vartotojas atsako už tikslius registracijos duomenis, slaptažodžio saugumą ir tai, kad paskyra nebūtų naudojama neteisėtiems veiksmams. Sistema gali reikalauti el. pašto patvirtinimo prieš mokamus checkout srautus.",
        ],
      },
      {
        heading: "Saving Studio ir finansiniai duomenys",
        paragraphs: [
          "Saving Studio yra planavimo ir analizės įrankis. Jis nepakeičia individualios finansų, mokesčių ar teisinės konsultacijos. Skaičiavimai remiasi vartotojo įvestais duomenimis ir sistemos formulėmis.",
        ],
      },
      {
        heading: "Paslaugos prieinamumas",
        paragraphs: [
          "Siekiame stabilaus veikimo, bet negalime žadėti absoliutaus nepertraukiamo pasiekiamumo. Gali būti techninių atnaujinimų, trečiųjų šalių sutrikimų, Stripe, hostingo arba duomenų bazės incidentų.",
        ],
      },
      {
        heading: "Mokėjimai, prenumeratos ir skaitmeninis turinys",
        paragraphs: [
          "Mokamos prenumeratos ir skaitmeniniai produktai aprašomi atskiruose prenumeratos, skaitmeninio turinio ir grąžinimo puslapiuose. Prieš mokamus srautus pateikiamos atitinkamos kainos ir sutikimai.",
        ],
      },
    ],
    cta: { label: "Privatumo politika", to: "/privacy" },
  },
};
