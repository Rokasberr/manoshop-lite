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

## Vykdoma

- Milestone 2 tęsiamas: Saving Studio srautų, skaičiavimų, validacijos, loading/empty/error būsenų ir smoke testų auditas.

## Validacijos rezultatai

- `npm run lint` – PASS, patikrinti 90 backend JavaScript failų.
- `npm run typecheck` – PASS, TypeScript projekto nėra; backend JavaScript syntax check praėjo.
- `npm test` – PASS, 50/50 serverio ir statinės klientų patikros praėjo.
- `npm run build` – PASS, Vite build sugeneravo `client/dist`; liko nekritinis įspėjimas apie >500 kB JS chunką.

## Priimti sprendimai

- Pirmiausia užbaigiamas Asmeninis planas.
- Privatus verslas pradedamas tik po Asmeninio priėmimo kriterijų.
- Production veiksmai nevykdomi autonomiškai.
- Interneto prieiga Codex darbo metu išjungta.
- Checkpoint commitus kuria PowerShell runneris.
- Kainodaros pataisa bus atliekama maža pakeitimų grupe, tada paleidžiamos visos root validacijos.
- `client/vite.config.js` paliekamas dev serveriui, o production build naudoja inline Vite wrapperį dėl sandbox prieigos ribojimo.

## Blokatoriai

- Nėra kritinių blokatorių.
- Nekritinė rizika: pagrindinis kliento JS chunkas apie 957 kB po minifikavimo; Vite rekomenduoja code splitting.

## Rankiniai production veiksmai

- Stripe Live nejungti autonomiškai; prieš launch rankiniu būdu patvirtinti `STRIPE_PRICE_ASMENINIS` ir `STRIPE_PRICE_PRIVATUS_VERSLAS`, kad jie atitinka 24 EUR/mėn. ir 99 EUR/mėn.
- Production deploy, domenas, DNS, live mokėjimai ir produkcinė DB lieka žmogaus patvirtinimui.

## Paskutinis atnaujinimas

2026-08-13 – Milestone 2 pradėtas, Saving Studio numeric guards ir onboarding preview validuoti lokaliai.
