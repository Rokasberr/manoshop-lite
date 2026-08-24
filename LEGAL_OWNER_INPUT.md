# Stilloak Studio legal owner input

Šis failas skirtas savininkui pateikti viešus paslaugos teikėjo rekvizitus. Čia nerašyti slaptažodžių, API raktų, Stripe ID ar kitų paslapčių.

## Privaloma prieš pardavimų paleidimą

- `VITE_SERVICE_PROVIDER_NAME` - paslaugos teikėjo pilnas vardas arba juridinio asmens pavadinimas. Rodoma kontaktų, privatumo, sąlygų ir paslaugos teikėjo informacijos puslapiuose.
- `VITE_SERVICE_PROVIDER_TYPE` - veiklos forma, pvz. juridinis asmuo arba individuali veikla. Rodoma kontaktų ir teisinių dokumentų puslapiuose.
- `VITE_SERVICE_PROVIDER_CODE` - juridinio asmens kodas arba individualios veiklos numeris. Rodoma rekvizitų puslapyje.
- `VITE_SERVICE_PROVIDER_ADDRESS` - registruotos veiklos adresas. Rodoma rekvizitų puslapyje.
- `VITE_SERVICE_PROVIDER_EMAIL` - viešas kontaktinis el. paštas. Naudojama kontaktų ir teisinių užklausų informacijai.
- `VITE_SUPPORT_EMAIL` - pagalbos el. paštas. Naudojama pagalbai, privatumo užklausoms, grąžinimams ir paskyros klausimams.

## Privaloma tik jei taikoma arba nuspręsta viešinti

- `VITE_SERVICE_PROVIDER_VAT_CODE` - PVM mokėtojo kodas, jei paslaugos teikėjas yra PVM mokėtojas.
- `VITE_SERVICE_PROVIDER_PHONE` - telefono numeris, jei savininkas nusprendžia jį viešinti.

## Dokumentų metaduomenys

- `VITE_SERVICE_PROVIDER_WEBSITE` - viešas svetainės adresas.
- `VITE_LEGAL_EFFECTIVE_DATE` - teisinės informacijos galiojimo pradžios data.
- `VITE_LEGAL_VERSION` - dokumentų versija. Ji turi sutapti su serverio sutikimų versija, kai keičiami registracijos, prenumeratos ar skaitmeninio turinio sutikimai.
- Kanonine dokumentu versija kode laikoma shared/legalDocuments.cjs; production VITE_LEGAL_VERSION negali skirtis nuo serverio versijos.

## Kur naudojama

- `client/src/config/legal.js` - kanoninis viešų rekvizitų šaltinis frontend puslapiams.
- `client/src/content/infoPages.js` - privatumo politika, naudojimo sąlygos, slapukų ir saugyklos politika, prenumeratos sąlygos, grąžinimo tvarka, skaitmeninio turinio sąlygos, kontaktai ir duomenų teisės.
- `client/src/components/Footer.jsx` - pagalbos el. paštas ir teisinės nuorodos.
- `server/config/legalDocuments.js` - serverio fiksuojama sutikimų dokumentų versija.
- `server/models/UserConsent.js` - registracijos, prenumeratos ir skaitmeninio turinio sutikimų įrašai.

## Dar nebaigta produkcijai

- Savininkas turi pateikti realius rekvizitus ir sukonfigūruoti juos production frontend aplinkoje.
- Savininkas arba teisininkas turi patvirtinti galutini UserConsent audito irasu saugojimo termina. Dabartinis techninis sprendimas: sutikimu istorija eksportuojama saugiu sutrumpintu vaizdu, o po paskyros istrynimo sutikimu irasai lieka susieti tik su anonimizuota tombstone paskyra ir jos nereaktyvuoja.
- Teisininkas turi peržiūrėti galutinius tekstus, atsisakymo teisės formuluotes, saugojimo terminus, tarptautinius perdavimus ir apskaitos pareigas.
- Produkcijoje reikia patvirtinti, kad `VITE_*` vieši rekvizitai, `CLIENT_URL`, Stripe Live, Render, Vercel, MongoDB Atlas ir Brevo/SMTP konfigūracija atitinka realią veiklą.
- Si saka dar neturi buti laikoma tinkama merge i main, kol savininkas nepateike realiu rekvizitu ir teisininkas neperziurejo galutiniu tekstu.
