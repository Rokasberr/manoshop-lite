# Stilloak Studio autonomous status

PROJECT_STATE: PERSONAL_P1_MOBILE_BLOCKER_PENDING_REAL_DEVICE_VERIFICATION

## Dabartinis milestone

Milestone 2 – Asmeninis P1 mobile overflow blocker. Lokalus hotfix ir regresijos paruoštos, bet Asmeninis nelaikomas 10/10, kol tikras telefonas arba naršyklinis `scrollWidth/clientWidth` smoke patvirtins, kad Asmeninio nario zona nebeturi puslapio lygio horizontalaus overflow ir dešinės pusės nukirpimo.

## Užbaigta

- 2026-08-20 Realios telefono problemos Asmeninio nario zonoje pataisa: `Layout` šaknis pakeista iš bendro `overflow-hidden` į `overflow-x-hidden`, kad vertikalus turinys nebūtų nukerpamas kartu su dekoratyviniu overflow, o mobile Asmeninio workspace gavo CSS saugiklį `max-width: 100%`, `min-width: 0`, formų/mygtukų pločio ribojimą ir `overflow-wrap: anywhere` panelėms, kortelėms, formoms ir tekstui.
- 2026-08-20 Realios telefono problemos regresija: `server/tests/savingsStudioPersonalUi.test.js` papildomai saugo `Layout` nuo `overflow-hidden` grąžinimo ir tikrina mobile viewport safety net Asmeninio workspace lygyje, kad lentelės/pseudo-lentelės ir platūs elementai nebedarytų viso puslapio platesnio už viewport.
- 2026-08-20 Užfiksuota testų spraga: ankstesni statiniai responsive testai tikrino konkrečias JSX klases ir žinomus komponentų fragmentus, bet ne realų telefono `scrollWidth > clientWidth` elgesį ir ne tėvinio `overflow-hidden` sukeltą nukirpimą; todėl jie negalėjo aptikti vartotojo telefone matyto puslapio lygio overflow.
- 2026-08-20 Asmeninio nario zonos P1 mobilus responsive hotfix: `MemberAreaPage` mobile dashboard navigacijos elementai gavo ribotą plotį, `min-w-0`, laužomą tekstą ir `shrink-0` ikonas, todėl ilgesnės lokalizuotos etiketės lieka vidinio horizontalaus nav scroll ribose.
- 2026-08-20 Savings Studio P1 mobile hotfix: hero CTA, usage guide, greita navigacija, goal pace metrikos, weekly rhythm grafikas, fixed-vs-flexible sumos, recurring one-click log, suvestinių siuntimo/atsisiuntimo mygtukai, CSV preview veiksmai, GoalScenario ir CategoryShift kortelės pervestos į width-safe `w-full`/auto-fit/vidinio scroll/teksto wrap klases, kad siauruose mobiliuose konteineriuose nebūtų puslapio horizontalaus overflow.
- 2026-08-20 `server/tests/savingsStudioPersonalUi.test.js` papildytas P1 mobile hotfix regresija, saugančia mobile CTA auto-fit gridus, savaitinio grafiko vidinį scroll, suvestinių veiksmų wrap ir CSV preview veiksmų width-safe elgesį.
- 2026-08-20 Asmeninio nario zonos 320-768 px responsive hardening: `MemberAreaPage`, `SavingsStudioPage`, `DigitalProductAccessGrid` ir mobile `.member-workspace` CSS saugikliai pervesti į `min-w-0`, `max-w-full`, auto-fit gridus, mobile column layout, vidinį chart/table-like scroll ir laužomus CTA tekstus, kad platūs elementai nebedidintų viso puslapio pločio siauruose mobiliuose viewportuose.
- 2026-08-20 `server/tests/savingsStudioPersonalUi.test.js` papildytas Asmeninio nario zonos shared card regresija, kuri saugo preview switch, module cards, resources/plans/account/journal/business korteles ir `DigitalProductAccessGrid` nuo 320-768 px pločio overflow grįžimo.
- 2026-08-14 Verslo zonos 2 etapas: sukurtas bendras `BusinessLayout` shell su `Outlet`, aktyvia `NavLink` navigacija, `Verslo zona` identitetu, grįžimu į `/members/savings-studio`, desktop sticky sidebar ir mobile vidiniu `overflow-x-auto` navigacijos slinkimu. Visi protected `/business` child route perkelti po `BusinessLayout`; `/business/my-store` ir `/business/settings` palikti tik kaip `Navigate replace` į `/business/site-builder`.
- 2026-08-14 Verslo workspace layout išplėstas iki `max-w-[1800px]` tik `/business` ir `/business/*` kartu su `/members/savings-studio`; vieši puslapiai ir `/stores/:slug` liko `max-w-7xl`. Nario zonos Business kortelės deduplikuotos: pašalinta atskira `My Website` kortelė, o `/business` aiškiau įvardytas kaip operacinė Verslo darbo zona. `BusinessDashboardPage` greitos kortelės neberodo `my-store/settings` dublių.
- 2026-08-14 pridėtas `server/tests/businessWorkspaceUi.test.js`, saugantis Business layout egzistavimą, šešias unikalias navigacijos nuorodas, `/business` `end` aktyvumą, sticky/mobile navigaciją, `minmax(0,1fr)` karkasą, protected route nesting, legacy redirectus, platų layout režimą, viešų puslapių siaurą konteinerį, Member Area dublių pašalinimą ir nested `<main>` nebuvimą `BusinessLayout`.
- 2026-08-14 Verslo zonos P1 invoice saugumo pataisa: `GET /api/orders/:id/invoice` po ownership/admin prieigos patikros ir prieš PDF generavimą dabar leidžia sąskaitą tik `paymentStatus === "paid"` užsakymams; pending, failed, canceled/cancelled, expired ir bet kokios kitos neapmokėtos būsenos atmetamos 409 klaida net pirkėjui, store savininkui ar administratoriui. `server/tests/businessStudio.test.js` papildytas behavior-level controller testais paid PDF keliui, unpaid blokavimui ir ownership 403 išsaugojimui; Business Orders UI paid-only mygtuko regresija palikta.
- 2026-08-14 Savings Studio plataus workspace responsive etapas: `Layout` tapo route-aware ir tik `/members/savings-studio` naudoja `w-full max-w-[1800px]` su `px-4 sm:px-6 lg:px-8 2xl:px-10`, vieši puslapiai palikti `max-w-7xl`; `MemberAreaPage` pagrindinis karkasas pervestas į `w-full min-w-0` ir `lg/xl/2xl` sidebar + `minmax(0,1fr)` gridą; `SavingsStudioPage` šaknis ir pagrindinės sekcijos papildytos `min-w-0`, dideliuose ekranuose naudoja platesnę darbo zoną, o tekstu/veiksmais apkrauti trijų stulpelių blokai į 3 kolonas pereina tik nuo `2xl`.
- Išsaugotos ankstesnės Savings Studio overflow apsaugos: `InsightTile` didelės sumos, 6 mėnesių grafiko vidinis horizontalus scroll, `SummaryArchiveItem`, `AutomationTriggerCard`, `ForecastMetricTile`, CTA ir kortelių tekstų/mygtukų wrap elgesys liko padengti `server/tests/savingsStudioPersonalUi.test.js`.
- 2026-08-14 Savings Studio InsightTile responsive hotfix šakoje `codex/fix-insight-metric-overflow-20260814`: `InsightTile` metrikos pervestos į width-safe korteles su `min-w-0`, `max-w-full`, normaliais label/value/hint lūžiais, `shrink-0` ikona, `text-2xl` baziniu value dydžiu ir `tabular-nums`; trys tiesioginiai `InsightTile` grid tėvai pakeisti iš viewport `sm:grid-cols-2/3` į container-safe `repeat(auto-fit,minmax(min(100%,13rem),1fr))`.
- 2026-08-14 sutvarkytas Savings Studio „6 mėnesių vaizdas“ grafikas: grafikas apgaubtas vidiniu `w-full max-w-full overflow-x-auto` slinkimo konteineriu, vidinis 6 stulpelių grid turi `min-w-[32rem]`, datos ir sumos laikomos įskaitomos be viso puslapio horizontalaus overflow, o pilna suma išlieka per `title`.
- `server/tests/savingsStudioPersonalUi.test.js` papildytas tikslinėmis regresijomis, kurios ištraukia konkretų `InsightTile` komponentą, tris jo metrikų grid blokus ir „6 mėnesių vaizdas“ panelę, nekeičiant ankstesnių `ForecastMetricTile`, `AutomationTriggerCard` ir `SummaryArchiveItem` patikrų.
- 2026-08-13 Savings Studio personal responsive audit šakoje `codex/personal-responsive-audit-20260813`: siauruose/nested panelių blokuose `ForecastMetricTile` metrikų gridai pervesti iš viewport `sm:grid-cols-3` / `sm:grid-cols-4` į container-safe `repeat(auto-fit,minmax(min(100%,13rem),1fr))`; `ForecastMetricTile` papildytas `min-w-0`, `max-w-full` ir normaliu label/value/hint teksto lūžimu; Summary Archive, goal strategy, recurring review, recurring forecast, month comparison ir activity CTA kortelės sutvarkytos taip, kad tekstas ir mygtukai liktų kortelių ribose be `overflow-hidden`.
- `server/tests/savingsStudioPersonalUi.test.js` papildytas tikslinėmis regresijomis, kurios ištraukia konkrečius source blokus ir saugo goal strategy metrikų auto-fit gridą, `ForecastMetricTile` pločio saugiklius, Summary Archive mygtukų `w-full max-w-full whitespace-normal` elgesį ir ankstesnę `AutomationTriggerCard` apsaugą.
- 2026-08-13 skubus Savings Studio production UI hotfix: `AutomationTriggerCard` nebesiremia viewport `sm:flex-row`, `sm:w-auto` ar `sm:shrink-0`, tekstas ir CTA visada dėliojami vertikaliai, CTA lieka `w-full max-w-full`, o lietuviški žodžiai nebėra verčiami lūžti po kelias raides.
- Automatikos statistikų `Suvestinės / Kopijos / Signalai` grid pervestas į container-width-safe `repeat(auto-fit,minmax(min(100%,13rem),1fr))`, kad siauroje kortelėje būtų vienas skaitomas stulpelis, o platesnėje automatiškai tilptų daugiau.
- `server/tests/savingsStudioPersonalUi.test.js` regresija dabar tikrina būtent `AutomationTriggerCard` šaltinio bloką: draudžia `sm:flex-row`, `sm:w-auto`, `sm:shrink-0`, saugo `w-full max-w-full` CTA ir auto-fit/minmax statistikų grid be `sm:grid-cols-3`.
- 2026-08-13 Savings Studio responsive CTA pataisa: automatikos kortelės `Išsiųsk naują suvestinę dabar` mobile režimu dėlioja tekstą ir CTA vertikaliai, mygtukas turi `w-full max-w-full`, tekstas gali lūžti, rodyklė lieka mygtuko viduje, o statistikos `Suvestinės / Kopijos / Signalai` grid saugiai lieka vieno stulpelio iki `sm`.
- `server/tests/savingsStudioPersonalUi.test.js` papildytas statine regresija, saugančia mobile CTA vertikalų layout, `w-full/max-w-full` elgesį, responsive statistikos grid ir `whitespace-nowrap` nebuvimą ilgame summary mygtuke.
- 2026-08-13 papildomas Asmeninio nario zonos review etapas pradėtas šakoje `codex/personal-member-area-10of10-20260813`: perskaityti `AGENTS.md`, `SPEC.md`, `PLAN.md`, `IMPLEMENT.md` ir ši būsena, inventorizuoti `MemberAreaPage`, `SavingsStudioPage`, Saving Studio helperiai, service sluoksnis, backend route/controller/modeliai, membership guardai ir esami access/UI testai.
- Sukurtas `codex-work/PERSONAL_MEMBER_AREA.md` su esama būsena, problemomis, įgyvendinimo planu, prieigos matrica, priėmimo kriterijais ir likusiomis rankinėmis patikromis.
- Saving Studio backend sustiprintas: CSV preview dabar atpažįsta jau egzistuojančius ir tame pačiame CSV pasikartojančius tik visiškai sutampančius `date + amount + title + category` dublikatus, o CSV confirm importuoja tik priimtas eilutes ir grąžina `invalidRows`, `duplicateRows` bei `rejectedCount`.
- Saving Studio route parametrai sustiprinti `validateObjectId` prieš `entries`, `goals` ir `recurring` update/delete/log controllerius.
- Finansinių inputų validacija suvienodinta: įrašų, biudžetų, tikslų, recurring ir profilio sumoms taikoma bendra `MAX_MONEY_AMOUNT` riba.
- Frontend CSV importo kokybės kortelė priderinta prie serverio `duplicateRows` / `duplicateCount`, todėl vartotojas mato kiek bus importuota, kiek atmesta ir kurie dublikatai nebus keliami prieš confirm.
- Pridėtas `server/tests/savingsStudioImportSecurity.test.js` su CSV preview be DB mutacijos, CSV confirm dublikatų atmetimo, kategorijos skirtumo, title/category normalizavimo, realaus ObjectId middleware ir per didelių sumų regresijomis.
- `server/tests/savingsStudioPersonalUi.test.js` papildytas statine regresija, kad CSV importo kokybės UI naudotų serverio dublikatų informaciją.
- Sukurtas autonominio darbo setupas.
- Sukurtos saugumo taisyklės.
- Sukurtas pradinis vykdymo planas.
- Milestone 0 baseline auditas atliktas vietoje.
- Git būsena patikrinta: `git status --short` grąžino tuščią rezultatą.
- Projekto struktūra patikrinta: root workspace apima `client` ir `server`; `ai-sales-copilot-saas` egzistuoja kaip atskiras papildomas paketas.
- Rasti validacijos scenarijai: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Rasti Excel prototipai: `StillOak_Weekly_Planning_System.xlsx`, `StillOak_Savings_Tracker.xlsx`, `StillOak_Personal_Budget_System.xlsx`.
- Milestone 1 kainodara sutvarkyta pagal naujausią finalų reikalavimą: Demo 0, Asmeninis 14,99, Privatus verslas 44,99 serverio ir kliento planų šaltiniuose.
- Senų membership kainų 9/24/99 aktyviuose `client/src` ir `server` narystės šaltiniuose nebeliko.
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
- Milestone 2 – Asmeninis 10/10 ankstesnis uždarymas atšauktas po realaus telefono P1 overflow reprodukcijos; galutinis uždarymas blokuojamas iki real-device arba browser `scrollWidth/clientWidth` smoke patvirtinimo.
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
- README kainos pataisytos pagal patvirtintus planus: Asmeninis 14,99 EUR/mėn., Privatus verslas 44,99 EUR/mėn.
- Parengtas `codex-work/RELEASE_CHECKLIST.md` su lokalaus RC paleidimo, validacijos, narystės, kritinių srautų, rankinio production launch ir likusių rizikų sąrašu.
- Finalinė diff peržiūra atlikta: peržiūrėti Business revenue, public checkout limiter, Site Builder ID validation, Business Orders invoice, Business Dashboard, Vite wrapper, dependency ir dokumentacijos pakeitimai.
- Kainų skenas patvirtino, kad aktyviuose membership paviršiuose įtvirtintos 0, 14,99 ir 44,99 kainos.
- Finalinė validacija praėjo: audit high/critical, syntax wrappers, lint, typecheck, test, build ir preview HTTP smoke.
- Ankstesnio Codex review P2 auth recovery pastabos sutvarkytos: production env reikalauja `EMAIL_FROM` ir Brevo arba pilno SMTP kelio, forgot-password viešas atsakymas neatskleidžia paskyros, siuntimo klaidos saugiai logginamos be jautrių duomenų ir sąlyginiu update išvalo tik konkrečios užklausos tokeną.
- Reset tokeno panaudojimas pervestas į vieną atominį `findOneAndUpdate` pagal tokeno hash ir galiojimą; tuo pačiu veiksmu nustatomas bcrypt slaptažodžio hash, išvalomi reset laukai, nustatomas `passwordChangedAt` ir padidinamas `authVersion`, neliečiant rolės ar prenumeratos.

