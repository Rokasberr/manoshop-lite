# Stilloak Studio Personal Studio Audit

Data: 2026-08-13  
Šaka: `audit/personal-studio`  
Apimtis: Demo kelias, Asmeninis planas, Saving Studio, Personal Budget System, Savings Tracker. `ai-sales-copilot-saas/` nebuvo audituotas ir neliestas.

## 1. Esamos Asmeninio sistemos santrauka

Repo yra React/Vite client, Node/Express API ir MongoDB modelių sistema. Galiojantys planai išlaikyti: `basic` / `bazinis` kaip Demo 0 EUR, `personal` / `asmeninis` kaip Asmeninis 14.99 EUR/mėn., `private_business` / `privatus_verslas` kaip Verslas 44.99 EUR/mėn.

Demo yra vidinis planas be Stripe. Asmeninis ir Verslas naudoja Stripe prenumeratos checkout, webhook ir atsarginį session sync. Pilna Saving Studio API apsaugota `protect` + `requireSavingsStudioPro`, todėl Demo mato tik ribotą nario/Demo zoną. Business Studio serverio ir client route prieiga likusi Verslas planui.

## 2. Kas jau pilnai veikia

- Bazinė auth eiga: registracija, email normalizavimas, pasikartojančio email blokavimas, login, bcrypt hash, JWT, profile refresh ir 401 atveju lokalaus tokeno išvalymas.
- Demo aktyvavimas per `/api/billing/activate-demo-plan` be kortelės ir be Stripe Price ID.
- Asmeninio checkout kūrimas per `/api/billing/create-payment-session`, Stripe Price ID iš `STRIPE_PRICE_ASMENINIS`.
- Session sync po redirect tikrina session ownership pagal `metadata.userId` / `client_reference_id`.
- Webhook raw body konfigūracija ir idempotentinis webhook event saugojimas.
- Saving Studio CRUD: profile, budgets, entries, goals, recurring expenses, recurring-to-entry, summary, activity, backup, HTML/TXT summary export, manual summary email.
- Vartotojų duomenų izoliacija Saving Studio modeliuose ir controller query naudoja `user: req.user._id`.
- Mokami Excel failai yra `server/protected-digital-products/excel`, ne `client/public`, ir download remiasi `DigitalProductPurchase` su `status: "paid"`.

## 3. Kas veikia tik iš dalies

- Stripe prenumeratos gyvavimo ciklas: aktyvavimas ir webhook sync yra, bet nėra savitarnos valdymo portalo, prenumeratos atšaukimo UI, sąskaitų prenumeratoms UI ir aiškaus retry/payment recovery kelio.
- `past_due`, `unpaid`, `incomplete`, `incomplete_expired` būsenos normalizuojamos serverio politikoje, bet vartotojo patirtis šioms būsenoms yra minimali.
- Saving Studio suvestinės eksportas yra HTML/TXT, ne PDF.
- CSV importas turi preview ir validaciją, bet neturi duplicate aptikimo ar idempotentiško importo.
- Email infrastruktūra yra Saving Studio ir digital delivery keliams, bet nėra registracijos, email verification, password reset, payment failed ar subscription cancel laiškų.
- Teisiniai puslapiai yra, bet jų tekstai bendriniai ir neturi pilnų verslo teikėjo duomenų.
- Mobilus/responsive dizainas daug kur numatytas, bet Saving Studio labai ilgas puslapis su daug grid/tables, be naršyklės E2E ar screenshot patikros.

## 4. Ko visai nėra

- Slaptažodžio atkūrimo flow.
- El. pašto patvirtinimo flow.
- Paskyros ištrynimo ir vartotojo duomenų eksportavimo flow.
- Stripe Customer Portal arba alternatyvus prenumeratos valdymas.
- Prenumeratos atšaukimo vartotojo veiksmas.
- Prenumeratos mokėjimų istorijos/sąskaitų UI atskirai nuo vienkartinių order invoice.
- Saving Studio PDF suvestinė.
- Automated browser/mobile E2E testai.

## 5. Demo -> Asmeninis vartotojo kelio būklė

Būklė: dalinai produkciškai paruošta.

