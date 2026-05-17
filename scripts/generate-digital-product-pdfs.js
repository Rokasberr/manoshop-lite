const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { pathToFileURL } = require("url");

const rootDir = path.resolve(__dirname, "..");
const outputRoot = path.join(rootDir, "client", "public", "resources", "digital-products");
const logoPath = path.join(rootDir, "client", "public", "favicon.svg");
const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\Application\\msedge.exe",
];

const brand = {
  studio: "StillOak Studio",
  dark: "#081410",
  text: "#211b16",
  muted: "#75695d",
  line: "#e2d8ca",
  paper: "#fbf8f2",
  gold: "#b28445",
  goldSoft: "#f1dfbd",
  green: "#1d5443",
};

const logoDataUri = `data:image/svg+xml;base64,${fs.readFileSync(logoPath).toString("base64")}`;

const table = (headers, rows) => ({ headers, rows });
const worksheet = (fields) => fields;
const checklist = (items) => items;
const examples = (...items) => items;

const resources = [
  {
    dir: "bazinis",
    fileName: "stilloak-finansu-aiskumo-starter-kit.pdf",
    plan: "Visiems nariams",
    targetPages: 10,
    title: "Mėnesio finansų aiškumo starter kit",
    subtitle: "Ramus mėnesio finansų planas su pajamų, išlaidų, taupymo ir savaitės veiksmų struktūra.",
    sections: [
      {
        title: "Mėnesio finansų apžvalga",
        intro: "Šis puslapis yra mėnesio pradžios centras. Pirmiausia susidėk bendrą vaizdą, kad sprendimai remtųsi ne nuojauta, o aiškiais skaičiais.",
        table: table(["Sritis", "Planas", "Faktas", "Pastaba"], [["Pajamos", "", "", ""], ["Būtinos išlaidos", "", "", ""], ["Kintamos išlaidos", "", "", ""], ["Taupymas", "", "", ""], ["Laisvas rezervas", "", "", ""]]),
        note: "Praktinis pavyzdys: jei planuotos kintamos išlaidos yra 420 EUR, o faktas tampa 560 EUR, pirmas sprendimas nėra kaltė. Pirmas sprendimas yra rasti vieną kategoriją, kurią galima valdyti kitą savaitę.",
      },
      {
        title: "Pajamų žemėlapis",
        intro: "Pajamų žemėlapis padeda atskirti stabilias, papildomas ir nereguliarias pajamas. Tai leidžia neplanuoti mėnesio pagal optimistiškiausią scenarijų.",
        table: table(["Pajamų šaltinis", "Tipas", "Tikėtina suma", "Kada gaunama"], [["Pagrindinės pajamos", "Stabilios", "", ""], ["Papildomas darbas", "Kintamos", "", ""], ["Vienkartinės pajamos", "Nereguliarios", "", ""], ["Kita", "", "", ""]]),
        checklist: checklist(["Planuok pagal konservatyvų pajamų scenarijų.", "Nereguliarias pajamas skirk rezervui arba tikslui, ne kasdienėms išlaidoms.", "Pažymėk, kurios pajamos dar nėra garantuotos."]),
      },
      {
        title: "Fiksuotų išlaidų lentelė",
        intro: "Fiksuotos išlaidos sukuria mėnesio grindis. Kai jos aiškios, lengviau suprasti, kiek realiai lieka sprendimams.",
        table: table(["Išlaida", "Suma", "Mokėjimo diena", "Ar būtina?"], [["Būstas", "", "", ""], ["Komunaliniai", "", "", ""], ["Ryšys / internetas", "", "", ""], ["Draudimai", "", "", ""], ["Kiti įsipareigojimai", "", "", ""]]),
        note: "Praktinis pavyzdys: jei fiksuotos išlaidos sudaro daugiau nei 65% pajamų, šio mėnesio tikslas turėtų būti ne agresyvus taupymas, o vienos fiksuotos eilutės peržiūra.",
      },
      {
        title: "Kintamų išlaidų lentelė",
        intro: "Kintamos išlaidos nėra problema pačios savaime. Problema atsiranda tada, kai jos neturi ribos ir mėnesio pabaigoje paaiškėja per vėlai.",
        table: table(["Kategorija", "Savaitės riba", "Faktas", "Sprendimas"], [["Maistas", "", "", ""], ["Kava / pristatymas", "", "", ""], ["Transportas", "", "", ""], ["Laisvalaikis", "", "", ""], ["Pirkiniai", "", "", ""]]),
        checklist: checklist(["Vienai kategorijai nustatyk savaitės ribą.", "Sek faktą kas 7 dienas, ne tik mėnesio pabaigoje.", "Jei riba viršyta, koreguok kitą savaitę, ne visą mėnesį."]),
      },
      {
        title: "Taupymo tikslų formulė",
        intro: "Tikslas tampa valdomas, kai jis turi sumą, terminą ir mėnesinį įnašą. Formulė paprasta: likusi suma / likę mėnesiai = bazinis įnašas.",
        worksheet: worksheet(["Tikslo pavadinimas", "Reikalinga suma", "Jau sukaupta", "Liko sukaupti", "Terminas", "Bazinis mėnesio įnašas"]),
        examples: examples("Jei tikslui reikia 900 EUR, jau turi 180 EUR, o liko 6 mėnesiai, bazinis įnašas yra 120 EUR per mėnesį.", "Jei mėnuo sunkesnis, įnašą galima mažinti, bet sprendimą verta priimti sąmoningai, ne mėnesio pabaigoje."),
      },
      {
        title: "Savaitės pinigų peržiūros checklist",
        intro: "Savaitinė peržiūra saugo nuo per vėlyvų atradimų. Ji turi būti trumpa, kad ją būtų lengva kartoti.",
        checklist: checklist(["Patikrinti sąskaitos likutį.", "Pažymėti 3 didžiausias savaitės išlaidas.", "Palyginti kintamas išlaidas su savaitei skirta riba.", "Atlikti arba suplanuoti taupymo įnašą.", "Pasirinkti vieną korekciją kitai savaitei."]),
        note: "Praktinis pavyzdys: jei išlaidos maistui per savaitę viršijo ribą 38 EUR, kitą savaitę sprendimas gali būti vienas planuotas apsipirkimas ir dvi dienos be pristatymo.",
      },
      {
        title: "30 dienų veiksmų planas",
        intro: "Šis planas paverčia workbook į veiksmą. Užtenka vieno mažo sprendimo per savaitę, kad mėnuo taptų aiškesnis.",
        table: table(["Laikas", "Fokusas", "Veiksmas", "Rezultatas"], [["1 savaitė", "Aiškumas", "Užpildyti pajamų ir fiksuotų išlaidų lenteles", ""], ["2 savaitė", "Riba", "Nustatyti vieną kintamų išlaidų limitą", ""], ["3 savaitė", "Taupymas", "Atlikti tikslo įnašą", ""], ["4 savaitė", "Refleksija", "Įvertinti, kas veikė", ""]]),
      },
      {
        title: "Mėnesio refleksija ir santrauka",
        intro: "Mėnesio pabaigoje svarbiausia ne tik suma, bet ir sprendimų kokybė. Pažymėk, kas padėjo, kas kartojosi ir ką keisi kitą mėnesį.",
        worksheet: worksheet(["Kas šį mėnesį pavyko?", "Kur pinigai nutekėjo dažniausiai?", "Kuris sprendimas davė daugiausia ramybės?", "Ką kartosiu kitą mėnesį?", "Vienas kitas veiksmas"]),
        checklist: checklist(["Perkelti vieną pamoką į kitą mėnesį.", "Atnaujinti taupymo įnašą.", "Pasirinkti vieną ribą kitam mėnesiui."]),
      },
    ],
  },
  {
    dir: "bazinis",
    fileName: "stilloak-islaidu-audito-checklist.pdf",
    plan: "Visiems nariams",
    targetPages: 10,
    title: "Asmeninių išlaidų audito checklist",
    subtitle: "Praktiškas auditas pasikartojantiems mokėjimams, kasdienėms išlaidoms ir pinigų nutekėjimo vietoms rasti.",
    sections: [
      {
        title: "Audito instrukcija",
        intro: "Auditui skirk 30–45 minutes. Tikslas nėra save riboti visur. Tikslas yra rasti vietas, kur pinigai nebeatitinka tavo prioritetų.",
        checklist: checklist(["Atsidaryk 30 dienų sąskaitos išrašą.", "Pažymėk pasikartojančius mokėjimus.", "Atskirk būtinas išlaidas nuo įpročio išlaidų.", "Pasirink daugiausia 3 korekcijas šiam mėnesiui."]),
        examples: examples("Geras audito rezultatas: vienas atšauktas mokėjimas, viena sumažinta kategorija ir viena nauja taisyklė impulsyviems pirkiniams."),
      },
      {
        title: "Prenumeratų audito lentelė",
        intro: "Prenumeratos dažnai atrodo mažos, bet kartu gali sudaryti reikšmingą mėnesio sumą.",
        table: table(["Prenumerata", "Suma", "Naudoju?", "Sprendimas"], [["", "", "Taip / ne", "Palikti / atšaukti"], ["", "", "Taip / ne", "Palikti / atšaukti"], ["", "", "Taip / ne", "Palikti / atšaukti"], ["", "", "Taip / ne", "Palikti / atšaukti"]]),
      },
      {
        title: "Kasdienių išlaidų analizė",
        intro: "Kasdienės išlaidos retai atrodo didelės vieną dieną, bet mėnesio ritme jos parodo tikrą elgesio kryptį.",
        table: table(["Kategorija", "Dažnumas", "Mėnesio suma", "Ką keisiu"], [["Kava / užkandžiai", "", "", ""], ["Pristatymas", "", "", ""], ["Transportas", "", "", ""], ["Smulkūs pirkiniai", "", "", ""]]),
        note: "Praktinis pavyzdys: 4 pristatymai per savaitę po 12 EUR tampa apie 192 EUR per mėnesį. Mažinant iki 2 kartų, atsilaisvina apie 96 EUR.",
      },
      {
        title: "Impulsyvių pirkinių framework",
        intro: "Impulsas dažnai kyla ne iš poreikio, o iš nuovargio, nuobodulio ar noro greitai pasijusti geriau.",
        worksheet: worksheet(["Pirkimo situacija", "Kas paskatino?", "Ar pirkčiau po 24 valandų?", "Ką iš tikrųjų bandžiau išspręsti?", "Kitas pasirinkimas"]),
      },
      {
        title: "10 pinigų nutekėjimo vietų",
        intro: "Peržiūrėk šį sąrašą ir pažymėk, kurios vietos aktualios tau.",
        checklist: checklist(["Nenaudojamos prenumeratos", "Per dažnas maisto pristatymas", "Maži pirkiniai be ribos", "Banko ar kortelės mokesčiai", "Neplanuoti savaitgalio pirkimai", "Pirkimai dėl nuolaidos", "Dubliuojamos paslaugos", "Automatiniai mokėjimai už senus įrankius", "Skubūs pirkiniai be palyginimo", "Pirkiniai be aiškaus naudojimo plano"]),
      },
      {
        title: "Išlaidų mažinimo prioritetai",
        intro: "Mažink ne viską, o tai, kas turi mažiausią vertę ir didžiausią pasikartojimą.",
        table: table(["Išlaida", "Mėnesio suma", "Vertė 1–5", "Prioritetas"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]),
        examples: examples("Jei išlaida yra 8 EUR, bet naudojama kasdien ir suteikia realią vertę, ji nebūtinai pirmas prioritetas.", "Jei išlaida yra 14 EUR per mėnesį, bet visiškai nenaudojama, ją verta atšaukti iškart."),
      },
      {
        title: "Before / after išlaidų palyginimas",
        intro: "Palyginimas padeda matyti ne draudimą, o rezultatą.",
        table: table(["Kategorija", "Prieš", "Po", "Skirtumas"], [["Prenumeratos", "", "", ""], ["Pristatymas", "", "", ""], ["Impulsiniai pirkiniai", "", "", ""], ["Kita", "", "", ""]]),
      },
      {
        title: "Šio mėnesio mažinimo planas",
        intro: "Pasirink mažą, bet konkretų veiksmą. Geras planas turi ribą, laiką ir patikrinimo datą.",
        worksheet: worksheet(["Ką mažinu", "Kiek noriu sumažinti", "Kokia taisyklė padės", "Kada patikrinsiu", "Ką darysiu su sutaupyta suma"]),
        checklist: checklist(["Pasirinkti ne daugiau kaip 3 mažinimo veiksmus.", "Vieną veiksmą atlikti šiandien.", "Peržiūrėti rezultatą po 14 dienų."]),
      },
    ],
  },
  {
    dir: "bazinis",
    fileName: "stilloak-taupymo-tikslu-planavimo-sablonas.pdf",
    plan: "Visiems nariams",
    targetPages: 10,
    title: "Taupymo tikslų planavimo šablonas",
    subtitle: "Premium worksheet taupymo tikslams, sumai, terminui, mėnesiniam įnašui ir progresui sekti.",
    sections: [
      {
        title: "SMART tikslo struktūra",
        intro: "Taupymo tikslas turi būti konkretus, pamatuojamas, realus, svarbus ir turėti terminą.",
        worksheet: worksheet(["Konkretus tikslas", "Reikalinga suma", "Kodėl svarbu", "Terminas", "Kaip matuosiu progresą"]),
      },
      {
        title: "Tikslo sumos analizė",
        intro: "Neužtenka žinoti galutinę sumą. Reikia matyti, kas į ją įeina ir ar yra paslėptų išlaidų.",
        table: table(["Sudedamoji dalis", "Suma", "Ar būtina?", "Pastaba"], [["Pagrindinė suma", "", "", ""], ["Papildomos išlaidos", "", "", ""], ["Rezervas", "", "", ""], ["Iš viso", "", "", ""]]),
      },
      {
        title: "Termino ir mėnesinio įnašo skaičiavimas",
        intro: "Skaičiavimas padeda tikslą paversti mėnesio ritmu.",
        worksheet: worksheet(["Liko sukaupti", "Likę mėnesiai", "Bazinis mėnesio įnašas", "Minimalus įnašas sunkesnį mėnesį", "Papildomas įnašas geresnį mėnesį"]),
        examples: examples("Jei liko 720 EUR ir turi 12 mėnesių, bazinis įnašas yra 60 EUR per mėnesį.", "Jei mėnuo įtemptas, minimalus 30 EUR įnašas vis tiek palaiko įprotį."),
      },
      {
        title: "Progreso tracker",
        intro: "Progresas matomas tada, kai jį pažymi reguliariai.",
        table: table(["Savaitė", "Įnašas", "Bendra suma", "Kas padėjo?"], [["1", "", "", ""], ["2", "", "", ""], ["3", "", "", ""], ["4", "", "", ""], ["5", "", "", ""], ["6", "", "", ""]]),
      },
      {
        title: "Kliūčių ir rizikų analizė",
        intro: "Tikslas dažniausiai stringa ne dėl valios trūkumo, o dėl nenumatytų kliūčių.",
        table: table(["Rizika", "Tikimybė", "Poveikis", "Atsarginis veiksmas"], [["Netikėta išlaida", "", "", ""], ["Mažesnės pajamos", "", "", ""], ["Impulsinis pirkimas", "", "", ""], ["Pamirštas įnašas", "", "", ""]]),
      },
      {
        title: "Motyvacijos klausimai",
        intro: "Motyvacija veikia geriau, kai ji susieta su realiu gyvenimo pokyčiu.",
        checklist: checklist(["Ką šis tikslas leis man jausti?", "Kokį sprendimą jis palengvins?", "Kas pasikeis, kai tikslą pasieksiu?", "Ką esu pasiruošęs laikinai sumažinti?", "Kas padės nepamesti krypties?"]),
      },
      {
        title: "12 savaičių taupymo planas",
        intro: "Trumpas 12 savaičių planas leidžia judėti etapais ir neperkrauti mėnesio.",
        table: table(["Savaitės", "Fokusas", "Veiksmas", "Pažyma"], [["1–3", "Pradžia", "Nustatyti įnašo ritmą", ""], ["4–6", "Stabilumas", "Patikrinti progresą", ""], ["7–9", "Korekcija", "Sumažinti vieną kliūtį", ""], ["10–12", "Užtvirtinimas", "Įvertinti ir tęsti", ""]]),
      },
      {
        title: "Santrauka",
        intro: "Užbaik šabloną vienu aiškiu sprendimu, kad tikslas neliktų vien užpildyta lentele.",
        worksheet: worksheet(["Mano tikslas", "Mėnesio įnašas", "Pirmas veiksmas", "Peržiūros data", "Kodėl tęsiu"]),
      },
    ],
  },
  {
    dir: "asmeninis",
    fileName: "stilloak-premium-finansiniu-tikslu-sistema.pdf",
    plan: "Asmeninis+",
    targetPages: 12,
    title: "Premium finansinių tikslų sistema",
    subtitle: "90 dienų finansinių tikslų, įpročių, sprendimų ir progreso sistema.",
    sections: [
      {
        title: "Sistemos naudojimo instrukcija",
        intro: "Ši sistema veikia kaip 90 dienų ritmas. Pirmiausia išsirink kryptį, tada ją paversk savaitės veiksmais ir mėnesio peržiūromis.",
        checklist: checklist(["Pasirink iki 3 tikslų.", "Kiekvienam tikslui priskirk vieną įprotį.", "Kartą per savaitę pažymėk progresą.", "Mėnesio pabaigoje priimk vieną sprendimą."]),
      },
      {
        title: "90 dienų tikslų žemėlapis",
        table: table(["Tikslas", "90 dienų rezultatas", "Kodėl svarbu", "Pirmas veiksmas"], [["Rezervas", "", "", ""], ["Pajamos", "", "", ""], ["Įpročiai", "", "", ""]]),
      },
      {
        title: "Finansinių įpročių planas",
        worksheet: worksheet(["Įprotis", "Kada kartoju", "Kas primins", "Kaip matuosiu", "Ką darysiu, jei praleisiu"]),
        examples: examples("Pavyzdys: kiekvieną sekmadienį 18:00 peržiūriu savaitės išlaidas ir pažymiu vieną korekciją.", "Pavyzdys: taupymo įnašą darau atlyginimo dieną, o ne mėnesio pabaigoje."),
      },
      {
        title: "Prioritetų matrica",
        intro: "Matrica padeda atskirti, kas dabar svarbu, kas gali palaukti ir kas tik sukuria triukšmą.",
        table: table(["Sprendimas", "Poveikis", "Skuba", "Prioritetas"], [["", "Aukštas / žemas", "Dabar / vėliau", ""], ["", "Aukštas / žemas", "Dabar / vėliau", ""], ["", "Aukštas / žemas", "Dabar / vėliau", ""]]),
      },
      {
        title: "Mėnesio sprendimų framework",
        worksheet: worksheet(["Sprendimas", "Kokią problemą sprendžia?", "Ką reikės atidėti?", "Ar verta po 7 dienų?", "Galutinis pasirinkimas"]),
      },
      {
        title: "Savaitės peržiūros sistema",
        checklist: checklist(["Peržiūrėti 3 didžiausias išlaidas.", "Pažymėti vieną įpročio laimėjimą.", "Patikrinti tikslų įnašą.", "Pasirinkti vieną kitą savaitės korekciją.", "Užrašyti, kas suteikė daugiausia aiškumo."]),
      },
      {
        title: "Progreso dashboard",
        table: table(["Rodiklis", "Savaitė 1", "Savaitė 2", "Savaitė 3", "Savaitė 4"], [["Taupymo įnašas", "", "", "", ""], ["Išlaidų peržiūra", "", "", "", ""], ["Tikslų progresas", "", "", "", ""], ["Sprendimų kokybė", "", "", "", ""]]),
      },
      {
        title: "Rizikų ir kliūčių analizė",
        table: table(["Kliūtis", "Signalas", "Atsarginis planas", "Kada taikyti"], [["Netikėtos išlaidos", "", "", ""], ["Per didelis tikslas", "", "", ""], ["Pavargęs mėnuo", "", "", ""], ["Nereguliarios pajamos", "", "", ""]]),
      },
      {
        title: "Praktinis pavyzdys",
        intro: "Situacija: narys nori per 90 dienų sukaupti 600 EUR rezervą, bet turi nestabilias kintamas išlaidas.",
        checklist: checklist(["Tikslas: 600 EUR rezervas.", "Įprotis: 50 EUR įnašas kas savaitę.", "Korekcija: maisto pristatymą sumažinti iki 1 karto per savaitę.", "Peržiūra: kas sekmadienį pažymėti faktinį progresą."]),
      },
      {
        title: "Rezultatų analizė ir kitas veiksmas",
        worksheet: worksheet(["Kas pagerėjo?", "Kuris įprotis veikė?", "Kur stringa sistema?", "Ką supaprastinsiu?", "Kitas veiksmas per 7 dienas"]),
      },
    ],
  },
  {
    dir: "asmeninis",
    fileName: "stilloak-skaitmeniniu-produktu-ideju-framework.pdf",
    plan: "Asmeninis+",
    targetPages: 12,
    title: "Skaitmeninių produktų idėjų vertinimo framework",
    subtitle: "Strateginis worksheet produkto idėjai įvertinti pagal paklausą, vertę, aiškumą ir pardavimo potencialą.",
    sections: [
      {
        title: "Kaip naudoti framework",
        intro: "Framework padeda idėją įvertinti prieš kuriant pilną produktą. Užpildyk kiekvieną puslapį trumpai ir sąžiningai.",
        checklist: checklist(["Nevertink idėjos vien pagal entuziazmą.", "Ieškok realios problemos ir pirkimo priežasties.", "Pirmą versiją planuok mažesnę, nei norisi.", "Sprendimą priimk pagal balus ir aiškumą."]),
      },
      {
        title: "Idėjos aprašymo lapas",
        worksheet: worksheet(["Produkto idėja", "Formatas", "Kam skirta", "Kokį rezultatą duoda", "Kodėl dabar"]),
      },
      {
        title: "Auditorijos analizė",
        table: table(["Auditorija", "Situacija", "Poreikis", "Kur ją pasiekti"], [["Pradedantieji", "", "", ""], ["Pažengę", "", "", ""], ["Verslo klientai", "", "", ""]]),
      },
      {
        title: "Problemos vertinimas",
        intro: "Stipri problema turi dažnumą, aiškų skausmą ir kainą, jei ji lieka neišspręsta.",
        table: table(["Problema", "Dažnumas", "Skausmo lygis 1–5", "Kaina klientui"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]),
      },
      {
        title: "Sprendimo aiškumas",
        worksheet: worksheet(["Sprendimas vienu sakiniu", "Kas įtraukta", "Ko nėra", "Pirmas kliento rezultatas", "Kaip greitai pamatomas efektas"]),
      },
      {
        title: "Vertės pažadas",
        intro: "Vertės pažadas turi pasakyti, kam skirtas produktas, kokį rezultatą jis duoda ir kokios kliūties padeda išvengti.",
        worksheet: worksheet(["Kam padeda", "Kokį rezultatą sukuria", "Be kokios kliūties", "Vieno sakinio pažadas"]),
        examples: examples("Pavyzdys: padeda freelancer'iui per 60 minučių susidėlioti paslaugos puslapio tekstus be tuščio ekrano jausmo."),
      },
      {
        title: "Konkurencinio skirtumo lentelė",
        table: table(["Alternatyva", "Ką ji daro gerai", "Ko trūksta", "Mano skirtumas"], [["Nemokamas turinys", "", "", ""], ["Kitas produktas", "", "", ""], ["Konsultacija", "", "", ""]]),
      },
      {
        title: "MVP paprastumo analizė",
        checklist: checklist(["Ar pirmą versiją galima sukurti per 7 dienas?", "Ar pakanka vieno aiškaus rezultato?", "Ar galima parduoti prieš kuriant visą sistemą?", "Ar produktas veikia be sudėtingo palaikymo?"]),
      },
      {
        title: "Kainodaros potencialas",
        table: table(["Vertės signalas", "Žemas", "Vidutinis", "Aukštas"], [["Laiko taupymas", "", "", ""], ["Pajamų potencialas", "", "", ""], ["Sprendimo svarba", "", "", ""], ["Aiškumo lygis", "", "", ""]]),
      },
      {
        title: "Galutinis sprendimas",
        intro: "Užbaik framework sprendimu: kurti, testuoti arba atmesti. Atmetimas taip pat yra geras rezultatas, jei jis sutaupo laiką.",
        worksheet: worksheet(["Bendras balas", "Stipriausia vieta", "Silpniausia vieta", "Sprendimas: kurti / testuoti / atmesti", "Kitas testas"]),
      },
    ],
  },
  {
    dir: "asmeninis",
    fileName: "stilloak-pajamu-ir-islaidu-optimizavimo-planas.pdf",
    plan: "Asmeninis+",
    targetPages: 12,
    title: "Pajamų ir išlaidų optimizavimo planas",
    subtitle: "30 dienų planas pajamų šaltiniams, išlaidų kategorijoms ir prioritetams optimizuoti.",
    sections: [
      {
        title: "Naudojimo instrukcija",
        intro: "Šis planas skirtas ne vien išlaidoms mažinti. Jis padeda suprasti, kur pinigai kuria vertę, kur nuteka ir kur yra pajamų stiprinimo galimybė.",
        checklist: checklist(["Pradėk nuo faktų, ne nuo norimos versijos.", "Pasirink 1 pajamų ir 1 išlaidų veiksmą.", "Laikyk planą 30 dienų, tada įvertink rezultatą."]),
      },
      {
        title: "Pajamų šaltinių žemėlapis",
        table: table(["Pajamų šaltinis", "Suma", "Dažnumas", "Augimo galimybė"], [["Pagrindinės pajamos", "", "", ""], ["Papildomos pajamos", "", "", ""], ["Vienkartinės pajamos", "", "", ""], ["Kita", "", "", ""]]),
      },
      {
        title: "Pajamų stabilumo analizė",
        table: table(["Šaltinis", "Stabilumas 1–5", "Rizika", "Stiprinimo veiksmas"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]),
      },
      {
        title: "Išlaidų kategorijų analizė",
        table: table(["Kategorija", "Mėnesio suma", "Vertė 1–5", "Sprendimas"], [["Būtinos", "", "", ""], ["Patogumo", "", "", ""], ["Augimo", "", "", ""], ["Impulsinės", "", "", ""]]),
      },
      {
        title: "Optimizavimo prioritetų lentelė",
        intro: "Rinkis prioritetus pagal poveikį ir lengvumą. Pirmiausia imk tai, kas turi didelį poveikį ir mažą trintį.",
        table: table(["Veiksmas", "Poveikis", "Lengvumas", "Prioritetas"], [["", "Aukštas / žemas", "Lengva / sunku", ""], ["", "Aukštas / žemas", "Lengva / sunku", ""], ["", "Aukštas / žemas", "Lengva / sunku", ""]]),
      },
      {
        title: "30 dienų veiksmų planas",
        table: table(["Savaitė", "Pajamų veiksmas", "Išlaidų veiksmas", "Rezultatas"], [["1", "", "", ""], ["2", "", "", ""], ["3", "", "", ""], ["4", "", "", ""]]),
      },
      {
        title: "Finansinio progreso tracker",
        table: table(["Rodiklis", "Pradžia", "Po 15 dienų", "Po 30 dienų"], [["Pajamos", "", "", ""], ["Išlaidos", "", "", ""], ["Sutaupyta", "", "", ""], ["Laisvas rezervas", "", "", ""]]),
      },
      {
        title: "Rizikų ir atsargų planas",
        worksheet: worksheet(["Didžiausia rizika", "Ką darysiu, jei ji įvyks?", "Minimalus planas", "Kam neliesti pinigų", "Peržiūros data"]),
      },
      {
        title: "Praktinis pavyzdys",
        intro: "Situacija: žmogus nori sutaupyti papildomus 120 EUR per mėnesį be agresyvaus ribojimo.",
        checklist: checklist(["Atšaukta 18 EUR prenumerata.", "Pristatymas sumažintas nuo 4 iki 2 kartų per savaitę.", "Papildomos 2 valandos freelance darbo per mėnesį.", "Po 30 dienų rezultatas: apie 130 EUR geresnis balansas."]),
      },
      {
        title: "Mėnesio rezultatų santrauka",
        worksheet: worksheet(["Kas pagerino balansą?", "Kuris veiksmas buvo lengviausias?", "Kas neveikė?", "Ką tęsiu kitą mėnesį?", "Kitas vienas veiksmas"]),
      },
    ],
  },
  {
    dir: "privatus-verslas",
    fileName: "stilloak-mini-verslo-paleidimo-blueprint.pdf",
    plan: "Privatus verslas",
    targetPages: 15,
    title: "Mini verslo paleidimo blueprint",
    subtitle: "Nuo idėjos iki pirmo pasiūlymo per auditorijos, problemos, sprendimo ir veiksmų struktūrą.",
    sections: [
      { title: "Blueprint naudojimo instrukcija", intro: "Blueprint skirtas greitam, bet tvirtam pirmo pasiūlymo išgryninimui. Pildyk trumpai, testuok greitai, koreguok pagal realius klausimus.", checklist: checklist(["Pirmiausia aprašyk auditoriją.", "Tada išgrynink problemą.", "Tik tada kurk pasiūlymo formą.", "Per 14 dienų siek pirmo realaus susidomėjimo."]) },
      { title: "Idėjos validavimo lapas", worksheet: worksheet(["Verslo idėja", "Kam skirta", "Kodėl dabar", "Koks pirmas mokamas rezultatas", "Kaip patikrinsiu paklausą"]) },
      { title: "Auditorijos profilis", table: table(["Segmentas", "Situacija", "Pagrindinis noras", "Kur pasiekti"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]) },
      { title: "Problemos / sprendimo framework", worksheet: worksheet(["Problema", "Kodėl skauda", "Kas jau bandyta", "Mano sprendimas", "Kodėl tai paprasčiau"]) },
      { title: "Pasiūlymo struktūra", worksheet: worksheet(["Pavadinimas", "Vertės pažadas", "Kas įtraukta", "Kaina", "Pirkimo veiksmas"]) },
      { title: "MVP produkto planas", table: table(["Dalis", "Minimalus turinys", "Kas nebūtina", "Būsena"], [["Pagrindinis rezultatas", "", "", ""], ["Darbo failas", "", "", ""], ["Pristatymo puslapis", "", "", ""], ["Pagalba / instrukcija", "", "", ""]]) },
      { title: "Pirmo produkto checklist", checklist: checklist(["Aiškus pavadinimas", "Vienas pagrindinis rezultatas", "Paprasta struktūra", "Kaina", "CTA", "Atsakymai į dažnus klausimus", "Pirmas testavimo kanalas"]) },
      { title: "14 dienų paleidimo planas", table: table(["Dienos", "Fokusas", "Veiksmas", "Rezultatas"], [["1–3", "Aiškumas", "Auditorija ir problema", ""], ["4–6", "MVP", "Produkto struktūra", ""], ["7–10", "Puslapis", "Tekstai ir CTA", ""], ["11–14", "Paleidimas", "Pirmi klientai", ""]]) },
      { title: "Pirmų klientų gavimo strategija", checklist: checklist(["Parašyti 10 šiltų kontaktų.", "Paskelbti vieną aiškų problemos įrašą.", "Pakviesti į 15 minučių pokalbį.", "Surinkti 5 prieštaravimus.", "Pakoreguoti pasiūlymą."]) },
      { title: "Kanalų pasirinkimas", table: table(["Kanalas", "Kodėl tinka", "Pirmas turinys", "Metrika"], [["LinkedIn", "", "", ""], ["Instagram", "", "", ""], ["El. paštas", "", "", ""], ["Tiesioginės žinutės", "", "", ""]]) },
      { title: "Veiksmų dashboard", table: table(["Veiksmas", "Terminas", "Atsakomybė", "Būsena"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]) },
      { title: "Rizikų analizė", table: table(["Rizika", "Signalas", "Atsarginis veiksmas", "Kada spręsti"], [["Nėra susidomėjimo", "", "", ""], ["Per platus pasiūlymas", "", "", ""], ["Per daug kuriama", "", "", ""], ["Neaiški kaina", "", "", ""]]) },
      { title: "Praktinis pavyzdys ir final checklist", intro: "Pavyzdys: kūrėjas per 14 dienų paleidžia 29 EUR worksheet, kuris padeda susitvarkyti produkto puslapio tekstus.", checklist: checklist(["Auditorija įvardinta", "Problema aiški", "MVP paruoštas", "Puslapio CTA matomas", "Pirmi 10 žmonių pakviesti", "Klausimai surinkti", "Kitas testas suplanuotas"]) },
    ],
  },
  {
    dir: "privatus-verslas",
    fileName: "stilloak-digital-product-launch-kit.pdf",
    plan: "Privatus verslas",
    targetPages: 15,
    title: "Digital Product Launch Kit",
    subtitle: "Produkto struktūra, launch checklist, timeline, puslapio tekstai ir final kontrolinis sąrašas.",
    sections: [
      { title: "Launch kit instrukcija", intro: "Šis rinkinys skirtas pasiruošti skaitmeninio produkto paleidimui be chaoso. Kiekvienas puslapis veda nuo struktūros iki analizės.", checklist: checklist(["Pirmiausia užpildyk produkto struktūrą.", "Tada sukurk puslapio tekstų karkasą.", "Launch dieną naudok checklist.", "Po launch pažymėk, ką optimizuoti."]) },
      { title: "Produkto pasiruošimo checklist", checklist: checklist(["Produkto pavadinimas", "Vieno sakinio pažadas", "Kas įtraukta", "Kaina", "Puslapio CTA", "Atsakymai į FAQ", "Failo pristatymo tekstas"]) },
      { title: "Launch timeline", table: table(["Laikas", "Tikslas", "Veiksmas", "Būsena"], [["7 dienos iki", "Struktūra", "Baigti produktą", ""], ["5 dienos iki", "Tekstai", "Paruošti puslapį", ""], ["3 dienos iki", "Turinys", "Paruošti įrašus", ""], ["Launch diena", "Pardavimas", "Kviesti pirkti", ""]]) },
      { title: "Turinio plano pavyzdžiai", examples: examples("Įrašas 1: problema, kurią produktas išsprendžia.", "Įrašas 2: pavyzdys, kaip atrodo rezultatas.", "Įrašas 3: kvietimas atidaryti produktą ir pradėti."), checklist: checklist(["Vienas edukacinis įrašas", "Vienas istorijos įrašas", "Vienas pardavimo įrašas"]) },
      { title: "Produkto puslapio struktūra", worksheet: worksheet(["Hero pavadinimas", "Vertės pažadas", "Kam skirta", "Kas įtraukta", "Kaina", "CTA"]) },
      { title: "CTA tekstų pavyzdžiai", table: table(["Tikslas", "CTA", "Kada naudoti"], [["Atidaryti", "Atrakinti resursą", "Bibliotekoje"], ["Pirkti", "Gauti pilną sistemą", "Pardavimo puslapyje"], ["Švelniai", "Pradėti aiškiau", "Kai norisi mažiau spaudimo"]]) },
      { title: "Email / social launch seka", table: table(["Žinutė", "Tikslas", "Pagrindinė mintis", "CTA"], [["1", "Sudominti", "Problema", ""], ["2", "Paaiškinti", "Sprendimas", ""], ["3", "Parduoti", "Produktas", ""], ["4", "Priminti", "Paskutinė proga", ""]]) },
      { title: "Launch dienos checklist", checklist: checklist(["Patikrinti PDF / failą", "Patikrinti CTA", "Paskelbti launch žinutę", "Atsakyti į klausimus", "Pažymėti pirmus signalus", "Atnaujinti puslapį, jei kartojasi klausimai"]) },
      { title: "Final CTA seka", worksheet: worksheet(["Pirmas CTA", "Pakartotinis CTA", "FAQ CTA", "Puslapio pabaigos CTA", "El. laiško CTA"]) },
      { title: "Po launch analizė", table: table(["Signalas", "Kas įvyko", "Ką reiškia", "Ką keisti"], [["Peržiūros", "", "", ""], ["Paspaudimai", "", "", ""], ["Klausimai", "", "", ""], ["Pirkimai", "", "", ""]]) },
      { title: "Rezultatų lentelė", table: table(["Rodiklis", "Tikslas", "Faktas", "Kitas veiksmas"], [["Puslapio peržiūros", "", "", ""], ["CTA paspaudimai", "", "", ""], ["Pirkimai", "", "", ""], ["Atsakymai / žinutės", "", "", ""]]) },
      { title: "Ką optimizuoti kitą kartą", checklist: checklist(["Aiškesnis vertės pažadas", "Trumpesnis produkto aprašymas", "Stipresnis CTA", "Daugiau pavyzdžių", "Aiškesnis FAQ", "Geresnis launch ritmas"]) },
      { title: "Santrauka ir final checklist", worksheet: worksheet(["Kas veikė", "Kas trukdė", "Ką kartosiu", "Ką keisiu", "Kitas launch testas"]), checklist: checklist(["Produktas paruoštas", "Puslapis aiškus", "CTA matomas", "Analizė atlikta"]) },
    ],
  },
  {
    dir: "privatus-verslas",
    fileName: "stilloak-premium-produkto-pasiulymo-framework.pdf",
    plan: "Privatus verslas",
    targetPages: 15,
    title: "Premium produkto pasiūlymo framework",
    subtitle: "Pasiūlymo dizainas: pavadinimas, auditorija, problema, nauda, kainodara ir CTA tekstai.",
    sections: [
      { title: "Framework instrukcija", intro: "Premium pasiūlymas turi būti aiškus prieš jam tampant gražiu. Pirmiausia išgrynink kam, ką, kodėl ir už kiek.", checklist: checklist(["Pildyk trumpais sakiniais.", "Kiekvieną naudą susiek su rezultatu.", "Kainą pagrįsk verte, ne vien turiniu."]) },
      { title: "Produkto pavadinimo kūrimas", worksheet: worksheet(["Rezultato žodis", "Auditorija", "Formatas", "Premium signalas", "Galutinis pavadinimas"]), examples: examples("Pavyzdys: Finansų aiškumo sistema", "Pavyzdys: Store Page Copy Kit") },
      { title: "Kam skirtas produktas", table: table(["Segmentas", "Situacija", "Kodėl pirktų", "Netinka, jei"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]) },
      { title: "Problemos struktūra", worksheet: worksheet(["Pagrindinė problema", "Kas ją sukelia", "Kokia kaina nieko nekeisti", "Kaip klientas tai apibūdina savais žodžiais"]) },
      { title: "Pagrindinės naudos", table: table(["Nauda", "Praktinis rezultatas", "Emocinis rezultatas", "Įrodymas"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]) },
      { title: "Kas įtraukta į pasiūlymą", checklist: checklist(["Pagrindinis PDF / template", "Instrukcijos", "Worksheet blokai", "Pavyzdžiai", "Checklist", "Kitas veiksmas po atsisiuntimo"]) },
      { title: "Vertės pažadas", worksheet: worksheet(["Padeda kam", "Pasiekti ką", "Be kokios kliūties", "Per kiek laiko", "Vieno sakinio pažadas"]) },
      { title: "Kainodaros logika", table: table(["Vertės signalas", "Klausimas", "Atsakymas", "Kainos įtaka"], [["Laikas", "Kiek sutaupo?", "", ""], ["Aiškumas", "Kiek sprendimų palengvina?", "", ""], ["Pajamos", "Ar gali padėti uždirbti?", "", ""], ["Klaidos", "Ko padeda išvengti?", "", ""]]) },
      { title: "CTA tekstų pavyzdžiai", table: table(["Tonacija", "CTA", "Kada naudoti"], [["Tiesioginė", "Atrakinti resursą", "Kai poreikis aiškus"], ["Premium", "Gauti pilną sistemą", "Kai akcentuojama vertė"], ["Rami", "Pradėti aiškiau", "Kai svarbus subtilumas"]]) },
      { title: "Objection handling", table: table(["Prieštaravimas", "Ką žmogus iš tikrųjų klausia", "Atsakymo kryptis"], [["Per brangu", "Ar vertė pakankama?", ""], ["Neturiu laiko", "Ar greitai pradėsiu?", ""], ["Ar man tinka?", "Ar atpažįstu save?", ""]]) },
      { title: "FAQ struktūra", worksheet: worksheet(["Kam skirtas?", "Ką gausiu?", "Kiek laiko reikės?", "Ar tinka pradedančiajam?", "Kas vyksta po pirkimo?"]) },
      { title: "Offer patikros checklist", checklist: checklist(["Aiški auditorija", "Aiški problema", "Vieno sakinio pažadas", "Matoma vertė", "Pagrįsta kaina", "Vienas CTA", "Atsakyti prieštaravimai"]) },
      { title: "Praktinis pavyzdys ir galutinė forma", intro: "Pavyzdys: 39 EUR copy kit kūrėjui, kuris nori per vieną vakarą susitvarkyti produkto puslapio struktūrą.", worksheet: worksheet(["Pavadinimas", "Auditorija", "Problema", "Pažadas", "Kaina", "CTA"]) },
    ],
  },
  {
    dir: "privatus-verslas",
    fileName: "stilloak-store-page-copy-kit.pdf",
    plan: "Privatus verslas",
    targetPages: 15,
    title: "Store Page Copy Kit",
    subtitle: "Premium tekstų struktūra produkto arba store puslapiui: hero, aprašymas, naudos, FAQ, CTA ir pasitikėjimas.",
    sections: [
      { title: "Copy kit instrukcija", intro: "Šis kit skirtas puslapiui, kuris parduoda aiškumu, ne spaudimu. Kiekvienas blokas turi vieną užduotį.", checklist: checklist(["Pradėk nuo hero pažado.", "Tada paaiškink produktą.", "Tik tada dėk CTA.", "Peržiūrėk puslapį kaip pirkėjas."]) },
      { title: "Hero section copy template", worksheet: worksheet(["Pavadinimas", "Vieno sakinio pažadas", "Kam skirta", "Pagrindinis CTA", "Pasitikėjimo sakinys"]) },
      { title: "Produkto aprašymo struktūra", checklist: checklist(["Situacija, kurioje yra klientas", "Problema", "Sprendimas", "Kas įtraukta", "Ką daryti toliau"]) },
      { title: "Naudos blokai", table: table(["Nauda", "Ką reiškia praktiškai", "Kodėl svarbu", "Teksto sakinys"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]) },
      { title: "Social proof tekstai", worksheet: worksheet(["Kliento situacija", "Kas pasikeitė", "Konkretus rezultatas", "Trumpas citatos sakinys"]) },
      { title: "FAQ klausimų šablonai", checklist: checklist(["Kam skirtas šis produktas?", "Ką gausiu viduje?", "Kiek laiko užtruksiu?", "Ar tinka pradedančiajam?", "Kas vyksta po pirkimo?"]) },
      { title: "Pirkimo CTA pavyzdžiai", table: table(["Vieta", "CTA", "Tonacija"], [["Hero", "Atrakinti resursą", "Tiesioginė"], ["Po naudų", "Pradėti aiškiau", "Rami"], ["Pabaiga", "Gauti pilną sistemą", "Premium"]]) },
      { title: "Pasitikėjimo tekstai", checklist: checklist(["Aiškiai nurodyk, ką žmogus gaus.", "Paaiškink, kaip pradėti.", "Įvardink, kam produktas tinka.", "Nerašyk pažadų, kurių produktas neišpildo."]) },
      { title: "Produkto puslapio wireframe", table: table(["Blokas", "Tikslas", "Ką parašyti", "Būsena"], [["Hero", "Sudominti", "", ""], ["Naudos", "Paaiškinti", "", ""], ["Kas įtraukta", "Sumažinti neaiškumą", "", ""], ["FAQ", "Atsakyti prieštaravimus", "", ""], ["CTA", "Pakviesti veikti", "", ""]]) },
      { title: "Premium copy checklist", checklist: checklist(["Vienas pagrindinis pažadas", "Aiški auditorija", "Trumpi sakiniai", "Konkrečios naudos", "Matomas CTA", "Ramus pasitikėjimo tekstas"]) },
      { title: "Blogo vs gero copy pavyzdžiai", examples: examples("Silpna: Šis produktas padės jums viską susitvarkyti.", "Stipru: Per 45 minutes susidėliok produkto puslapio tekstus nuo hero iki FAQ.", "Silpna: Pirk dabar. Stipru: Atrakinti aiškią puslapio struktūrą.") },
      { title: "Final page review", worksheet: worksheet(["Ar pirmas ekranas aiškus?", "Ar naudos konkrečios?", "Ar FAQ atsako į baimes?", "Ar CTA kartojasi logiškai?", "Ką trumpinsiu?"]) },
      { title: "Optimizavimo checklist ir santrauka", checklist: checklist(["Perrašyti silpniausią bloką", "Sutrumpinti hero tekstą", "Pridėti vieną pavyzdį", "Sustiprinti CTA", "Peržiūrėti mobilų vaizdą"]), worksheet: worksheet(["Galutinė puslapio kryptis", "Kitas testas", "Ką matuosiu"]) },
    ],
  },
];