## Vykdoma

- P1 blocker: tikrame telefone Asmeninio nario zona nukerpa dešinę puslapio pusę, platūs elementai/lentelės gali daryti visą puslapį platesnį už viewport ir dalis turinio tampa nepasiekiama. Lokalus 320-768 px hardening įgyvendintas, bet Asmeninis nebus uždarytas kaip 10/10 iki prisijungusio realaus telefono arba browser `scrollWidth/clientWidth` smoke patvirtinimo. Production veiksmai nevykdyti.

## Validacijos rezultatai

- 2026-08-20 Realios telefono problemos Asmeninio nario zonoje pataisa: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 17/17.
- 2026-08-20 Realios telefono problemos Asmeninio nario zonoje pataisa: `npm.cmd run lint` – PASS, patikrinti 100 backend JavaScript failų.
- 2026-08-20 Realios telefono problemos Asmeninio nario zonoje pataisa: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 100 failų; TypeScript projekto nėra.
- 2026-08-20 Realios telefono problemos Asmeninio nario zonoje pataisa: `npm.cmd test` – PASS, 113/113.
- 2026-08-20 Realios telefono problemos Asmeninio nario zonoje pataisa: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`; `MemberAreaPage` chunkas ~221.66 kB.
- 2026-08-20 Realios telefono problemos Asmeninio nario zonoje pataisa: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-20 Realios telefono problemos Asmeninio nario zonoje pataisa: in-app browser Node REPL įrankis po browser skill discovery šiame seanse nebuvo pateiktas, todėl authenticated mobile screenshot/scrollWidth smoke liko neatliktas; statinė mobile overflow regresija ir pilna validacija praėjo.
- 2026-08-20 Asmeninio nario zonos 320-768 px responsive hardening: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 18/18.
- 2026-08-20 Asmeninio nario zonos 320-768 px responsive hardening: UTF-8 replacement character scan – PASS, `SavingsStudioPage.jsx`, `MemberAreaPage.jsx`, `DigitalProductAccessGrid.jsx`, `savingsStudioPersonalUi.test.js` ir `index.css` neturi `U+FFFD`.
- 2026-08-20 Asmeninio nario zonos 320-768 px responsive hardening: `npm.cmd run lint` – PASS, patikrinti 100 backend JavaScript failų.
- 2026-08-20 Asmeninio nario zonos 320-768 px responsive hardening: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 100 failų; TypeScript projekto nėra.
- 2026-08-20 Asmeninio nario zonos 320-768 px responsive hardening: `npm.cmd test` – PASS, 114/114.
- 2026-08-20 Asmeninio nario zonos 320-768 px responsive hardening: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`; `MemberAreaPage` chunkas ~225.34 kB.
- 2026-08-20 Asmeninio nario zonos 320-768 px responsive hardening: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-20 Asmeninio nario zonos P1 mobile responsive hotfix: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 16/16.
- 2026-08-20 Asmeninio nario zonos P1 mobile responsive hotfix: `npm.cmd run lint` – PASS, patikrinti 100 backend JavaScript failų.
- 2026-08-20 Asmeninio nario zonos P1 mobile responsive hotfix: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 100 failų; TypeScript projekto nėra.
- 2026-08-20 Asmeninio nario zonos P1 mobile responsive hotfix: `npm.cmd test` – PASS, 112/112.
- 2026-08-20 Asmeninio nario zonos P1 mobile responsive hotfix: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`; `MemberAreaPage` chunkas ~221.66 kB.
- 2026-08-20 Asmeninio nario zonos P1 mobile responsive hotfix: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-14 Verslo zonos 2 etapas: `node --test server/tests/businessStudio.test.js` – PASS, 9/9.
- 2026-08-14 Verslo zonos 2 etapas: `node --test server/tests/businessWorkspaceUi.test.js` – PASS, 6/6.
- 2026-08-14 Verslo zonos 2 etapas: `npm.cmd run lint` – PASS, patikrinti 100 backend JavaScript failų.
- 2026-08-14 Verslo zonos 2 etapas: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 100 failų.
- 2026-08-14 Verslo zonos 2 etapas: `npm.cmd test` – PASS, 111/111.
- 2026-08-14 Verslo zonos 2 etapas: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`; `MemberAreaPage` chunkas ~218.91 kB.
- 2026-08-14 Verslo zonos P1 invoice saugumo pataisa: `node --test server/tests/businessStudio.test.js` – PASS, 9/9.
- 2026-08-14 Verslo zonos P1 invoice saugumo pataisa: `npm.cmd run lint` – PASS, patikrinti 99 backend JavaScript failai.
- 2026-08-14 Verslo zonos P1 invoice saugumo pataisa: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 99 failams.
- 2026-08-14 Verslo zonos P1 invoice saugumo pataisa: `npm.cmd test` – PASS, 105/105.
- 2026-08-14 Verslo zonos P1 invoice saugumo pataisa: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`.
- 2026-08-14 Savings Studio plataus workspace responsive etapas: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 15/15.
- 2026-08-14 Savings Studio plataus workspace responsive etapas: `npm.cmd run lint` – PASS, patikrinti 99 backend JavaScript failai.
- 2026-08-14 Savings Studio plataus workspace responsive etapas: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 99 failams.
- 2026-08-14 Savings Studio plataus workspace responsive etapas: `npm.cmd test` – PASS, 102/102.
- 2026-08-14 Savings Studio plataus workspace responsive etapas: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`; `MemberAreaPage` chunkas ~219.06 kB.
- 2026-08-14 Savings Studio InsightTile responsive hotfix: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 12/12.
- 2026-08-14 Savings Studio InsightTile responsive hotfix: `npm.cmd run lint` – PASS, patikrinti 99 backend JavaScript failai.
- 2026-08-14 Savings Studio InsightTile responsive hotfix: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 99 failams.
- 2026-08-14 Savings Studio InsightTile responsive hotfix: `npm.cmd test` – PASS, 99/99.
- 2026-08-14 Savings Studio InsightTile responsive hotfix: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`.
- 2026-08-14 Savings Studio InsightTile responsive hotfix: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-14 Savings Studio InsightTile responsive hotfix: `git diff --stat` – 3 files changed, 141 insertions(+), 33 deletions(-).
- 2026-08-14 Savings Studio InsightTile responsive hotfix: `git status --short` – pakeisti tik `client/src/pages/SavingsStudioPage.jsx`, `server/tests/savingsStudioPersonalUi.test.js` ir `codex-work/STATUS.md`; commit/push/PR/deploy nevykdyti.
- 2026-08-13 Savings Studio personal responsive audit: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 9/9.
- 2026-08-13 Savings Studio personal responsive audit: `npm.cmd run lint` – PASS, patikrinti 99 backend JavaScript failai.
- 2026-08-13 Savings Studio personal responsive audit: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 99 failams.
- 2026-08-13 Savings Studio personal responsive audit: `npm.cmd test` – PASS, 96/96.
- 2026-08-13 Savings Studio personal responsive audit: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`.
- 2026-08-13 Savings Studio personal responsive audit: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-13 Savings Studio personal responsive audit: `git status --short` – PASS peržiūrėta, pakeisti tik `client/src/pages/SavingsStudioPage.jsx`, `server/tests/savingsStudioPersonalUi.test.js` ir `codex-work/STATUS.md`.
- 2026-08-13 skubus Savings Studio production UI hotfix: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 6/6.
- 2026-08-13 skubus Savings Studio production UI hotfix: `npm.cmd run lint` – PASS, patikrinti 99 backend JavaScript failai.
- 2026-08-13 skubus Savings Studio production UI hotfix: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 99 failams.
- 2026-08-13 skubus Savings Studio production UI hotfix: `npm.cmd test` – PASS, 93/93.
- 2026-08-13 skubus Savings Studio production UI hotfix: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`.
- 2026-08-13 skubus Savings Studio production UI hotfix: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-13 skubus Savings Studio production UI hotfix: `git status --short` – PASS peržiūrėta, pakeisti tik `client/src/pages/SavingsStudioPage.jsx`, `server/tests/savingsStudioPersonalUi.test.js` ir `codex-work/STATUS.md`.
- 2026-08-13 Savings Studio responsive CTA pataisa: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 6/6.
- 2026-08-13 Savings Studio responsive CTA pataisa final: `npm.cmd run lint` – PASS, patikrinti 99 backend JavaScript failai.
- 2026-08-13 Savings Studio responsive CTA pataisa final: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 99 failams.
- 2026-08-13 Savings Studio responsive CTA pataisa final: `npm.cmd test` – PASS, 93/93.
- 2026-08-13 Savings Studio responsive CTA pataisa final: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`.
- 2026-08-13 Savings Studio responsive CTA pataisa final: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-13 Savings Studio responsive CTA pataisa final: `git status --short` – PASS peržiūrėta, pakeisti tik `client/src/pages/SavingsStudioPage.jsx`, `server/tests/savingsStudioPersonalUi.test.js` ir `codex-work/STATUS.md`.
- 2026-08-13 Personal member area papildoma patikra: `node --test server/tests/savingsStudioImportSecurity.test.js` – PASS, 4/4.
- 2026-08-13 Personal member area papildoma patikra: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 5/5.
- 2026-08-13 Personal member area papildoma patikra: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`.
- 2026-08-13 Personal member area final: `npm.cmd run lint` – PASS, patikrinti 99 backend JavaScript failai.
- 2026-08-13 Personal member area final: `npm.cmd run typecheck` – PASS, TypeScript projekto nėra; backend JavaScript syntax check praėjo 99 failams.
- 2026-08-13 Personal member area final: `npm.cmd test` – PASS, 88/88 testai praėjo.
- 2026-08-13 Personal member area final: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`.
- 2026-08-13 Personal member area final: `npm.cmd audit --audit-level=high` – PASS pagal high/critical kriterijų; liko 2 moderate React Router punktai be automatinio fix.
- 2026-08-13 Personal member area final: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-13 Personal member area final: statinis secret scan aktyviuose `client/src`, `server` ir `codex-work` failuose – PASS; rasti tik env kintamųjų pavadinimai ir testiniai placeholderiai.
- 2026-08-13 Personal member area final: browser skill patikra – NOT RUN; šiame seanse per tool discovery nebuvo prieinamas reikalingas `node_repl` vykdymo įrankis, todėl palikta rankiniam authenticated smoke su testine paskyra.
- 2026-08-13 Personal member area reviewer pass: `node --test server/tests/savingsStudioImportSecurity.test.js` – PASS, 7/7.
- 2026-08-13 Personal member area reviewer pass: `node --test server/tests/savingsStudioHelpers.test.js` – PASS, 5/5.
- 2026-08-13 Personal member area reviewer pass: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 5/5.
- 2026-08-13 Personal member area reviewer pass: `npm.cmd run lint` – PASS, patikrinti 99 backend JavaScript failai.
- 2026-08-13 Personal member area reviewer pass: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 99 failams.
- 2026-08-13 Personal member area reviewer pass: `npm.cmd test` – PASS, 92/92 testai praėjo.
- 2026-08-13 Personal member area reviewer pass: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`.
- 2026-08-13 Personal member area reviewer pass: `npm.cmd audit --audit-level=high` – PASS pagal high/critical kriterijų; liko 2 moderate React Router punktai be automatinio fix.
- 2026-08-13 Personal member area reviewer pass: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-13 Personal member area reviewer pass: `git status --short` – PASS peržiūrėta, yra tik numatyti necommitinti failai; commit/push nevykdyti.
- 2026-08-13 Personal member area minimal scope correction: pašalintas reviewer pass metu įvestas naujas income/expense `type` scope iš modelio, parserio, CSV helperių, preview UI ir testų; `server/models/SavingsEntry.js` bei `client/src/components/savings/savingsStudioHelpers.js` turinio diff tuščias.
- 2026-08-13 Personal member area minimal scope correction: CSV dublikatų fingerprint paliktas pagal esamą duomenų modelį `date + amount + title + category`; title/category normalizuojami trim/lowercase/tarpų sutraukimu, amount iki valiutos reikšmės, date kaip validuotas `YYYY-MM-DD`.
- 2026-08-13 Personal member area minimal scope correction: `node --test server/tests/savingsStudioImportSecurity.test.js` – PASS, 8/8.
- 2026-08-13 Personal member area minimal scope correction: `node --test server/tests/savingsStudioHelpers.test.js` – PASS, 4/4.
- 2026-08-13 Personal member area minimal scope correction: `node --test server/tests/savingsStudioPersonalUi.test.js` – PASS, 5/5.
- 2026-08-13 Personal member area minimal scope correction final: `npm.cmd run lint` – PASS, patikrinti 99 backend JavaScript failai.
- 2026-08-13 Personal member area minimal scope correction final: `npm.cmd run typecheck` – PASS, backend JavaScript syntax check praėjo 99 failams.
- 2026-08-13 Personal member area minimal scope correction final: `npm.cmd test` – PASS, 92/92 testai praėjo.
- 2026-08-13 Personal member area minimal scope correction final: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`.
- 2026-08-13 Personal member area minimal scope correction final: `npm.cmd audit --audit-level=high` – PASS pagal high/critical kriterijų; liko 2 moderate React Router punktai be automatinio fix.
- 2026-08-13 Personal member area minimal scope correction final: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-13 Personal member area minimal scope correction final: `git diff -- server/models/SavingsEntry.js` ir `git diff -- client/src/components/savings/savingsStudioHelpers.js` – PASS, turinio diff tuščias.
- 2026-08-13 Personal member area minimal scope correction final: statinis secret scan aktyviuose `client/src`, `server` ir `codex-work` failuose – PASS; rasti tik env kintamųjų pavadinimai ir testiniai placeholderiai.
- 2026-08-13 Personal member area minimal scope correction final: authenticated desktop/mobile smoke – NOT RUN, palikta privalomam rankiniam veiksmui prieš galutinį 10/10 statusą.
- 2026-08-13 final audit: `npm.cmd run lint` – PASS, patikrinti 98 backend JavaScript failai.
- 2026-08-13 final audit: `npm.cmd run typecheck` – PASS, TypeScript projekto nėra; backend JavaScript syntax check praėjo 98 failams.
- 2026-08-13 final audit: `npm.cmd test` – PASS, 83/83 testai praėjo.
- 2026-08-13 final audit: `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`; main JS chunkas ~236.15 kB, `MemberAreaPage` chunkas ~215.83 kB.
- 2026-08-13 final audit: `npm.cmd audit --audit-level=high` – PASS pagal high/critical kriterijų; liko 2 moderate React Router punktai be automatinio fix.
- 2026-08-13 final audit: `git diff --check` – PASS, whitespace klaidų nerado; rodomi tik CRLF normalizavimo įspėjimai.
- 2026-08-13 final audit: tikslinis `node --test server/tests/membershipPricing.test.js server/tests/stripeCheckoutService.test.js` – PASS, 10/10.
- 2026-08-13 final audit: lokalus `npm --workspace client run preview -- --host 127.0.0.1 --port 4174` HTTP smoke – PASS; `/`, `/pricing`, `/login`, `/register`, `/contact`, `/terms`, `/privacy`, `/cookie-policy`, `/returns` ir nežinomas SPA route grąžino HTTP 200 su React root.
- 2026-08-13 final audit: viešas `https://manoshop-api.onrender.com/api/health` – PASS, HTTP 200 OK su production saugumo headeriais.
- 2026-08-13 final audit: vieši `https://www.stilloak-studio.com`, `/pricing`, `/login`, `/register` – PASS HTTP 200, bet production JS assetas dar turi seną 24/99 kainodaros deploy.
- 2026-08-13 final audit: `git add ...` – FAIL dėl `.git/index.lock` permission denied; commit ir push nevykdyti.

