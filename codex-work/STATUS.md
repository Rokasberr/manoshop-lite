# Stilloak Studio autonomous status

PROJECT_STATE: IN_PROGRESS

## Dabartinis milestone

Milestone 2 – Asmeninis 10/10.

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

## Vykdoma

- Milestone 2 tęsiamas: onboarding kelionės, loading/empty/error būsenų, responsive UX ir pilno Asmeninio plano smoke testų peržiūra.

## Validacijos rezultatai

- `npm run lint` – PASS, patikrinti 90 backend JavaScript failų.
- `npm run typecheck` – PASS, TypeScript projekto nėra; backend JavaScript syntax check praėjo.
- `npm test` – PASS, 52/52 serverio ir statinės klientų patikros praėjo.
- `npm run build` – PASS, Vite build sugeneravo `client/dist`; paskutinio build main JS chunkas ~437.27 kB, `MemberAreaPage` chunkas ~211.18 kB, Vite >500 kB chunk įspėjimo nebeliko.

## Priimti sprendimai

- Pirmiausia užbaigiamas Asmeninis planas.
- Privatus verslas pradedamas tik po Asmeninio priėmimo kriterijų.
- Production veiksmai nevykdomi autonomiškai.
- Interneto prieiga Codex darbo metu išjungta.
- Checkpoint commitus kuria PowerShell runneris.
- Kainodaros pataisa bus atliekama maža pakeitimų grupe, tada paleidžiamos visos root validacijos.
- `client/vite.config.js` paliekamas dev serveriui, o production build naudoja inline Vite wrapperį dėl sandbox prieigos ribojimo.
- Milestone 2 state-refresh problema sprendžiama konservatyviai: po sėkmingų Saving Studio mutacijų pakartotinai užkraunami tik susiję API duomenys, nekeičiant backend kontraktų ir nedarant optimistinių finansinių skaičiavimų.
- Pradinio užkrovimo klaida sprendžiama lokaliu retry UI, nes tai lengvai atšaukiama ir nekeičia autorizacijos ar API elgesio.
- Kliento bundle rizika sprendžiama route-level `React.lazy` be planų guard architektūros keitimo; `Suspense` fallback naudoja esamą `LoadingSpinner`.

## Blokatoriai

- Nėra kritinių blokatorių.
- Nekritinė rizika: liko neatlikta vizualinė responsive Saving Studio peržiūra realiame naršyklės viewport'e.

## Rankiniai production veiksmai

- Stripe Live nejungti autonomiškai; prieš launch rankiniu būdu patvirtinti `STRIPE_PRICE_ASMENINIS` ir `STRIPE_PRICE_PRIVATUS_VERSLAS`, kad jie atitinka 24 EUR/mėn. ir 99 EUR/mėn.
- Production deploy, domenas, DNS, live mokėjimai ir produkcinė DB lieka žmogaus patvirtinimui.

## Paskutinis atnaujinimas

2026-08-13 – Milestone 2 tęsiamas; Saving Studio mutation state-refresh, initial load retry, helperių `undefined`/legacy data guard ir route-level lazy loading pataisos validuotos su `npm run lint`, `npm run typecheck`, `npm test` ir `npm run build`.
