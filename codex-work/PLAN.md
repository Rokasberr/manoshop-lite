# Stilloak Studio autonomous execution plan

Codex privalo palaikyti šį failą kaip gyvą planą.

## Milestone 0 – Baseline audit

- [x] Patikrinta Git ir projekto struktūra: root workspace su `client` ir `server`, papildomas ne-workspace `ai-sales-copilot-saas`.
- [x] Perskaityta esama dokumentacija: `AGENTS.md`, `SPEC.md`, `PLAN.md`, `IMPLEMENT.md`, `STATUS.md`.
- [x] Surasti visi membership ir pricing šaltiniai: `server/config/subscriptionPlans.js`, `client/src/constants/subscriptionPlans.js`, `client/src/i18n/translations.js`, `client/src/pages/SavingsStudioPage.jsx`, `client/src/pages/admin/InstagramGeneratorPage.jsx`.
- [x] Surasti klientų ir serverio planų guard mechanizmai: `server/config/planAccess.js`, `server/middleware/authMiddleware.js`, `server/routes/savingsStudioRoutes.js`, `server/routes/businessRoutes.js`, `client/src/utils/membership.js`, `client/src/components/ProtectedRoute.jsx`, `client/src/pages/MemberAreaPage.jsx`.
- [x] Surasti testų, lint, typecheck ir build scenarijai: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- [x] Įvertinti esami Excel arba finansų prototipai: `server/protected-digital-products/excel/*.xlsx`, įskaitant Savings Tracker ir Personal Budget System.
- [x] Užfiksuotos dabartinės klaidos ir rizikos: senos kainos 24/99 klientui, serveriui, SEO tekstams, dokumentacijai ir admin Instagram šablonams.
- [x] Į PLAN.md įrašytos konkrečios rastos komandos ir priėmimo kriterijai.

## Milestone 1 – Bendras production pagrindas