- `npm.cmd run lint` – PASS, patikrinti 97 backend JavaScript failai.
- `npm.cmd run typecheck` – PASS, TypeScript projekto nėra; backend JavaScript syntax check praėjo 97 failams.
- `npm.cmd test` – PASS, 80/80 serverio ir statinės klientų patikros praėjo.
- `npm.cmd run build` – PASS, Vite 8.2.1 build sugeneravo `client/dist`; finalinio build main JS chunkas ~236.12 kB, `MemberAreaPage` chunkas ~215.82 kB, Vite >500 kB chunk įspėjimo nėra.
- `npm --workspace client run preview -- --host 127.0.0.1 --port 4174` + `Invoke-WebRequest /pricing` – PASS, HTTP 200 ir React root HTML.
- `node --check scripts/preview-client.js` – PASS.
- `node` orchestrated Chrome headless screenshot smoke – FAIL dėl vietinio Chromium GPU proceso klaidos `GPU process isn't usable`; produkto HTTP preview buvo pasiekiamas.
- `node` orchestrated Edge headless screenshot smoke – FAIL dėl vietinio Chromium headless proceso klaidos su izoliuotu profiliu; produkto HTTP preview buvo pasiekiamas.
- `npm.cmd audit --audit-level=high` – PASS pagal high/critical kriterijų; liko 2 moderate React Router punktai be automatinio fix.
- Kainų regresijos skenas – PASS, aktyvūs membership paviršiai saugomi nuo 9/24/99 kainų grįžimo.
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
- Milestone 2 responsive rizika nebelaikoma pakankamai valdoma vien statiniu regresiniu testu: realaus telefono P1 overflow reprodukcija parodė, kad būtinas prisijungusio telefono arba browser `scrollWidth/clientWidth` smoke prieš Asmeninis 10/10 uždarymą.
- Business revenue sprendimas konservatyvus: finansinės kortelės rodo tik realiai apmokėtus orderius; pending checkout įrašai saugomi operacinei peržiūrai, bet nelaikomi pajamomis.
- Business CSV importas nepridėtas, nes esamoje Business Store/Dashboard architektūroje nėra CSV import sutarties; naujo netikro importo kūrimas prieštarautų SPEC reikalavimui neimituoti finansinių operacijų.
- Withdrawals/payouts lieka rankinis MVP procesas: rodomi commission ir seller earnings, bet nevykdomi jokie realūs išmokėjimai ar Stripe Live veiksmai.
- React Router 7 migracija atidėta kaip owner decision / atskiras techninis darbas, nes `npm audit fix --force` keistų router major versiją. High/critical audit kriterijus po Vite migracijos yra švarus.
- Vite 8 toolchain reikalauja modernios Node versijos; `codex-work/RELEASE_CHECKLIST.md` dokumentuoja Node.js `>=22.12.0`, lokaliai validuota su Node `v24.15.0`.
- Ankstesnis `PROJECT_STATE: RELEASE_CANDIDATE_READY` nebetaikomas, kol Asmeninio nario zonos P1 mobile overflow blocker nėra patvirtintas real-device arba browser smoke testu.

