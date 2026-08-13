# Stilloak Studio autonomous execution plan

Codex privalo palaikyti šį failą kaip gyvą planą.

## Milestone 0 – Baseline audit

- [ ] Patikrinta Git ir projekto struktūra.
- [ ] Perskaityta esama dokumentacija.
- [ ] Surasti visi membership ir pricing šaltiniai.
- [ ] Surasti klientų ir serverio planų guard mechanizmai.
- [ ] Surasti testų, lint, typecheck ir build scenarijai.
- [ ] Įvertinti esami Excel arba finansų prototipai.
- [ ] Užfiksuotos dabartinės klaidos ir rizikos.
- [ ] Į PLAN.md įrašytos konkrečios rastos komandos ir priėmimo kriterijai.

## Milestone 1 – Bendras production pagrindas

- [ ] Centralizuota teisinga kainodara.
- [ ] Pašalintos senos arba neteisingos kainos.
- [ ] Sutvarkytas planų pavadinimų nuoseklumas.
- [ ] Patikrinta autentifikacija ir sesijos valdymas.
- [ ] Patikrinti backend planų guard.
- [ ] Sutvarkytos kritinės bendros UI ir API klaidos.
- [ ] Praeina milestone validacija.

## Milestone 2 – Asmeninis 10/10

- [ ] Saving Studio srautų auditas.
- [ ] Skaičiavimų ir duomenų validacija.
- [ ] Onboarding ir aiški vartotojo kelionė.
- [ ] Loading, empty, success ir error būsenos.
- [ ] Mobilus ir desktop UX.
- [ ] Planų ir kreditų elgesio nuoseklumas.
- [ ] Demo ir Asmeninio prieigų testai.
- [ ] Reikalingi unit ir integration testai.
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