Kelias: `/` -> `/pricing` -> Demo pasirinkimas -> `/register` su `selectedPlan: basic` -> registracija -> `/api/billing/activate-demo-plan` -> `/members/savings-studio` -> ribotas Demo turinys iš `BazinisMemberPage` -> planai/profilis -> upgrade į Asmeninį per Stripe checkout -> `/billing/success` -> session sync -> pilna Saving Studio.

Gera: Demo neprašo kortelės, turi realią mini biudžeto, checklist, resursų ir locked Asmeninis vertę. Demo negali pasiekti pilnos Saving Studio API, Journal pilna prieiga ir Business Studio yra užrakinti. 14.99 EUR Asmeninio kaina išlaikyta client ir server konfigūroje.

Trūkumai: daug client tekstų turi sugadintus lietuviškus simbolius (`Å`, `Ä`, `ā‚¬`), todėl produkcinis pasitikėjimas žemas. Po login aktyvus Demo nukreipiamas tiesiai į `/members/savings-studio`, bet nario zona iš pradžių vadinasi `savings-studio`, nors joje yra platesnis member dashboard. Upgrade po nesėkmingo mokėjimo neturi aiškaus recovery kelio, tik cancel puslapį.

## 6. Saving Studio funkcijų matrica

| Funkcija | Client failai | Server/API/modelis | Apsauga/izoliacija | Testai | Būklė ir priėmimo kriterijai |
|---|---|---|---|---|---|
| Finansinis profilis | `client/src/pages/SavingsStudioPage.jsx`, `client/src/services/savingsStudioService.js` | `GET/PUT /savings-studio/profile`, `SavingsStudioProfile` | `requireSavingsStudioPro`, `user` unique | nėra specifinių CRUD testų | Veikia. Reikia testų: validuoja max sumas, neigiamas sumas, izoliuoja kitą user. |
| Pajamos | tie patys | `SavingsStudioProfile.monthlyIncome` | user profile | nėra | Dalinė: yra mėnesinės pajamos, nėra kelių pajamų šaltinių įrašų. Priėmimas: aiškiai dokumentuoti, kad tai vienas mėnesio įvesties laukas, arba pridėti income ledger. |
| Išlaidos | `SavingsStudioPage.jsx`, helpers | `GET/POST/PUT/DELETE /entries`, `SavingsEntry` | user query visur | nėra | Veikia. Reikia server testų CRUD, ribinių sumų, datų ir 404 kitam user. |
| Išlaidų kategorijos | helpers + meta | `GET /meta`, controller `CATEGORIES` | pro guard | nėra | Veikia, bet kategorijos hardcoded. Priėmimas: stabilus LT encoding ir kategorijų migracijos politika. |
| Mėnesio biudžetai | `SavingsStudioPage.jsx` | `GET/PUT /budgets`, `SavingsBudget` | user + month, unique index | nėra | Veikia. Rizika: `deleteMany` + `insertMany` nėra transakcija. Priėmimas: testai ir klaidos atveju neprarasti senų budget. |
| Taupymo tikslai | `SavingsStudioPage.jsx` | `/goals`, `SavingsGoal` | user query | nėra | Veikia. Reikia testų current > target, targetDate riboms ir progress UI. |
| Pasikartojančios išlaidos | `SavingsStudioPage.jsx` | `/recurring`, `RecurringExpense` | user query | nėra | Veikia. Reikia testų weekly/quarterly/yearly skaičiavimams. |
| Expense create/edit/delete | `SavingsStudioPage.jsx` | `/entries` | user query + limiter | nėra | Veikia. Priėmimas: dvigubo submit ir confirm delete patikrinti E2E. |
| Recurring -> faktinė išlaida | `SavingsStudioPage.jsx` | `POST /recurring/:id/log` | user query, month duplicate guard | nėra | Veikia. Priėmimas: testuoti same month 409 ir skirtingų user izoliaciją. |
| CSV import preview | helpers parser + page | `POST /entries/import-preview` | pro guard + import limiter | nėra | Veikia. Trūksta duplicate aptikimo. Priėmimas: preview rodo duplicate statusą. |
| CSV importas | helpers + service | `POST /entries/import` | pro guard + import limiter | nėra | Dalinė. Importuoja validžias eilutes, bet dubliuoja pakartotinį importą. |
| Mėnesio suvestinė | `SavingsStudioPage.jsx` | `GET /summary`, `buildSavingsSummaryPayload` | user query | nėra | Veikia. Skaičiavimų testai būtini prieš 10/10. |
| Finansinio progreso rodikliai | page + helpers | `buildInsights` | user query | nėra | Dalinė: daug logikos, bet be deterministinių testų. |
| Veiklos istorija | page timeline | `GET /activity`, `SavingsStudioAuditLog` | user query, 36 rows | nėra | Veikia. Priėmimas: visi mutacijos veiksmai loguojami, scheduler logai rodomi. |
| Atsarginė kopija | service download | `GET /backup` | pro guard + limiter | nėra | Veikia. Priėmimas: patvirtinti ar JSON gali turėti email/subscription ir ar tai aišku vartotojui. |
| Duomenų eksportas | backup | `GET /backup` | pro guard | nėra | Dalinė: tai techninis backup, ne GDPR pilnas eksportas. |
| PDF/TXT suvestinė | summary download | `GET /summary-export?format=html/txt` | pro guard | nėra | TXT/HTML veikia, PDF nėra. Priėmimas: arba pakeisti produkto copy į TXT/HTML, arba įgyvendinti PDF. |
| Email suvestinės | page settings + manual send | `PUT /email-settings`, `POST /summary-email`, email service | pro guard + limiter | nėra | Dalinė: veikia jei Brevo/SMTP sukonfigūruota, bet copy turi "AI" tekstus be realaus AI. |
| Scheduler | server startup service | `savingsStudioScheduler.js`, env flags | tik aktyvūs non-free active/trialing | nėra | Dalinė. Reikia testų interval/due logic ir prod observability. |

