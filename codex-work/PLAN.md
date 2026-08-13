# Stilloak Studio autonomous execution plan

Codex privalo palaikyti šį failą kaip gyvą planą.

## Milestone 0 – Baseline audit

- [x] Patikrinta Git ir projekto struktūra: root workspace su `client` ir `server`, papildomas ne-workspace `ai-sales-copilot-saas`.
- [x] Perskaityta esama dokumentacija: `AGENTS.md`, `SPEC.md`, `PLAN.md`, `IMPLEMENT.md`, `STATUS.md`.
- [x] Surasti visi membership ir pricing šaltiniai: `server/config/subscriptionPlans.js`, `client/src/constants/subscriptionPlans.js`, `client/src/i18n/translations.js`, `client/src/pages/SavingsStudioPage.jsx`, `client/src/pages/admin/InstagramGeneratorPage.jsx`.
- [x] Surasti klientų ir serverio planų guard mechanizmai: `server/config/planAccess.js`, `server/middleware/authMiddleware.js`, `server/routes/savingsStudioRoutes.js`, `server/routes/businessRoutes.js`, `client/src/utils/membership.js`, `client/src/components/ProtectedRoute.jsx`, `client/src/pages/MemberAreaPage.jsx`.
- [x] Surasti testų, lint, typecheck ir build scenarijai: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- [x] Įvertinti esami Excel arba finansų prototipai: `server/protected-digital-products/excel/*.xlsx`, įskaitant Savings Tracker ir Personal Budget System.
- [x] Užfiksuotos dabartinės klaidos ir rizikos: senos kainos 14.99/44.99 klientui, serveriui, SEO tekstams ir admin Instagram šablonams.
- [x] Į PLAN.md įrašytos konkrečios rastos komandos ir priėmimo kriterijai.

## Milestone 1 – Bendras production pagrindas

- [x] Centralizuota teisinga kainodara: Demo 0, Asmeninis 24, Privatus verslas 99.
- [x] Pašalintos senos arba neteisingos kainos: `14.99` ir `44.99` neliko `client/src` arba `server` membership šaltiniuose.
- [x] Sutvarkytas planų pavadinimų nuoseklumas: LT planas `private_business` rodomas kaip `Privatus verslas`.
- [x] Patikrinta autentifikacija ir sesijos valdymas: padengta esamais auth, billing sync ir protected route testais.
- [x] Patikrinti backend planų guard: Demo negali pasiekti full Saving Studio ar Business Studio, Asmeninis negali pasiekti Business Studio.
- [x] Sutvarkytos kritinės bendros UI ir API klaidos: build scenarijus pervestas į sandboxe veikiantį Vite API wrapperį.
- [x] Praeina milestone validacija: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Milestone 2 – Asmeninis 10/10

- [x] Saving Studio srautų auditas: patikrinti `SavingsStudioPage.jsx`, `savingsStudioHelpers.js`, `savingsStudioController.js`, `savingsStudioService.js`, planų guard ir esamų testų spragos.
- [x] Skaičiavimų ir duomenų validacija: pridėtos apsaugos nuo `NaN` goal progress, recurring monthly equivalent, onboarding draft currency preview, `formatChange(undefined)` ir netvarkingų month option entry datų keliuose.
- [x] Onboarding ir aiški vartotojo kelionė: step-by-step usage wizard, pirmo setup validacija, inline klaidos ir serverio klaidos būsena.
- [x] Loading, empty, success ir error būsenos: pradinio Saving Studio užkrovimo retry, onboarding inline alert, biudžetų mėnesio retry, esamos empty/success būsenos ir mutation loading states validuoti statiniais testais.
- [ ] Mobilus ir desktop UX: route-level lazy loading sumažino pradinį klientų JS chunką nuo ~958 kB iki ~437 kB; `npm --workspace client run preview` sutvarkytas sandboxe ir `/pricing` HTTP smoke grąžina 200, bet Chrome headless screenshot smoke neįvyko dėl vietinio Chrome GPU proceso klaidos.
- [x] Planų ir kreditų elgesio nuoseklumas: atskiros kreditų sistemos kode nerasta; planų elgesys remiasi esamais membership/status guardais ir padengtas prieigos testais.
- [x] Demo ir Asmeninio prieigų testai: `accessControlP1.test.js` patvirtina, kad Demo/basic negali naudoti full Saving Studio API, o Personal gali.
- [x] Reikalingi unit ir integration testai: `server/tests/savingsStudioHelpers.test.js` dengia kliento helperius, onboarding valiutos preview ir Saving Studio mutation smoke regresiją.
- [x] Saving Studio mutation smoke: entries, CSV import, goals, recurring expenses ir delete veiksmai po sėkmės atnaujina priklausomą summary/activity būseną.
- [x] Asmeninio plano smoke test: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` ir preview HTTP 200 patikra praėjo.
- [x] Galutinė Asmeninio plano diff peržiūra: peržiūrėti pakeisti `SavingsStudioPage.jsx`, preview wrapperis, naujos Personal UI regresijos ir dokumentacijos diff.
- [x] Praeina milestone validacija.

## Milestone 3 – Privatus verslas 10/10

Pradėti tik užbaigus Milestone 2.

- [ ] Business Studio prieigos kontrolė.
- [ ] Business Dashboard.
- [ ] Store ir Orders srautai.
- [ ] Revenue rodymas ir validacija.
- [ ] CSV importas, jei pagrįstas esama architektūra.
- [ ] PDF invoice logika, jei ji yra produkto apimtyje.
- [ ] Site Builder esamos būklės išbaigimas.
- [ ] Withdrawals ir commission pateikiami saugiai, be realių operacijų.
- [ ] Admin prieigos kontrolė.
- [ ] Verslo plano testai ir smoke test.
- [ ] Praeina milestone validacija.

## Milestone 4 – Security ir kokybė

- [ ] Autentifikacijos ir autorizacijos peržiūra.
- [ ] Įvesties validacija.
- [ ] Klaidos neatskleidžia jautrios informacijos.
- [ ] Patikrinta, kad frontend neturi paslapčių.
- [ ] Patikrintos dependency ir konfigūracijos rizikos be nekontroliuojamų atnaujinimų.
- [ ] Responsive ir accessibility patikra.
- [ ] Kritinių srautų regresijos testai.
- [ ] Praeina pilnas lint, typecheck, test ir build.

## Milestone 5 – Release candidate

- [ ] Galutinė viso diff peržiūra.
- [ ] Patikrintos kainos ir narystės.
- [ ] Patikrinti pagrindiniai vartotojų srautai.
- [ ] Atnaujinta projekto dokumentacija.
- [ ] Parengtas lokalus paleidimo vadovas.
- [ ] Parengtas rankinio production launch kontrolinis sąrašas.
- [ ] Visos likusios problemos suklasifikuotos pagal svarbą.
- [ ] STATUS.md nustatytas tikslus galutinis statusas.

## Stop-and-fix taisyklė

Jeigu milestone validacija nepraeina:

1. Nustatyti tikrąją priežastį.
2. Pataisyti savo pakeitimų sukeltą problemą.
3. Pakartoti patikrą.
4. Tik tada pereiti į kitą milestone.

Negalima pažymėti užduoties atlikta vien todėl, kad kodas sukompiliuojamas.