- [x] Centralizuota teisinga kainodara: Demo 0, Asmeninis 14,99, Privatus verslas 44,99.
- [x] Pašalintos senos arba neteisingos kainos: aktyviuose membership šaltiniuose nebeliko 24/99 kainų.
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
- [x] Mobilus ir desktop UX: route-level lazy loading sumažino pradinį klientų JS chunką nuo ~958 kB iki ~437 kB; `npm --workspace client run preview` sutvarkytas sandboxe, `/pricing` HTTP smoke grąžina 200, o `server/tests/savingsStudioPersonalUi.test.js` saugo mobile-first shell, breakpoint grid, modal overflow ir table-free Saving Studio layout regresijas. Chrome/Edge headless screenshot bandymai lieka aplinkos ribojimas dėl vietinio GPU proceso klaidos.
- [x] Planų ir kreditų elgesio nuoseklumas: atskiros kreditų sistemos kode nerasta; planų elgesys remiasi esamais membership/status guardais ir padengtas prieigos testais.
- [x] Demo ir Asmeninio prieigų testai: `accessControlP1.test.js` patvirtina, kad Demo/basic negali naudoti full Saving Studio API, o Personal gali.
- [x] Reikalingi unit ir integration testai: `server/tests/savingsStudioHelpers.test.js` dengia kliento helperius, onboarding valiutos preview ir Saving Studio mutation smoke regresiją.
- [x] Saving Studio mutation smoke: entries, CSV import, goals, recurring expenses ir delete veiksmai po sėkmės atnaujina priklausomą summary/activity būseną.
- [x] Asmeninio plano smoke test: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` ir preview HTTP 200 patikra praėjo.
- [x] Galutinė Asmeninio plano diff peržiūra: peržiūrėti pakeisti `SavingsStudioPage.jsx`, preview wrapperis, naujos Personal UI regresijos ir dokumentacijos diff.
- [x] Praeina milestone validacija.

## Milestone 3 – Privatus verslas 10/10

Pradėti tik užbaigus Milestone 2.

- [x] Business Studio prieigos kontrolė: klientas naudoja `ProtectedRoute requireBusinessPlan`, backend `/business` routeris naudoja `protect` + `requireBusinessPlan`, o `accessControlP1.test.js` patvirtina Demo/Asmeninis blokavimą ir Verslo prieigą.
- [x] Business Dashboard: `/business/dashboard` rodo realią store būseną, paid-only pajamas ir paskutinius orderius iš backend `recentOrders`; neapmokėti checkout nėra skaičiuojami kaip pajamos.
- [x] Store ir Orders srautai: Site Builder kuria/atnaujina store per backend, pasirenkami tik `allowedForResale` produktai, public store checkout turi rate limiterį, o Business Orders rodo orderių būsenas ir paid-only pajamas.
- [x] Revenue rodymas ir validacija: dashboard, admin analytics ir Business Orders/Earnings pajamos, commission ir seller earnings skaičiuojami tik iš `paymentStatus: "paid"` orderių; pending/failed/canceled/refunded lieka audito lentelėje, bet ne pajamose.
- [x] CSV importas, jei pagrįstas esama architektūra: atskiro Business CSV import backend/UI sluoksnio nerasta, todėl nauja imitacija nepridėta.
- [x] PDF invoice logika, jei ji yra produkto apimtyje: bendras `/api/orders/:id/invoice` PDF generatorius naudojamas ir store savininkams per Business Orders paid-order mygtuką.
- [x] Site Builder esamos būklės išbaigimas: backend atmeta netinkamus selected product ID, tikrina slug unikalumą ir leidžia priskirti tik aktyvius perpardavimui leidžiamus skaitmeninius produktus.
- [x] Withdrawals ir commission pateikiami saugiai, be realių operacijų: commission skaičiuojama backend `commissionService`, seller earnings rodomi tik apmokėtiems orderiams, o payout aiškiai pažymėtas kaip rankinis MVP procesas.
- [x] Admin prieigos kontrolė: admin business analytics yra po `protect` + `adminOnly`; paid-only totals naudojami ir admin business analytics.
- [x] Verslo plano testai ir smoke test: pridėtas `server/tests/businessStudio.test.js`, padengiantis paid-only revenue, dashboard recent orders, invoice UI, store checkout limiterį ir selected product ID validaciją.
- [x] Praeina milestone validacija: `npm run lint`, `npm run typecheck`, `npm test` (62/62) ir `npm run build` praėjo.

## Milestone 4 – Security ir kokybė

- [x] Autentifikacijos ir autorizacijos peržiūra: `protect`, `requireBusinessPlan`, `requireSavingsStudioPro`, `adminOnly`, public store checkout ir order invoice prieigos peržiūrėtos; esami ir nauji testai dengia pagrindinius guard skirtumus.
- [x] Slaptažodžio atkūrimas: pridėti generic forgot/reset endpointai, hashintas vienkartinis tokenas su trumpu galiojimu, `authVersion` sesijų invalidavimas, el. pašto siuntimas per Brevo/SMTP ir avarinis owner CLI be slaptažodžio argumentų.
- [x] Įvesties validacija: auth/order/billing/Saving Studio validacijos patikrintos, Site Builder `selectedProducts` ID validacija sustiprinta, public checkout apribotas rate limiteriu.
- [x] Klaidos neatskleidžia jautrios informacijos: production error handler slepia 500 stack, env validacija tikrina privalomus kintamuosius, Stripe webhook raw body tvarka padengta testu.
- [x] Patikrinta, kad frontend neturi paslapčių: `rg` secret scan nerado realių raktų `client/src`; rasti tik `.env.example`, dokumentacijos placeholderiai ir testiniai slaptažodžiai admin-flow smoke skripte.
- [x] Patikrintos dependency ir konfigūracijos rizikos be nekontroliuojamų atnaujinimų: tiksliniai axios/postcss/autoprefixer/express/mongoose/morgan/nodemailer/sharp/Vite/plugin atnaujinimai pritaikyti; `npm audit --audit-level=high` nebeturi high/critical blokatorių, liko React Router 7 breaking-change moderate migracija.
- [x] Responsive ir accessibility patikra: pridėtas globalus keyboard skip-link į `Layout`, o Saving Studio mobile-first shell saugomas statine responsive regresija; naršyklinis screenshot smoke liko aplinkos apribojimas dėl vietinio Chromium GPU proceso klaidos.
- [x] Kritinių srautų regresijos testai: 72/72 Node testai dengia auth/access, password recovery, owner CLI safety, billing, Stripe, Saving Studio, Business Studio ir klientų layout accessibility regresijas.
- [x] Praeina pilnas lint, typecheck, test ir build.

## Milestone 5 – Release candidate

- [x] Galutinė viso diff peržiūra: peržiūrėti finansiniai Business pakeitimai, public checkout limiteris, invoice UI, dashboard panels, Vite wrapperiai, dependency pakeitimai ir dokumentacijos diff; `git diff --check` nerado whitespace klaidų.
- [x] Patikrintos kainos ir narystės: Demo 0, Asmeninis 14,99, Privatus verslas 44,99 patvirtinti kliento/serverio šaltiniuose, README ir release checklist; aktyvūs membership paviršiai saugomi regresiniu testu nuo 9/24/99 grįžimo.
- [x] Patikrinti pagrindiniai vartotojų srautai: auth/access, billing sync, Stripe webhook, Saving Studio, Business Dashboard/Orders/Site Builder/store checkout, invoice ir admin analytics guardai padengti 63/63 testais; `/pricing` preview smoke grąžino HTTP 200.
- [x] Atnaujinta projekto dokumentacija: README kainos ir production checklist pataisyti pagal patvirtintas kainas.
- [x] Parengtas lokalus paleidimo vadovas: `codex-work/RELEASE_CHECKLIST.md` dokumentuoja local RC setup, Node versiją, env, seed, dev, validation ir preview smoke komandas.
- [x] Parengtas rankinio production launch kontrolinis sąrašas: `codex-work/RELEASE_CHECKLIST.md` atskiria žmogaus patvirtinamus domeno, DB, Stripe Live, webhook, admin, email, backup ir monitoring veiksmus.
- [x] Visos likusios problemos suklasifikuotos pagal svarbą: React Router moderate major migracija, naršyklinio screenshot aplinkos ribojimas ir authenticated browser smoke be realių credentials palikti kaip nekritinės / owner sprendimo rizikos.
- [x] STATUS.md nustatytas tikslus galutinis statusas.

## Stop-and-fix taisyklė

Jeigu milestone validacija nepraeina:

1. Nustatyti tikrąją priežastį.
2. Pataisyti savo pakeitimų sukeltą problemą.
3. Pakartoti patikrą.
4. Tik tada pereiti į kitą milestone.

Negalima pažymėti užduoties atlikta vien todėl, kad kodas sukompiliuojamas.