const pageNumber = (current, total) => `${current} / ${total}`;

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);

const renderTable = (data) => {
  if (!data) {
    return "";
  }

  return `
    <table class="resource-table">
      <thead>
        <tr>${data.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${data.rows.map((row) => `
          <tr>${row.map((cell) => `<td>${cell ? escapeHtml(cell) : "&nbsp;"}</td>`).join("")}</tr>
        `).join("")}
      </tbody>
    </table>
  `;
};

const renderWorksheet = (fields) => {
  if (!fields) {
    return "";
  }

  return `
    <div class="worksheet-grid">
      ${fields.map((field) => `
        <div class="worksheet-field">
          <span>${escapeHtml(field)}</span>
          <div class="write-line"></div>
        </div>
      `).join("")}
    </div>
  `;
};

const renderChecklist = (items) => {
  if (!items) {
    return "";
  }

  return `
    <div class="checklist">
      ${items.map((item) => `
        <div class="check-item">
          <span class="box"></span>
          <p>${escapeHtml(item)}</p>
        </div>
      `).join("")}
    </div>
  `;
};

const renderExamples = (items) => {
  if (!items) {
    return "";
  }

  return `
    <div class="examples">
      <h3>Praktiniai pavyzdžiai</h3>
      ${items.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
    </div>
  `;
};

