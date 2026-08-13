# Stilloak Studio autonomous status

PROJECT_STATE: RELEASE_CANDIDATE_READY

## Dabartinis milestone

Milestone 5 – Release candidate užbaigtas lokaliai.

## Užbaigta

- Sukurtas autonominio darbo setupas.
- Sukurtos saugumo taisyklės.
- Sukurtas pradinis vykdymo planas.
- Milestone 0 baseline auditas atliktas vietoje.
- Git būsena patikrinta: `git status --short` grąžino tuščią rezultatą.
- Projekto struktūra patikrinta: root workspace apima `client` ir `server`; `ai-sales-copilot-saas` egzistuoja kaip atskiras papildomas paketas.
- Rasti validacijos scenarijai: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Rasti Excel prototipai: `StillOak_Weekly_Planning_System.xlsx`, `StillOak_Savings_Tracker.xlsx`, `StillOak_Personal_Budget_System.xlsx`.
- Milestone 1 kainodara sutvarkyta: Demo 0, Asmeninis 24, Privatus verslas 99 serverio ir kliento planų šaltiniuose.
- Senų membership kainų `14.99` ir `44.99` `client/src` ir `server` skenuose nebeliko.
- LT `private_business` planas membership kontekste rodomas kaip `Privatus verslas`.
- Build scenarijus pataisytas per `scripts/build-client.js`, kad Vite build veiktų sandboxe be `vite.config.js` esbuild bundling klaidos.
- Asmeninio plano Saving Studio skaičiavimų apsauga pradėta: `getGoalProgress` ir `recurringMonthlyEquivalent` nebegrąžina `NaN` su blogais numeric input.
- Saving Studio onboarding peržiūra pervesta į saugų draft valiutos formatavimą, kad netinkamas tekstas nerodytų `NaN €`.
- Pridėtas `server/tests/savingsStudioHelpers.test.js` su kliento helperių ir Saving Studio puslapio regresijos patikromis.
- Milestone 2 faktinė būklė patikrinta prieš keitimą: Git būsena buvo švari, root workspace vis dar apima `client` ir `server`.
- Saving Studio mutation srautai sustiprinti: entry create/update/delete, CSV import confirm, goal create/update/delete, recurring create/update/delete ir recurring log po sėkmės atnaujina priklausomą summary/activity būseną.
- Onboarding išsaugojimas dabar iškart atnaujina išsaugotus biudžetus ir summary būseną, todėl pirmo setup įžvalgos nebelieka pasenusios iki reload.
- `server/tests/savingsStudioHelpers.test.js` papildytas Saving Studio mutation smoke regresija.
- Saving Studio pradinio užkrovimo klaida dabar rodoma kaip matoma retry būsena su `Bandyti dar kartą`, ne tik laikinas toast.
- `server/tests/savingsStudioHelpers.test.js` papildytas pradinio užkrovimo klaidos retry regresija.
- Saving Studio helperiai papildomai apsaugoti nuo `undefined%` mėnesio pokyčio tekste ir nuo netvarkingų entry datų month filter sąraše.
- Išlaidų filtravimas kliente nebekrenta, jei legacy entry neturi `title` arba `notes` reikšmės.
- Kliento route-level lazy loading įjungtas `client/src/App.jsx`: apsaugoti route guard išliko, o mokamos nario/admin/verslo erdvės kraunamos pagal poreikį.
- Pradinis Vite JS chunkas sumažėjo nuo ~958 kB iki ~437 kB; `MemberAreaPage` išskirtas į atskirą ~211 kB chunką.
- Saving Studio onboarding sustiprintas matoma inline klaida: validacijos tekstas išlieka formoje ir naudojamas tiek žingsnio keitimui, tiek galutiniam išsaugojimui.
- Saving Studio biudžetų mėnesio užkrovimas sustiprintas matoma retry būsena; formos saugojimas blokuojamas, kol biudžetai kraunami.
- Legacy išlaidų įrašai be `date` nebeturi numušti kliento filtravimo, mėnesio atrankos, datos rodymo ar edit formos.
- Pridėtas `server/tests/savingsStudioPersonalUi.test.js` su Personal UI regresijomis: onboarding inline error, budget retry state ir legacy date guard.
- `client` preview scenarijus pervestas į `scripts/preview-client.js`, kad Vite preview veiktų sandboxe be `vite.config.js` bundling prieigos klaidos.
- `npm --workspace client run preview -- --host 127.0.0.1 --port 4174` lokaliai pakėlė preview serverį; `Invoke-WebRequest http://127.0.0.1:4174/pricing` grąžino HTTP 200 ir React root HTML.
- `server/tests/savingsStudioPersonalUi.test.js` papildytas mobile-first responsive shell regresija: viewport meta, responsive `Layout` shell, Saving Studio breakpoint grid, filter grid, usage wizard modal overflow ir table-free layout.
- Chrome ir Edge headless screenshot smoke pakartotinai bandytas su izoliuotais profiliais ir software-rendering vėliavomis; abu keliai krito vietiniame Chromium GPU procese, todėl produktui pridėta statinė responsive regresija, o screenshot patikra palikta kaip aplinkos apribojimas.
- `.codex-tmp/` pridėtas į `.gitignore`, kad lokalūs autonominių smoke bandymų artefaktai nepatektų į commit kandidatus.
- Milestone 2 – Asmeninis 10/10 uždarytas po pilnos validacijos.
- Milestone 3 faktinis auditas pradėtas: patikrinti `businessRoutes.js`, `businessController.js`, `businessService.js`, `BusinessDashboardPage.jsx`, `SiteBuilderPage.jsx`, `BusinessProductsPage.jsx`, `BusinessOrdersPage.jsx`, `PublicStorePage.jsx`, `storeRoutes.js`, `Store`, `Order`, `Product` ir commission/Stripe checkout helperiai.
- Business Studio prieigos kontrolė patvirtinta: frontend `/business/*` maršrutai apsaugoti `ProtectedRoute requireBusinessPlan`, backend `/business` routeris apsaugotas `protect` + `requireBusinessPlan`, esami access control testai dengia Demo/Asmeninis/Verslas skirtumus.
- Pataisyta Business revenue rizika: dashboard ir admin business analytics nebesumuoja `pending`, `failed`, `canceled` ar `refunded` checkout įrašų kaip pajamų.
- `BusinessOrdersPage.jsx` pajamų kortelės rodo tik paid orderius, o neapmokėti/neužbaigti užsakymai lieka matomi tik audito lentelėje su aiškiu paaiškinimu.
- Pridėtas `server/tests/businessStudio.test.js` su paid-only revenue ir klientų Earnings UI regresijomis.
- Viešas store checkout apsaugotas `createWindowRateLimiter` per `storeCheckoutLimiter`, kad public Stripe session/order kūrimas nebūtų neribotas.
- Site Builder backend validacija sustiprinta: netinkami `selectedProducts` ID atmetami 400 klaida, o ne tyliai pašalinami iš payload.
- Business Orders UI papildytas paid-order PDF sąskaitos atsisiuntimo mygtuku per esamą `orderService.downloadInvoice`; neapmokėti orderiai rodo `po apmokejimo`.
- Business Dashboard papildytas realių `recentOrders` paneliu ir store būsenos paneliu; viršutinės pajamų kortelės dokumentuoja paid-only skaičiavimą.
- Milestone 3 – Privatus verslas 10/10 uždarytas po pilnos validacijos.
- Milestone 4 security auditas pradėtas ir atliktas pirmas ratas: secret scan, dependency audit, auth/authorization, env validation, security headers ir error handler peržiūra.
- Secret scan su `rg` nerado realių paslapčių frontend kode; rasti tik `.env.example`, dokumentacijos placeholderiai ir testiniai admin-flow smoke slaptažodžiai.
- Dependency rizikos sumažintos tiksliniais atnaujinimais: axios, postcss, autoprefixer, express, mongoose, morgan, nodemailer, sharp, Vite ir `@vitejs/plugin-react`.
- Vite 8 migracija pareikalavo pataisyti `scripts/build-client.js` ir `scripts/preview-client.js`, kad paketai būtų importuojami iš client workspace per `require.resolve(..., { paths: [root] })`.
- `npm audit --audit-level=high --cache .codex-tmp\npm-cache` neberodo high/critical blokatorių; liko 2 moderate React Router punktai, kurių siūlomas taisymas yra breaking `react-router-dom@7.18.2` migracija.
- Vite 8 build praėjo; preview HTTP smoke su `/pricing` grąžino HTTP 200 ir React root HTML.
- Milestone 4 uždarytas: globalus keyboard skip-link pridėtas į `Layout`, `main` turi `id="main-content"`, o `server/tests/clientRoutesP1.test.js` saugo layout accessibility regresiją.
- README kainos pataisytos pagal patvirtintus planus: Asmeninis 24 EUR/mėn., Privatus verslas 99 EUR/mėn.
- Parengtas `codex-work/RELEASE_CHECKLIST.md` su lokalaus RC paleidimo, validacijos, narystės, kritinių srautų, rankinio production launch ir likusių rizikų sąrašu.
- Finalinė diff peržiūra atlikta: peržiūrėti Business revenue, public checkout limiter, Site Builder ID validation, Business Orders invoice, Business Dashboard, Vite wrapper, dependency ir dokumentacijos pakeitimai.
- Kainų skenas patvirtino, kad `14.99` ir `44.99` nebeliko `client/src`, `server`, `README.md` ar `codex-work/RELEASE_CHECKLIST.md`.
- Finalinė validacija praėjo: audit high/critical, syntax wrappers, lint, typecheck, test, build ir preview HTTP smoke.