## Blokatoriai

- P1 Asmeninio plano užbaigimo blokatorius: tikrame telefone Asmeninio nario zonoje buvo nukerpama dešinė puslapio pusė ir platūs elementai darė turinį nepasiekiamą; Asmeninis negali būti uždarytas kaip 10/10 iki realaus telefono arba browser `scrollWidth/clientWidth` smoke PASS.
- Production launch blokatorius iki rankinio veiksmo: viešas frontend deploy dar pateikia seną JS assetą su 24/99 kainomis; reikalingas naujas frontend deploy po šių pakeitimų.
- Git blokatorius šiame sandboxe: `.git` rašymas neleidžiamas, todėl commit/push turi atlikti operatorius arba PowerShell runneris.
- Kritinė patvirtinimo spraga: in-app browser Node REPL įrankis šiame kontekste nepasiekiamas, o vietinis Chrome/Edge headless krito su GPU proceso klaida, todėl authenticated mobile screenshot/scrollWidth smoke neatliktas. Statiniai testai pridėti kaip regresijos, bet jie nėra realaus telefono pakaitalas.
- Authenticated Personal Studio desktop/mobile smoke be testinės paskyros/slaptažodžių neatliktas; mobile dalis dabar yra P1 priėmimo blokatorius.
- Nekritinė dependency rizika: 2 moderate React Router audit punktai lieka iki owner-approved `react-router-dom@7` migracijos.

