# Stilloak Studio release-candidate specification

## Tikslas

Nuosekliai išbaigti Stilloak Studio iki saugiai patikrinamos lokalios release-candidate būsenos.

Darbų tvarka:

1. Dabartinės sistemos auditas.
2. Bendro pagrindo ir kainodaros sutvarkymas.
3. Asmeninio plano išbaigimas iki 10/10.
4. Tik tada Privataus verslo plano išbaigimas.
5. Saugumas, testai, responsive dizainas ir release patikra.
6. Rankinių produkcijos paleidimo veiksmų sąrašas.

## Technologijos

Esama architektūra yra pagrindas:

- React ir Vite klientas.
- Node.js ir Express serveris.
- MongoDB.
- JWT autentifikacija.
- Stripe integracija.
- Tailwind arba dabartinė projekto stilių sistema.

Nekeisti visos architektūros be aiškios techninės būtinybės.

## Narystės

### Demo

- Kaina: nemokama.
- Turi aiškiai pristatyti produkto vertę.
- Gali naudotis tik Demo skirtomis funkcijomis.
- Negali gauti Asmeninio ar Verslo plano privilegijų apeinant backend apsaugą.

### Asmeninis

- Kaina: 14,99 EUR/mėn.
- Prioritetinis pirmas produktas.
- Saving Studio ir susiję asmeninių finansų įrankiai turi būti realiai naudingi, suprantami ir patikimi.
- Reikalingas aiškus onboarding, validacija, loading, empty ir error būsenos.
- Skaičiavimai turi būti patikrinami ir neturėti `#VALUE!`, `NaN`, `undefined` ar panašių klaidų.
- Esami Excel prototipai ir jų logika turi būti įvertinti, jei jie yra saugykloje.
- Importas, eksportas ir ataskaitos turi būti įgyvendinami tik tiek, kiek pagrindžia esama produkto logika.

### Privatus verslas

- Kaina: 44,99 EUR/mėn.
- Darbai pradedami tik užbaigus Asmeninio plano priėmimo kriterijus.
- Business Studio prieinama tik šiam planui.
- Vertinti esamas arba suplanuotas funkcijas:
  - Business Dashboard;
  - Site Builder;
  - Store;
  - Orders;
  - Revenue;
  - CSV import;
  - PDF invoices;
  - withdrawals;
  - commission;
  - admin controls.
- Neimituoti veikiančių finansinių operacijų, jei backend logika neegzistuoja.
- Nevykdyti realių išmokėjimų ar Stripe Live veiksmų.

## Bendri kokybės reikalavimai

- Vienoda kainodara visuose puslapiuose ir API atsakymuose.
- Backend autorizacija yra galutinis prieigos kontrolės sluoksnis.
- Aiškus prisijungimo, registracijos ir sesijos galiojimo elgesys.
- Saugus klaidų apdorojimas.
- Jokių paslapčių frontend kode.
- Įvesties validacija.
- Responsive mobilus ir desktop dizainas.
- Klaviatūros navigacija bei pagrindinis prieinamumas.
- Jokios akivaizdžios lorem ipsum ar neveikiančios produkcinės imitacijos.
- Aiškios loading, empty, success ir error būsenos.
- Esami veikiantys srautai negali būti sugadinti.

## Neįtraukti autonominiai veiksmai

Šis darbas neapima:

- production deploy;
- realaus Stripe aktyvavimo;
- realių mokėjimų;
- produkcinės MongoDB migracijos;
- domeno ar DNS keitimo;
- verslo el. pašto kūrimo;
- teisinių dokumentų patvirtinimo;
- realių paskyrų ar prisijungimų kūrimo;
- reklamos kampanijų paleidimo.

Codex turi paruošti kodą, dokumentaciją ir kontrolinį sąrašą šiems veiksmams, tačiau jų nevykdyti.

## Release-candidate priėmimo kriterijai

Projektas laikomas lokaliai paruoštu release candidate tik kai:

1. Kainos visur yra Demo 0, Asmeninis 14,99, Privatus verslas 44,99.
2. Planų prieigos patikrintos frontend ir backend.
3. Asmeninio plano pagrindiniai vartotojo srautai veikia.
4. Verslo plano įgyvendinti srautai nėra vien vizualios imitacijos.
5. Kritiniai testai, lint, typecheck ir build praeina.
6. Nėra žinomų kritinių saugumo problemų.
7. Nėra netyčia įkeltų paslapčių.
8. Dokumentuotas lokalus paleidimas.
9. Dokumentuotos likusios rankinės produkcijos užduotys.
10. Atlikta galutinė pakeitimų peržiūra.