## 7. Skaičiavimų rizikos

- Bendros pajamos: naudojamas `profile.monthlyIncome`, nėra income ledger ar periodų istorijos.
- Bendros išlaidos: `buildSummary` sumuoja visus entries, o mėnesio suma filtruoja `new Date().toISOString().slice(0,7)`.
- Laiko zona: serverio UTC `toISOString()` ir client local `new Date()` maišymas gali per mėnesio ribą rodyti skirtingą einamą mėnesį.
- Tikslų tempas: client ir server turi atskiras `monthsUntilTargetDate` implementacijas; viena naudoja UTC, kita local.
- Fiksuotos/kintamos: fixed skaičiuojama pagal logged recurring + outstanding recurring, bet ne pagal vartotojo pažymėtą expense tipą.
- Neigiamos reikšmės: input validacija atmeta neigiamas pajamas, tikslus ir išlaidas; tai tinka expense modeliui, bet ne refund/credit scenarijams.
- Labai didelės reikšmės: profile riboja iki 100,000,000, entries/goals/recurring neturi tokios pačios viršutinės ribos.
- CSV duplicate: nėra dedupe pagal `date + amount + title`, nors client turi `buildSavingsEntryKey`.
- Apvalinimas: pinigai roundinami į 2 decimals, bet JS `Number` lieka floating point; reikia testų ribinėms sumoms.
- Refresh: duomenys saugomi MongoDB ir vėl užkraunami, bet local wizard būsena saugoma localStorage.

## 8. UX ir mobiliosios versijos problemos

- Sugadinti LT simboliai keliuose failuose: README, subscriptionPlans, digitalProducts, infoPages, SavingsStudioDemo copy, email templates.
- Saving Studio puslapis labai ilgas ir tankus; nėra E2E screenshot patikros mobile viewport.
- Dalis copy vartoja "AI mėnesio komentaras" / "AI savaitės komentaras", nors AI neįgyvendintas ir šiame etape neturi būti pridėtas.
- Loading ir error būsenos pagrindiniam Saving Studio load yra, tačiau per-section empty/error states ne visur vienodai aiškios.
- Delete operacijos turi atskirus loading state, bet reikia naršyklės patikros, ar confirm delete visur pakankamai aiškus.
- Dashboard prioritetas geras Asmeniniam, bet nario zona turi daug Business/Digital/Plans elementų, kurie gali atitraukti nuo Saving Studio beta tikslo.

## 9. Stripe ir prenumeratos trūkumai