## Rankiniai production veiksmai

- Atlikti frontend production deploy tik po review/commit; po deploy pakartoti viešo asseto kainų skeną ir vizualiai patikrinti `/pricing`.
- Stripe Dashboard rankiniu būdu patvirtinti, kad `STRIPE_PRICE_ASMENINIS` yra 14,99 EUR/mėn., o `STRIPE_PRICE_PRIVATUS_VERSLAS` yra 44,99 EUR/mėn.; realių mokėjimų šiame audite nevykdyta.
- Render aplinkoje patvirtinti `CLIENT_URL`, CORS, Stripe webhook secret, Brevo/SMTP ir MongoDB kintamųjų pavadinimus neatskleidžiant reikšmių.
- Stripe Live nejungti autonomiškai; prieš launch rankiniu būdu patvirtinti `STRIPE_PRICE_ASMENINIS` ir `STRIPE_PRICE_PRIVATUS_VERSLAS`, kad jie atitinka 14,99 EUR/mėn. ir 44,99 EUR/mėn.
- Production deploy, domenas, DNS, live mokėjimai ir produkcinė DB lieka žmogaus patvirtinimui.
- Vykdyti `codex-work/RELEASE_CHECKLIST.md` production sąrašą prieš bet kokį live launch.

## Paskutinis atnaujinimas