## Vykdoma

- Autonominis etapas 4/6 užbaigtas lokalia release-candidate būsena. Production veiksmai nevykdyti.

## Validacijos rezultatai

- `npm run lint` – PASS, patikrinti 92 backend JavaScript failai.
- `npm run typecheck` – PASS, TypeScript projekto nėra; backend JavaScript syntax check praėjo 92 failams.
- `npm test` – PASS, 63/63 serverio ir statinės klientų patikros praėjo.
- `npm run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`; finalinio build main JS chunkas ~280.72 kB, `MemberAreaPage` chunkas ~215.80 kB, Vite >500 kB chunk įspėjimo nėra.
- `npm --workspace client run preview -- --host 127.0.0.1 --port 4174` + `Invoke-WebRequest /pricing` – PASS, HTTP 200 ir React root HTML.
- `node --check scripts/preview-client.js` – PASS.
- `node` orchestrated Chrome headless screenshot smoke – FAIL dėl vietinio Chromium GPU proceso klaidos `GPU process isn't usable`; produkto HTTP preview buvo pasiekiamas.
- `node` orchestrated Edge headless screenshot smoke – FAIL dėl vietinio Chromium headless proceso klaidos su izoliuotu profiliu; produkto HTTP preview buvo pasiekiamas.
- `npm audit --audit-level=high --cache .codex-tmp\npm-cache` – PASS pagal high/critical kriterijų; liko 2 moderate React Router breaking-change punktai.
- `node -e` kainų regresijos skenas – PASS, `14.99` / `44.99` nerasta produkto kode ar release dokumentuose.
- `npm run build` po Vite 8 migracijos – PASS; Vite 8.2.1 build main JS chunkas ~280.72 kB, `MemberAreaPage` chunkas ~215.80 kB.
- `node --check scripts/build-client.js` ir `node --check scripts/preview-client.js` – PASS.
- Vite 8 preview HTTP smoke per Node orchestration – PASS, `/pricing` HTTP 200 ir React root HTML.
- `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.

## Priimti sprendimai

- Pirmiausia užbaigiamas Asmeninis planas.
- Privatus verslas pradedamas tik po Asmeninio priėmimo kriterijų.
- Production veiksmai nevykdomi autonomiškai.
- Interneto prieiga Codex darbo metu išjungta.
- Checkpoint commitus kuria PowerShell runneris.
- Kainodaros pataisa bus atliekama maža pakeitimų grupe, tada paleidžiamos visos root validacijos.
- `client/vite.config.js` paliekamas dev serveriui, o production build naudoja inline Vite wrapperį dėl sandbox prieigos ribojimo.
- `client` preview komanda taip pat perkelta į inline Vite wrapperį dėl tos pačios sandbox prieigos ribos kaip build; tai nekeičia produkcijos deploy ir lieka lengvai atšaukiama.
- Milestone 2 state-refresh problema sprendžiama konservatyviai: po sėkmingų Saving Studio mutacijų pakartotinai užkraunami tik susiję API duomenys, nekeičiant backend kontraktų ir nedarant optimistinių finansinių skaičiavimų.
- Pradinio užkrovimo klaida sprendžiama lokaliu retry UI, nes tai lengvai atšaukiama ir nekeičia autorizacijos ar API elgesio.
- Kliento bundle rizika sprendžiama route-level `React.lazy` be planų guard architektūros keitimo; `Suspense` fallback naudoja esamą `LoadingSpinner`.
- Planų ir kreditų peržiūra: atskiro kreditų limito mechanizmo kode nerasta; prieiga kontroliuojama planu ir aktyviu/trialing statusu.
- Milestone 2 responsive rizika valdoma statiniu regresiniu testu, nes prijungtas browser Node REPL įrankis šiame seanse neatsivėrė per tool discovery, o vietinis Chromium headless krenta prieš puslapio renderinimą.
- Business revenue sprendimas konservatyvus: finansinės kortelės rodo tik realiai apmokėtus orderius; pending checkout įrašai saugomi operacinei peržiūrai, bet nelaikomi pajamomis.
- Business CSV importas nepridėtas, nes esamoje Business Store/Dashboard architektūroje nėra CSV import sutarties; naujo netikro importo kūrimas prieštarautų SPEC reikalavimui neimituoti finansinių operacijų.
- Withdrawals/payouts lieka rankinis MVP procesas: rodomi commission ir seller earnings, bet nevykdomi jokie realūs išmokėjimai ar Stripe Live veiksmai.
- React Router 7 migracija atidėta kaip owner decision / atskiras techninis darbas, nes `npm audit fix --force` keistų router major versiją. High/critical audit kriterijus po Vite migracijos yra švarus.
- Vite 8 toolchain reikalauja modernios Node versijos; `codex-work/RELEASE_CHECKLIST.md` dokumentuoja Node.js `>=22.12.0`, lokaliai validuota su Node `v24.15.0`.
- `PROJECT_STATE: RELEASE_CANDIDATE_READY` nustatytas tik po finalinės audit/lint/typecheck/test/build/preview validacijos ir release checklist paruošimo.

## Blokatoriai

- Kritinių blokatorių release-candidate būsenai nėra.
- Nekritinė rizika: in-app browser Node REPL įrankis šiame kontekste nepasiekiamas; vietinis Chrome/Edge headless krito su GPU proceso klaida, todėl screenshot responsive smoke nebaigtas. Responsive layout regresija padengta statiniu testu.
- Authenticated Personal Studio naršyklinis smoke be testinės paskyros/slaptažodžių neatliktas; backend ir klientų guardai patikrinti statiniais/unit testais.
- Nekritinė dependency rizika: 2 moderate React Router audit punktai lieka iki owner-approved `react-router-dom@7` migracijos.

## Rankiniai production veiksmai

- Stripe Live nejungti autonomiškai; prieš launch rankiniu būdu patvirtinti `STRIPE_PRICE_ASMENINIS` ir `STRIPE_PRICE_PRIVATUS_VERSLAS`, kad jie atitinka 24 EUR/mėn. ir 99 EUR/mėn.
- Production deploy, domenas, DNS, live mokėjimai ir produkcinė DB lieka žmogaus patvirtinimui.
- Vykdyti `codex-work/RELEASE_CHECKLIST.md` production sąrašą prieš bet kokį live launch.

## Paskutinis atnaujinimas

2026-08-13 – Milestone 3 uždarytas ir Milestone 4 pradėtas. Business Dashboard/Store/Orders/Revenue/Site Builder/Admin Analytics sutvarkyti konservatyviai: paid-only revenue, public checkout limiteris, griežtesnė selected product ID validacija, paid-order invoice atsisiuntimas ir aiškus rankinių payout ribojimas. Validuota su `npm run lint`, `npm run typecheck`, `npm test` ir `npm run build`. `PROJECT_STATE` paliekamas `IN_PROGRESS`, nes Security/kokybės milestone ir release-candidate patikra dar neužbaigti.
2026-08-13 – Milestone 4 tęsiamas. Pašalinti high dependency audit blokatoriai tiksliniais atnaujinimais, Vite 8 migracija validuota su build ir preview HTTP smoke, secret scan realių frontend paslapčių nerado. `PROJECT_STATE` paliekamas `IN_PROGRESS`, nes responsive/accessibility ir release-candidate checklist dar neužbaigti.
2026-08-13 – Milestone 5 uždarytas. README ir `codex-work/RELEASE_CHECKLIST.md` atnaujinti, finalinis kainų/narystės skenas praėjo, `npm audit --audit-level=high`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, wrapper syntax check ir `/pricing` preview smoke praėjo. `PROJECT_STATE: RELEASE_CANDIDATE_READY`.