P1:
- Nėra Stripe Customer Portal arba savitarnos prenumeratos valdymo.
- Nėra vartotojo inicijuojamo prenumeratos atšaukimo.
- Nėra prenumeratos sąskaitų/mokėjimų istorijos UI; `Payment` įrašai kuriami webhook invoice eventams, bet client jų nerodo.
- `ProfilePage.handleSyncStripeMembership()` kviečia `syncStripeMembership()` be `sessionId`, o serveris reikalauja session ID, todėl "check membership" neveiks bendram fallback scenarijui.
- `past_due`, `canceled`, `unpaid`, `incomplete` būsenoms nėra aiškaus vartotojo recovery UX.

P2:
- Build rodo didelį client chunk. Reikia code-splitting, ypač Saving Studio/Business/admin zonoms.
- Stripe klaidų tekstai kai kur ASCII, kai kur sugadinti LT simboliai.

## 10. El. laiškų trūkumai

Veikia/dalinai veikia:
- Saving Studio manual/scheduled summary email per Brevo arba SMTP.
- Digital delivery email senesniems Order digital asset keliams.

Nėra:
- Registracijos laiško.
- El. pašto patvirtinimo.
- Slaptažodžio atkūrimo.
- Narystės mokėjimo patvirtinimo laiško.
- Nepavykusio mokėjimo laiško.
- Prenumeratos atšaukimo laiško.
- Naujo `DigitalProductPurchase` checkout produkto atsisiuntimo laiško; dabartinis protected Excel kelias remiasi paskyra, ne laišku.

Reikalingi env pavadinimai: `EMAIL_FROM`, `EMAIL_LOGO_URL`, `BREVO_API_KEY`, `BREVO_API_TIMEOUT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SAVINGS_STUDIO_SUMMARY_SCHEDULER_ENABLED`, `SAVINGS_STUDIO_SUMMARY_INTERVAL_MINUTES`.

## 11. Teisiniai ir pasitikėjimo trūkumai

Yra susieti puslapiai: privacy, terms, cookie policy, returns, digital downloads policy, contact, support. Trūksta atskiros ir aiškios prenumeratos sąlygų, atšaukimo tvarkos narystei, duomenų ištrynimo procedūros produkto viduje ir pilnų paslaugos teikėjo duomenų. Verslo duomenų neišgalvoti: savininkas turi pateikti juridinį/asmeninį teikėją, adresą, kodą/PVM jei taikoma, kontaktinį email, refund/cancellation taisyklių galutinį tekstą.

## 12. Excel produktų integracijos būklė

Audituoti tik integracijos sluoksniai; XLSX failai neatidaryti ir nekeisti.

- `StillOak_Personal_Budget_System.xlsx`: egzistuoja `server/protected-digital-products/excel/StillOak_Personal_Budget_System.xlsx`; client produktas naudoja `personal-budget-system-preview.png`; aprašyme minima instrukcija `Start Here`; prieiga saugoma per paid purchase.
- `StillOak_Savings_Tracker.xlsx`: egzistuoja `server/protected-digital-products/excel/StillOak_Savings_Tracker.xlsx`; client produktas naudoja `stilloak-savings-tracker-preview.png`; taip pat kataloge likęs `savings-tracker-preview.png`, kas kelia versijų aiškumo riziką.
- Abu produktai yra atskiri vienkartiniai pirkiniai, Asmeninio narystė jų automatiškai neatrakina.
- Server download kelias: `GET /api/digital-products/:productId/download/:format`, `protect`, `hasPurchasedProduct`.
- Trūksta testų, kad paid purchase įrašas privalomas konkrečiam productId ir konkrečiam user.

## 13. Testų aprėptis

Yra: auth validation, auth middleware, access control P1, client route guard source tests, Stripe checkout config, Stripe membership sync, webhook setup, env validation, admin route protection, paid digital products locked without purchase.

Trūksta testų plano:
- Auth controller register/login happy path su DB mock arba integration DB.
- Password reset, email verification, account delete/export, kai bus įgyvendinta.
- Saving Studio CRUD visiems modeliams.
- User data isolation kiekvienam Saving Studio endpointui.
- Skaičiavimai: month boundaries, rounding, large values, goal pace, fixed/flexible.
- CSV parser, preview, import, duplicate handling.
- Backup/export ir TXT/HTML/PDF summary.
- Scheduler due logic.
- Stripe lifecycle: canceled, past_due, unpaid, incomplete, incomplete_expired, subscription deleted.
- Stripe portal/cancel, kai bus įgyvendinta.
- DigitalProductPurchase paid download happy/forbidden/missing file.
- Browser/mobile E2E: Demo -> Asmeninis, login/logout, dashboard, Saving Studio forms, pricing.