const renderSection = (resource, section, index, totalPages) => `
  <section class="pdf-page content-page">
    <header class="page-header">
      <div class="mini-brand">
        <img src="${logoDataUri}" alt="" />
        <span>${brand.studio}</span>
      </div>
      <span class="section-kicker">Sekcija ${String(index + 1).padStart(2, "0")}</span>
    </header>

    <main class="section-content">
      <p class="plan-label">${escapeHtml(resource.plan)}</p>
      <h2>${escapeHtml(section.title)}</h2>
      ${section.intro ? `<p class="section-intro">${escapeHtml(section.intro)}</p>` : ""}
      ${renderTable(section.table)}
      ${renderWorksheet(section.worksheet)}
      ${renderChecklist(section.checklist)}
      ${renderExamples(section.examples)}
      ${section.note ? `<div class="note"><strong>Pastaba</strong><p>${escapeHtml(section.note)}</p></div>` : ""}
    </main>

    <footer class="page-footer">
      <span>${brand.studio}</span>
      <span>${pageNumber(index + 3, totalPages)}</span>
    </footer>
  </section>
`;

const buildHtml = (resource) => {
  const totalPages = resource.sections.length + 2;
  const structure = resource.sections
    .map((section, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(section.title)}</li>`)
    .join("");

  return `
<!doctype html>
<html lang="lt">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(resource.title)}</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: ${brand.text};
      background: ${brand.paper};
      font-family: "Inter", "Segoe UI", Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .pdf-page {
      width: 210mm;
      min-height: 297mm;
      page-break-after: always;
      break-after: page;
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 18% 12%, rgba(178, 132, 69, 0.18), transparent 34%),
        linear-gradient(135deg, #fffdf8 0%, #f8f1e6 54%, #eef3ed 100%);
      padding: 18mm 17mm 16mm;
    }

    .pdf-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .cover {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        linear-gradient(140deg, rgba(8, 20, 16, 0.94), rgba(29, 84, 67, 0.9)),
        radial-gradient(circle at 72% 20%, rgba(241, 223, 189, 0.38), transparent 30%);
      color: #fffaf0;
    }

    .cover::after {
      content: "";
      position: absolute;
      inset: 22mm 16mm;
      border: 1px solid rgba(241, 223, 189, 0.35);
      pointer-events: none;
    }

    .cover-brand,
    .mini-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      letter-spacing: 0;
    }

    .cover-brand img,
    .mini-brand img {
      width: 30px;
      height: 30px;
    }

    .cover-brand span {
      font-size: 16px;
    }

    .cover-main {
      max-width: 148mm;
      position: relative;
      z-index: 1;
    }

    .resource-badge {
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(241, 223, 189, 0.48);
      color: ${brand.goldSoft};
      border-radius: 999px;
      padding: 7px 13px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 16mm;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 48px;
      line-height: 1.02;
      max-width: 160mm;
      font-weight: 600;
      letter-spacing: 0;
    }

    .cover-subtitle {
      max-width: 132mm;
      margin-top: 8mm;
      color: rgba(255, 250, 240, 0.82);
      font-size: 17px;
      line-height: 1.58;
    }

    .cover-meta {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      position: relative;
      z-index: 1;
    }

    .cover-meta span,
    .pill {
      border-radius: 999px;
      padding: 8px 12px;
      background: rgba(255, 250, 240, 0.11);
      border: 1px solid rgba(241, 223, 189, 0.34);
      color: #fffaf0;
      font-size: 12px;
      font-weight: 700;
    }

    .page-header,
    .page-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: ${brand.muted};
      font-size: 11px;
      letter-spacing: 0.02em;
      position: relative;
      z-index: 1;
    }

    .mini-brand img {
      width: 22px;
      height: 22px;
    }

    .mini-brand span {
      color: ${brand.dark};
      font-size: 12px;
    }

    .page-footer {
      position: absolute;
      left: 17mm;
      right: 17mm;
      bottom: 11mm;
      padding-top: 5mm;
      border-top: 1px solid ${brand.line};
    }

    .usage-grid {
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      gap: 9mm;
      margin-top: 15mm;
    }

    .usage-card,
    .structure-card,
    .examples,
    .note {
      border: 1px solid ${brand.line};
      border-radius: 16px;
      background: rgba(255, 253, 248, 0.82);
      box-shadow: 0 18px 45px rgba(33, 27, 22, 0.08);
      padding: 9mm;
    }

    .usage-card h2,
    .structure-card h2,
    .section-content h2 {
      font-family: Georgia, "Times New Roman", serif;
      color: ${brand.dark};
      font-weight: 600;
      letter-spacing: 0;
    }

    .usage-card h2,
    .structure-card h2 {
      font-size: 25px;
      line-height: 1.12;
      margin-bottom: 5mm;
    }

    .usage-card p,
    .section-intro,
    .note p,
    .examples p {
      color: ${brand.muted};
      font-size: 14px;
      line-height: 1.65;
    }

    .structure-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 3.2mm;
    }

    .structure-list li {
      display: grid;
      grid-template-columns: 10mm 1fr;
      gap: 3mm;
      align-items: start;
      color: ${brand.text};
      font-size: 12.4px;
      line-height: 1.35;
      padding-bottom: 3mm;
      border-bottom: 1px solid rgba(226, 216, 202, 0.82);
    }

    .structure-list span {
      color: ${brand.gold};
      font-weight: 800;
    }

    .section-content {
      margin-top: 16mm;
      position: relative;
      z-index: 1;
    }

    .plan-label,
    .section-kicker {
      color: ${brand.gold};
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .section-content h2 {
      font-size: 34px;
      line-height: 1.08;
      margin-top: 4mm;
      margin-bottom: 6mm;
      max-width: 160mm;
    }

    .section-intro {
      max-width: 156mm;
      margin-bottom: 8mm;
      font-size: 15px;
    }

    .resource-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      overflow: hidden;
      border: 1px solid ${brand.line};
      border-radius: 14px;
      background: rgba(255, 253, 248, 0.92);
      margin: 6mm 0;
      box-shadow: 0 14px 34px rgba(33, 27, 22, 0.07);
    }

    .resource-table th,
    .resource-table td {
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid ${brand.line};
      border-right: 1px solid ${brand.line};
      padding: 4.2mm 4mm;
      font-size: 12px;
      line-height: 1.35;
    }

    .resource-table th {
      color: ${brand.dark};
      background: rgba(241, 223, 189, 0.48);
      font-weight: 800;
    }

    .resource-table td {
      min-height: 12mm;
      color: ${brand.text};
      background: rgba(255, 255, 255, 0.38);
    }

    .resource-table tr:last-child td {
      border-bottom: 0;
    }

    .resource-table th:last-child,
    .resource-table td:last-child {
      border-right: 0;
    }

    .worksheet-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 5mm;
      margin: 6mm 0;
    }

    .worksheet-field {
      min-height: 25mm;
      padding: 5mm;
      border: 1px solid ${brand.line};
      border-radius: 14px;
      background: rgba(255, 253, 248, 0.88);
    }

    .worksheet-field span {
      display: block;
      color: ${brand.dark};
      font-weight: 800;
      font-size: 12px;
      margin-bottom: 8mm;
    }

    .write-line {
      height: 1px;
      background: repeating-linear-gradient(90deg, rgba(117, 105, 93, 0.42), rgba(117, 105, 93, 0.42) 12px, transparent 12px, transparent 18px);
    }

    .checklist {
      display: grid;
      gap: 3.4mm;
      margin: 6mm 0;
    }

    .check-item {
      display: grid;
      grid-template-columns: 7mm 1fr;
      gap: 3.5mm;
      align-items: start;
      padding: 3.6mm 4mm;
      border: 1px solid rgba(226, 216, 202, 0.9);
      border-radius: 12px;
      background: rgba(255, 253, 248, 0.72);
    }

    .box {
      width: 5mm;
      height: 5mm;
      border: 1.5px solid ${brand.gold};
      border-radius: 4px;
      margin-top: 0.5mm;
    }

    .check-item p {
      color: ${brand.text};
      font-size: 12.5px;
      line-height: 1.45;
    }

    .examples {
      margin-top: 6mm;
      padding: 6mm;
      background: rgba(29, 84, 67, 0.06);
    }

    .examples h3,
    .note strong {
      display: block;
      color: ${brand.green};
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 3mm;
    }

    .examples p + p {
      margin-top: 3mm;
    }

    .note {
      margin-top: 6mm;
      padding: 6mm;
      background: rgba(241, 223, 189, 0.3);
      box-shadow: none;
    }
  </style>