2026-08-20 – P1 klasifikacija patikslinta: reali telefono overflow problema blokuoja Asmeninio plano užbaigimą. Milestone 2 ir `PROJECT_STATE` grąžinti į blokuotą būseną iki realaus telefono arba naršyklinio `scrollWidth/clientWidth` smoke PASS; statiniai responsive testai laikomi regresijos apsauga, bet ne priėmimo patvirtinimu.
2026-08-20 – Realios telefono problemos Asmeninio nario zonoje pataisa lokaliai baigta. Spręsta ne tik atskirų CTA problema, bet ir puslapio lygio nukirpimas: `Layout` nebeslepia viso overflow per `overflow-hidden`, o Asmeninio workspace mobile režimu riboja plačių panelių, pseudo-lentelių, formų, mygtukų ir teksto plotį iki viewport. Production deploy, Stripe Live, DB ir git push nevykdyti.
2026-08-20 – Testų spraga aiškiai suklasifikuota: ankstesni statiniai responsive testai buvo naudingi regresijoms konkrečiuose komponentuose, bet jie nėra tikro telefono arba naršyklinio `scrollWidth/clientWidth` smoke pakaitalas.
2026-08-20 – Asmeninio nario zonos P1 mobile responsive hotfix lokaliai baigtas. Sutvarkyti likę siaurų mobilių konteinerių rizikos taškai: nario zonos mobile nav etiketės, Savings Studio hero/usage/quick nav CTA, weekly rhythm grafiko vidinis scroll, fixed-vs-flexible sumos, recurring one-click log, suvestinių ir CSV preview veiksmai bei kelios metrikų kortelės. Production deploy, Stripe Live, DB ir git push nevykdyti.
2026-08-20 – Asmeninio nario zonos P1 overflow hotfix patvirtintas lokalia naršykline patikra. Pataisyta document-level mobile overflow priežasčių grandinė: vidinės nario navigacijos scroll pločio plitimas į layout, Savings Studio ledger/formų/panelių intrinsic plotis ir 1024 px greitos navigacijos fiksuotas `lg:min-w-[42rem]`. Pakeisti `Layout`, `MemberAreaPage`, `SavingsStudioPage`, `DigitalProductAccessGrid`, `index.css`, `PLAN.md`, `STATUS.md` ir `server/tests/savingsStudioPersonalUi.test.js`; Playwright smoke per saugius mock duomenis praėjo 320, 360, 375, 390, 412, 768, 1024 ir 1440 px, screenshotai sugeneruoti `.codex-tmp/screenshots`. Liko rankinis realaus telefono smoke po review; commit, push, deploy, Stripe Live, DB ir išoriniai pakeitimai nevykdyti.
2026-08-14 – Verslo zonos 2 etapas lokaliai baigtas. Protected `/business` workspace turi bendrą responsive `BusinessLayout`, šešias unikalias operacines navigacijos nuorodas, desktop sticky sidebar, mobile vidinį horizontalų nav scroll ir legacy `my-store/settings` redirectus į `site-builder`. Globalus platus `max-w-[1800px]` režimas taikomas `/members/savings-studio`, `/business` ir `/business/*`, bet ne viešiems puslapiams ar `/stores/:slug`. Production deploy, Stripe Live, DB ir git push nevykdyti.
2026-08-14 – Savings Studio plataus workspace responsive etapas lokaliai baigtas. Tik `/members/savings-studio` gavo platų `max-w-[1800px]` layout režimą; vieši, admin ir verslo puslapiai neplėsti. Nario zonos sidebar/turinio grid pervestas į `minmax(0,1fr)`, Savings Studio trijų stulpelių sekcijos atidėtos iki `2xl`, o ankstesnės mobile overflow apsaugos paliktos ir padengtos statinėmis regresijomis. Production deploy, Stripe Live, DB ir git push nevykdyti.
2026-08-13 – Milestone 3 uždarytas ir Milestone 4 pradėtas. Business Dashboard/Store/Orders/Revenue/Site Builder/Admin Analytics sutvarkyti konservatyviai: paid-only revenue, public checkout limiteris, griežtesnė selected product ID validacija, paid-order invoice atsisiuntimas ir aiškus rankinių payout ribojimas. Validuota su `npm run lint`, `npm run typecheck`, `npm test` ir `npm run build`. `PROJECT_STATE` paliekamas `IN_PROGRESS`, nes Security/kokybės milestone ir release-candidate patikra dar neužbaigti.
2026-08-13 – Milestone 4 tęsiamas. Pašalinti high dependency audit blokatoriai tiksliniais atnaujinimais, Vite 8 migracija validuota su build ir preview HTTP smoke, secret scan realių frontend paslapčių nerado. `PROJECT_STATE` paliekamas `IN_PROGRESS`, nes responsive/accessibility ir release-candidate checklist dar neužbaigti.
2026-08-13 – Milestone 5 uždarytas. README ir `codex-work/RELEASE_CHECKLIST.md` atnaujinti, finalinis kainų/narystės skenas praėjo, `npm audit --audit-level=high`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, wrapper syntax check ir `/pricing` preview smoke praėjo. `PROJECT_STATE: RELEASE_CANDIDATE_READY`.
2026-08-13 – RC auth recovery blockeris sutvarkytas. Pridėtas saugus slaptažodžio atkūrimo srautas: generic forgot-password atsakymas, hashintas vienkartinis tokenas su 15 min. TTL, reset-password su esama slaptažodžio politika, `authVersion` senų JWT sesijų invalidavimui, Brevo/SMTP reset laiškas, vieši LT frontend puslapiai ir avarinis `owner:recover-password` CLI be slaptažodžio argumentų. Production DB, `.env`, Stripe, išorinės paskyros ir realūs el. laiškai neliesti. Validuota su `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test` (72/72), `npm.cmd run build` ir `git diff --check` (tik CRLF normalizavimo įspėjimai).
2026-08-13 – Ankstesnio Codex review P2 auth recovery pastabos ištaisytos. Forgot-password siuntimo rezultatas dabar viduje tikslus, siuntimo gedimas išvalo tik tos užklausos aktyvų tokeną ir nepašalina naujesnio tokeno, o reset-password tokenas panaudojamas vienu atominiu DB update. Pridėti env, siuntimo patikimumo, senos/naujos užklausos lenktynių, concurrent reset, bcrypt, `authVersion`, role/subscription ir expired/reused tokenų regresijos testai. Validuota su `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test` (80/80), `npm.cmd run build`, `npm.cmd audit --audit-level=high` ir `git diff --check`.
2026-08-13 – Final production readiness auditas atliktas šakoje `codex/final-production-audit-20260813`. Kainodara pervesta į galutinę 0 / 14,99 / 44,99 schemą serverio ir kliento planų konfigūracijose, viešuose SEO tekstuose, Saving Studio hero žymoje, admin Instagram šablonuose, README, SPEC, PLAN, AGENTS ir release checklist. Pridėtas `server/tests/membershipPricing.test.js`, kuris saugo serverio, kliento ir aktyvių membership paviršių kainas nuo 9/24/99 grįžimo. Viešas API `/api/health` atsakė 200 OK; viešo frontend assetuose dar matomas senas deploy su 24/99 kainomis, todėl production frontend redeploy lieka rankinis veiksmas. Galutinė išvada: READY WITH MANUAL CHECKS.