## 14. P0 problemos

P0 skaičius: 0.

Šiame statiniame audite nerasta tiesioginio saugumo, mokėjimų blokavimo ar duomenų praradimo P0, kurį reikėtų taisyti prieš bet kokį kitą darbą. Kritinė sąlyga: nedaryti launch be P1 žemiau.

## 15. P1 problemos

1. Nėra prenumeratos valdymo/atšaukimo portalo ar alternatyvos.
2. Nėra prenumeratos mokėjimų istorijos ir sąskaitų UI.
3. `ProfilePage` membership sync be session ID neveikia kaip bendras recovery.
4. Nėra password reset.
5. Nėra email verification.
6. Nėra paskyros ištrynimo ir duomenų eksportavimo flow.
7. Saving Studio neturi skaičiavimų ir CRUD testų.
8. CSV importas nedetekuoja duplicate ir gali dubliuoti išlaidas.
9. Mėnesio/laiko zonos skaičiavimai dviprasmiški ties mėnesio riba.
10. Lietuviškų tekstų encoding sugadinimas produkcijoje.
11. Saving Studio summary žada/rodo AI copy, nors AI nėra produkto dalis.
12. Nėra aiškios payment failed/past_due/canceled vartotojo recovery patirties.
13. Teisiniai puslapiai neturi pilnų prenumeratos ir teikėjo duomenų.

## 16. P2 patobulinimai

P2 skaičius: 11.

- Code split didelius client chunkus.
- Sutankinti Asmeninio dashboard navigacijos prioritetus aplink Saving Studio beta.
- Pridėti mobile screenshot regresijos patikrą.
- Sutvarkyti vienodą planų copy per translations ir constants.
- Pašalinti seną/alternatyvų Savings Tracker preview arba aiškiai jį pažymėti.
- Pridėti per-section empty states Saving Studio moduliuose.
- Aiškiau pažymėti, kad Excel produktai yra anglų/lietuvių kalba pagal konkretų failą.
- Pridėti export/import paaiškinimą prieš backup su asmens duomenimis.
- Pridėti accessibility auditą formų `aria` ir keyboard navigacijai.
- Pagerinti Stripe cancel puslapį su konkrečiu bandymo pakartojimu.
- Pridėti observability logus scheduler rezultatams be jautrių duomenų.

## 17. Rekomenduojama įgyvendinimo seka

1. Sutvarkyti LT encoding ir pašalinti klaidinantį AI copy.
2. Įgyvendinti auth trūkstamus trust flow: password reset, email verification, account delete/export.
3. Sutvarkyti Stripe portal/cancel/payment history/invoices ir `ProfilePage` sync recovery.
4. Pridėti Saving Studio server unit/integration testus skaičiavimams, CRUD, CSV ir izolacijai.
5. Sutvarkyti CSV duplicate prevenciją ir mėnesio/timezone politiką.
6. Pridėti browser/mobile E2E Demo -> Asmeninis -> Saving Studio.
7. Sutvarkyti teisinių puslapių savininko pateikiamą informaciją.
8. Tik tada beta launch.

## 18. Kiekvieno darbo priėmimo kriterijai

- Encoding: `rg "Å|Ä|ā||Æ|€"` neberanda sugadinto copy user-facing failuose, o lietuviški puslapiai vizualiai tvarkingi.
- Auth recovery: vartotojas gali prašyti reset link, pakeisti slaptažodį, patvirtinti email, ištrinti/exportuoti duomenis; yra testai.
- Stripe portal: Asmeninis vartotojas iš profilio atidaro valdymą, mato invoice/payment history, gali cancelinti; webhook po cancel pakeičia statusą.
- Saving Studio testai: padengti visi CRUD endpointai, skaičiavimų helperiai, CSV importas, user isolation.
- CSV duplicate: preview parodo duplicate, import nekuria pakartotinių eilučių be aiškaus vartotojo pasirinkimo.
- Timezone: vienas dokumentuotas month key metodas client/server, testai ties mėnesio pabaiga.
- Legal: owner pateikti duomenys įrašyti, prenumeratos/atšaukimo/refund sąlygos susietos pricing, checkout ir footer.

## 19. Failai, kuriuos reikės keisti