</head>
<body>
  <section class="pdf-page cover">
    <header class="cover-brand">
      <img src="${logoDataUri}" alt="" />
      <span>${brand.studio}</span>
    </header>

    <main class="cover-main">
      <span class="resource-badge">Premium PDF resursas</span>
      <h1>${escapeHtml(resource.title)}</h1>
      <p class="cover-subtitle">${escapeHtml(resource.subtitle)}</p>
    </main>

    <footer class="cover-meta">
      <span>${escapeHtml(resource.plan)}</span>
      <span>${totalPages} puslapių workbook</span>
      <span>${pageNumber(1, totalPages)}</span>
    </footer>
  </section>

  <section class="pdf-page">
    <header class="page-header">
      <div class="mini-brand">
        <img src="${logoDataUri}" alt="" />
        <span>${brand.studio}</span>
      </div>
      <span class="section-kicker">Naudojimo gidas</span>
    </header>

    <main class="usage-grid">
      <article class="usage-card">
        <h2>Kaip naudoti šį resursą</h2>
        <p>Skirk vieną ramią darbo sesiją pirmam užpildymui, o tada grįžk prie svarbiausių lentelių kartą per savaitę. Šis dokumentas sukurtas ne teorijai, o aiškiems sprendimams, kuriuos galima matyti, žymėti ir kartoti.</p>
        <br />
        <p>Pradėk nuo puslapių eilės, o jeigu jau žinai, kur stringi, eik tiesiai į aktualią sekciją. Užpildyk trumpai, konkrečiai ir palik vietos korekcijoms.</p>
      </article>

      <article class="structure-card">
        <h2>Turinio struktūra</h2>
        <ol class="structure-list">${structure}</ol>
      </article>
    </main>

    <footer class="page-footer">
      <span>${brand.studio}</span>
      <span>${pageNumber(2, totalPages)}</span>
    </footer>
  </section>

  ${resource.sections.map((section, index) => renderSection(resource, section, index, totalPages)).join("")}
