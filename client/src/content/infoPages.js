export const serviceLinks = [
  { label: "Saugus apmokėjimas", to: "/secure-checkout" },
  { label: "Sąskaitų archyvas", to: "/receipt-archive" },
  { label: "Narystė", to: "/member-pricing" },
  { label: "Pagalba", to: "/private-support" },
];

export const clientCareLinks = [
  { label: "Pristatymas", to: "/shipping" },
  { label: "Grąžinimai", to: "/returns" },
  { label: "Privatumas", to: "/privacy" },
  { label: "Taisyklės", to: "/terms" },
];

export const houseLinks = [
  { label: "Istorija", to: "/story" },
  { label: "Narystė", to: "/pricing" },
  { label: "Netrukus", to: "/launch-soon" },
];

export const infoPages = {
  secureCheckout: {
    title: "Saugus apmokėjimas",
    eyebrow: "Paslaugos",
    summary:
      "Apmokėjimas Stilloak Studio svetainėje sukurtas taip, kad jaustųsi ramus, aiškus ir patikimas tiek fiziniams, tiek skaitmeniniams produktams.",
    lastUpdated: "2026 m. balandžio 28 d.",
    highlights: [
      "Saugus kortelių apmokėjimas",
      "Aiškus užsakymo suvestinės peržiūrėjimas prieš mokant",
      "PDF sąskaita ir užsakymo įrašas po pirkimo",
    ],
    sections: [
      {
        heading: "Kaip vyksta apmokėjimas",
        paragraphs: [
          "Mokėjimo metu klientas mato visą užsakymo suvestinę, pasirinktą pristatymo būdą ir galutinę sumą prieš patvirtindamas pirkimą.",
          "Kortelių apmokėjimai vyksta per sertifikuotą mokėjimų partnerį. Stilloak Studio tiesiogiai nekaupia pilnų kortelės duomenų.",
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
    cta: { label: "Peržiūrėti skaitmeninius produktus", to: "/digital-products" },
  },
  receiptArchive: {
    title: "Sąskaitų archyvas",
    eyebrow: "Paslaugos",
    summary:
      "Kiekvienas pirkimas išsaugomas tavo paskyroje, kad bet kada galėtum greitai rasti užsakymo istoriją, PDF sąskaitas ir skaitmeninius atsisiuntimus.",
    lastUpdated: "2026 m. balandžio 28 d.",
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
    cta: { label: "Atidaryti profilį", to: "/profile" },
  },
  memberPricing: {
    title: "Nario kainodara",
    eyebrow: "Paslaugos",
    summary:
      "Narystės sluoksnis sukurtas tam, kad nuolatiniai klientai gautų ankstesnę prieigą, aiškesnę vertę ir švelnesnę kainodarą be agresyvių nuolaidų kultūros.",
    lastUpdated: "2026 m. balandžio 28 d.",
    highlights: [
      "Ankstyva prieiga prie atrinktų atidarymų",
      "Specialūs nario tarifai, kai taikoma",
      "Aiškus planų palyginimas narystės puslapyje",
    ],
    sections: [
      {
        heading: "Kaip veikia narystės kaina",
        paragraphs: [
          "Kai kuriems produktams ar paslaugoms gali būti taikomi nario tarifai, ankstyvos prieigos langai arba papildomi vertės paketai.",
          "Aktualius planus, įtrauktas naudas ir jų kainas visada rasi narystės puslapyje prieš priimdamas sprendimą.",
        ],
      },
      {
        heading: "Ko tikėtis iš narystės",
        bullets: [
          "ramesnės, geriau atrinktos skaitmeninės patirties",
          "ankstesnės prieigos prie naujų pasiūlymų",
          "aiškaus, be triukų pateikto plano",
        ],
      },
      {
        heading: "Svarbi pastaba",
        paragraphs: [
          "Narystės kainodara gali būti atnaujinama augant produktams ar paslaugų apimčiai, tačiau nauji tarifai visada aiškiai nurodomi prieš pratęsimą arba naują pirkimą.",
        ],
      },
    ],
    cta: { label: "Peržiūrėti narystę", to: "/pricing" },
  },
  privateSupport: {
    title: "Privati pagalba",
    eyebrow: "Paslaugos",
    summary:
      "Jei reikia pagalbos dėl užsakymo, atsisiuntimo ar paskyros, Stilloak Studio komanda siekia atsakyti aiškiai, žmogiškai ir be papildomo triukšmo.",
    lastUpdated: "2026 m. balandžio 28 d.",
    highlights: [
      "Pagalba dėl užsakymų ir atsisiuntimų",
      "Aiškus atsakymas dėl grąžinimų ar mokėjimų",
      "Susisiekite el. paštu",
    ],
    sections: [
      {
        heading: "Kaip susisiekti",
        paragraphs: [
"Rašyk mums el. paštu hello@stilloak-studio.com ir pridėk savo užsakymo numerį, jei klausimas susijęs su konkrečiu pirkimu.",
          "Standartinis atsakymo laikas yra per 1–2 darbo dienas. Sudėtingesniais atvejais galime paprašyti papildomos informacijos, kad problemą išspręstume tiksliai.",
        ],
      },
      {
        heading: "Kuo galime padėti",
        bullets: [
          "mokėjimo klausimais",
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
    cta: { label: "Susisiekti", to: "/contact" },
  },
  contact: {
    title: "Kontaktai",
    eyebrow: "Pagalba",
    summary:
      "Jei turi klausimą dėl užsakymo, skaitmeninio atsisiuntimo, narystės ar bendro bendradarbiavimo, Stilloak Studio komanda pasiruošusi padėti aiškiai ir be bereikalingo triukšmo.",
    lastUpdated: "2026 m. balandžio 28 d.",
    highlights: [
      "Atsakymas per 1–2 darbo dienas",
      "Pagalba dėl fizinių ir skaitmeninių produktų",
      "Kontaktas el. paštu ir aiškus pagalbos kelias",
    ],
    sections: [
      {
        heading: "Pagrindinis kontaktas",
        paragraphs: [
"Rašyk mums el. paštu hello@stilloak-studio.com. Jei klausimas susijęs su konkrečiu pirkimu, pridėk užsakymo numerį ir trumpą situacijos aprašymą.",
          "Jei kreipiesi dėl skaitmeninio produkto, mums ypač padeda nurodyti, kuris failas neatsidaro arba kurio atsisiuntimo nerandi.",
        ],
      },
      {
        heading: "Klausimų tipai",
        bullets: [
          "mokėjimai",
          "fizinių prekių pristatymas",
          "skaitmeninių failų prieiga",
          "narystės planai ir sąskaitos",
          "bendradarbiavimas ar studijos partnerystės",
        ],
      },
    ],
    cta: { label: "Parašyti pagalbai", to: "/private-support" },
  },
  shipping: {
    title: "Pristatymas",
    eyebrow: "Pagalba",
    summary:
      "Fiziniai ir skaitmeniniai produktai Stilloak Studio svetainėje apdorojami skirtingai, todėl pristatymo logika visada aiškiai rodoma apmokėjimo metu.",
    lastUpdated: "2026 m. balandžio 28 d.",
    highlights: [
      "Skaitmeniniams produktams pristatymas netaikomas",
      "Fiziniams produktams kaina rodoma apmokėjimo suvestinėje",
      "Pristatymo informacija lieka ir tavo paskyroje",
    ],
    sections: [
      {
        heading: "Fiziniai produktai",
        paragraphs: [
          "Fiziniai užsakymai paprastai paruošiami per 1–3 darbo dienas, nebent produkto puslapyje nurodyta kitaip.",
          "Pristatymo mokestis ir galutinis užsakymo laikas pateikiami prieš apmokėjimą.",
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
    cta: { label: "Peržiūrėti skaitmeninius produktus", to: "/digital-products" },
  },
  returns: {
    title: "Grąžinimai",
    eyebrow: "Pagalba",
    summary:
      "Siekiame, kad grąžinimų politika būtų aiški ir sąžininga tiek fiziniams, tiek skaitmeniniams produktams.",
    lastUpdated: "2026 m. balandžio 28 d.",
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
        heading: "Grąžinimo eiga",
        paragraphs: [
          "Patvirtinus grąžinimą, lėšos į pradinį mokėjimo metodą grąžinamos pagal mokėjimo tiekėjo terminus. Tiksli grąžinimo trukmė priklauso nuo tavo banko ar kortelės išdavėjo.",
        ],
      },
    ],
    cta: { label: "Reikia pagalbos?", to: "/private-support" },
  },
  digitalDownloadPolicy: {
    title: "Skaitmeninių atsisiuntimų politika",
    eyebrow: "Pagalba",
    summary:
      "Stilloak Studio skaitmeniniai produktai yra mokami Excel failai, kurie tampa pasiekiami paskyroje po sėkmingo apmokėjimo.",
    lastUpdated: "2026 m. gegužės 20 d.",
    highlights: [
      "Failai atsisiunčiami tik prisijungus",
      "Prieiga suteikiama po sėkmingo apmokėjimo",
      "Jei failas neveikia, padedame patikrinti prieigą",
    ],
    sections: [
      {
        heading: "Kaip suteikiama prieiga",
        paragraphs: [
          "Skaitmeniniai produktai nėra pateikiami viešais tiesioginiais failų adresais. Įsigijus produktą, atsisiuntimas siejamas su paskyra ir pasiekiamas tik prisijungus.",
        ],
      },
      {
        heading: "Atsisiuntimas po pirkimo",
        bullets: [
          "prisijunkite prie paskyros, su kuria atlikote pirkimą",
          "atidarykite skaitmeninių produktų katalogą arba profilį",
          "pasirinkite įsigytą produktą ir atsisiųskite Excel failą",
        ],
      },
      {
        heading: "Grąžinimai ir pagalba",
        paragraphs: [
          "Kadangi skaitmeniniai failai suteikiami iškart po apmokėjimo, jie paprastai nėra grąžinami po prieigos suteikimo. Jei failas sugadintas, neatsidaro arba matote neteisingą produktą, susisiekite su pagalba ir situaciją peržiūrėsime individualiai.",
        ],
      },
      {
        heading: "Naudojimo ribos",
        paragraphs: [
          "Skaitmeniniai produktai skirti asmeniniam naudojimui. Jų negalima perparduoti, viešai platinti ar pateikti kaip savo produkto be raštiško leidimo.",
        ],
      },
    ],
    cta: { label: "Peržiūrėti skaitmeninius produktus", to: "/digital-products" },
  },
  privacy: {
    title: "Privatumas",
    eyebrow: "Pagalba",
    summary:
      "Stilloak Studio renka tik tuos duomenis, kurių reikia užsakymams, paskyrai ir saugesnei pirkimo patirčiai užtikrinti.",
    lastUpdated: "2026 m. balandžio 28 d.",
    highlights: [
      "Tvarkome paskyros ir užsakymo duomenis",
      "Mokėjimus apdoroja saugus partneris",
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
          "Mokėjimo duomenis apdoroja sertifikuotas mokėjimų partneris. Svetainės veikimui ir talpinimui naudojame išorines platformas, kurios padeda saugiai pateikti paslaugą, tačiau jos tvarko tik būtinus duomenis.",
        ],
      },
      {
        heading: "Tavo pasirinkimai",
        paragraphs: [
          "Gali kreiptis į mus dėl savo paskyros duomenų patikslinimo ar pašalinimo, jei tai neprieštarauja mūsų apskaitos ir užsakymų saugojimo prievolėms.",
        ],
      },
    ],
    cta: { label: "Susisiekti su pagalba", to: "/private-support" },
  },
  cookiePolicy: {
    title: "Slapukų politika",
    eyebrow: "Privatumas",
    summary:
      "Šiame puslapyje paaiškiname, kokius slapukų pasirinkimus gali valdyti Stilloak Studio lankytojai ir kodėl kai kurie slapukai yra būtini svetainei veikti.",
    lastUpdated: "2026 m. gegužės 20 d.",
    highlights: [
      "Būtinieji slapukai reikalingi svetainei veikti",
      "Funkciniai, analitiniai ir marketingo slapukai yra pasirenkami",
      "Slapukų nustatymus galima pakeisti bet kada puslapio apačioje",
    ],
    sections: [
      {
        heading: "Kas yra slapukai",
        paragraphs: [
          "Slapukai yra nedideli duomenų įrašai, kurie padeda svetainei prisiminti svarbius pasirinkimus, palaikyti saugų prisijungimą ir sklandžiai vykdyti pirkimo procesą.",
          "Stilloak Studio nenaudoja pasirenkamų analitinių ar marketingo slapukų be aiškaus lankytojo pasirinkimo.",
        ],
      },
      {
        heading: "Kodėl naudojame slapukus",
        bullets: [
          "kad veiktų prisijungimas, paskyra ir saugumas",
          "kad būtų galima išsaugoti kalbos ir slapukų pasirinkimus",
          "kad pirkimo ir atsisiuntimo patirtis būtų stabili",
          "kad su sutikimu galėtume geriau suprasti, kaip gerinti svetainę",
        ],
      },
      {
        heading: "Slapukų kategorijos",
        paragraphs: [
          "Būtinieji slapukai visada įjungti, nes be jų svetainė negalėtų patikimai veikti. Funkciniai slapukai padeda prisiminti patogumo nustatymus. Analitiniai slapukai padeda suprasti svetainės naudojimą tik tada, kai jiems suteikiamas sutikimas. Marketingo slapukai naudojami tik tuo atveju, jei ateityje svetainėje bus reklamos ar kampanijų matavimas ir vartotojas tam pritars.",
        ],
      },
      {
        heading: "Kaip pakeisti pasirinkimus",
        paragraphs: [
          "Slapukų pasirinkimus galima atidaryti puslapio apačioje paspaudus „Slapukų nustatymai“. Ten galima priimti visus slapukus, atmesti nebūtinuosius arba pasirinkti konkrečias kategorijas.",
        ],
      },
    ],
    cta: { label: "Atidaryti privatumo informaciją", to: "/privacy" },
  },
  terms: {
    title: "Taisyklės",
    eyebrow: "Pagalba",
    summary:
      "Naudodamasis Stilloak Studio svetaine ir pirkdamas produktus sutinki su toliau pateiktomis pagrindinėmis naudojimo ir pirkimo sąlygomis.",
    lastUpdated: "2026 m. balandžio 28 d.",
    highlights: [
      "Produktų kainos ir aprašymai gali būti atnaujinami",
      "Skaitmeniniai failai skirti asmeniniam naudojimui",
      "Paskyros ir užsakymo duomenys turi būti pateikti tiksliai",
    ],
    sections: [
      {
        heading: "Pirkimai ir kainos",
        paragraphs: [
          "Visos kainos ir produktų aprašymai gali būti atnaujinami be išankstinio įspėjimo, tačiau už jau patvirtintą ir apmokėtą užsakymą taikoma apmokėjimo metu parodyta kaina.",
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
    cta: { label: "Grįžti į pradžią", to: "/" },
  },
};
