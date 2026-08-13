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

- [ ] Saving Studio srautų auditas: pradėta nuo `SavingsStudioPage.jsx`, `savingsStudioHelpers.js`, `savingsStudioController.js`, `savingsStudioService.js` ir esamų testų spragų.
- [ ] Skaičiavimų ir duomenų validacija: pridėtos apsaugos nuo `NaN` goal progress, recurring monthly equivalent ir onboarding draft currency preview keliuose.
- [ ] Onboarding ir aiški vartotojo kelionė.
- [ ] Loading, empty, success ir error būsenos.
- [ ] Mobilus ir desktop UX.
- [ ] Planų ir kreditų elgesio nuoseklumas.
- [ ] Demo ir Asmeninio prieigų testai.
- [ ] Reikalingi unit ir integration testai: pridėtas `server/tests/savingsStudioHelpers.test.js` kliento helperių ir Saving Studio puslapio regresijai.
- [ ] Asmeninio plano smoke test.
- [ ] Galutinė Asmeninio plano diff peržiūra.
- [ ] Praeina milestone validacija.

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