</body>
</html>
`;
};

const findEdgeExecutable = () => edgeCandidates.find((candidate) => fs.existsSync(candidate));

const removeDirIfInsideRoot = (dirPath) => {
  const resolved = path.resolve(dirPath);
  if (!resolved.startsWith(rootDir)) {
    throw new Error(`Refusing to remove path outside project: ${resolved}`);
  }

  fs.rmSync(resolved, { recursive: true, force: true });
};

const printPdf = (edgeExecutable, htmlPath, pdfPath, profileDir) => {
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    "--disable-extensions",
    `--user-data-dir=${profileDir}`,
    "--print-to-pdf-no-header",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ];

  const result = spawnSync(edgeExecutable, args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    throw new Error(`PDF generation failed for ${path.basename(pdfPath)}: ${result.stderr || result.stdout}`);
  }
};

const main = () => {
  const edgeExecutable = findEdgeExecutable();
  if (!edgeExecutable) {
    throw new Error("Microsoft Edge executable was not found. PDF files were not generated.");
  }

  const tempRoot = path.join(outputRoot, "_tmp-html");
  const profileDir = path.join(rootDir, ".tmp-edge-pdf-profile");
  fs.mkdirSync(tempRoot, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });

  try {
    for (const resource of resources) {
      const totalPages = resource.sections.length + 2;
      if (totalPages !== resource.targetPages) {
        throw new Error(`${resource.fileName} has ${totalPages} pages, expected ${resource.targetPages}.`);
      }

      const outputDir = path.join(outputRoot, resource.dir);
      fs.mkdirSync(outputDir, { recursive: true });

      const htmlPath = path.join(tempRoot, resource.fileName.replace(/\.pdf$/, ".html"));
      const pdfPath = path.join(outputDir, resource.fileName);

      fs.writeFileSync(htmlPath, buildHtml(resource), "utf8");
      printPdf(edgeExecutable, htmlPath, pdfPath, profileDir);
      console.log(`Generated ${path.relative(rootDir, pdfPath)} (${totalPages} pages)`);
    }
  } finally {
    removeDirIfInsideRoot(tempRoot);
    removeDirIfInsideRoot(profileDir);
  }
};

main();