Tikėtini failai: `client/src/i18n/translations.js`, `client/src/constants/subscriptionPlans.js`, `client/src/constants/digitalProducts.js`, `client/src/content/infoPages.js`, `client/src/pages/ProfilePage.jsx`, `client/src/pages/PricingPage.jsx`, `client/src/pages/BillingSuccessPage.jsx`, `client/src/pages/BillingCancelPage.jsx`, `client/src/pages/SavingsStudioPage.jsx`, `client/src/components/savings/savingsStudioHelpers.js`, `server/controllers/authController.js`, `server/routes/authRoutes.js`, `server/models/User.js`, `server/controllers/billingController.js`, `server/routes/billingRoutes.js`, `server/services/stripeMembershipService.js`, `server/controllers/savingsStudioController.js`, `server/services/savingsStudioSummaryEmailService.js`, `server/services/savingsStudioScheduler.js`, `server/services/digitalProductPurchaseService.js`, `server/tests/*`.

## 20. Savininko rankiniai veiksmai

- Pateikti realius paslaugos teikėjo duomenis ir galutinę teisinę politiką.
- Stripe Dashboard patikrinti `STRIPE_PRICE_ASMENINIS` ir `STRIPE_PRICE_PRIVATUS_VERSLAS`, webhook URL `/api/billing/webhook`, eventus ir Customer Portal nustatymus.
- Brevo/SMTP patvirtinti sender/domain ir `EMAIL_FROM`.
- Patikrinti produkcinį `CLIENT_URL`, `VITE_API_URL`, Render/Vercel env be slaptų reikšmių atskleidimo.
- Rankiniu būdu pereiti sandbox/test Stripe scenarijus, bet šiame audite realūs mokėjimai neatlikti.

## 21. Patikros komandos

- `git status --short`: pradinėje būsenoje pakeitimų neišvedė.
- `git branch --show-current`: `audit/personal-studio`.
- Paskutiniai commitai: `7f095d4 fix: enforce plan access and protect member resources`, `10846a7 fix: harden production membership flow`, `86b9784 remove collection section`, `66b6593 feat: production ready website audit and polish`, `19186c9 feat: add cookie consent preferences`.
- `npm.cmd test`: praėjo, 48/48.
- `npm.cmd run lint`: praėjo, patikrinti 89 backend JS failai.
- `npm.cmd run typecheck`: praėjo, TypeScript projektas nekonfigūruotas, backend JS syntax checks praėjo.
- `npm.cmd run build`: praėjo, Vite build sėkmingas; įspėjimas dėl `assets/index-*.js` > 500 kB.
- `git diff --check`: žr. galutinę komandų suvestinę po dokumento sukūrimo.
- `git status --short`: žr. galutinę komandų suvestinę po dokumento sukūrimo.

## 22. Galutinė santrauka

Trumpa santrauka: Asmeninio plano branduolys yra realus ir veikiantis: Demo atskirtas nuo Stripe, pilna Saving Studio apsaugota Asmeniniam/Verslui, Excel produktai apsaugoti pagal paid purchase. Sistema dar nėra 10/10 produkcijai dėl trust, billing savitarnos, testų, legal ir UX/encoding spragų.

P0 problemų skaičius: 0.

P1 problemų skaičius: 13. Sąrašas pateiktas 15 skyriuje.

P2 problemų skaičius: 11.

Saving Studio produkcinio pasirengimo įvertinimas: 7/10. Funkcijų gylis geras, API apsauga ir izoliacija stipri, bet trūksta skaičiavimų testų, duplicate CSV kontrolės, PDF pažado atitikimo, timezone politikos ir UX/encoding polish.

Asmeninio plano bendras įvertinimas: 6.5/10. Planų ir prieigos architektūra gera, tačiau launch blokuoja prenumeratos valdymo nebuvimas, auth trust flow trūkumai, payment recovery spragos, teisinių tekstų neužbaigtumas ir sugadintas lietuviškas copy.

Sukurti arba pakeisti failai šiame audite: `PERSONAL_STUDIO_AUDIT.md`.

Patvirtinimas: programinis kodas, `.env`, išorinės paskyros, deploy, commit ir push nebuvo pakeisti. Nebuvo vykdyta `npm install`, realus Stripe mokėjimas ar išorinių paskyrų pakeitimai.
