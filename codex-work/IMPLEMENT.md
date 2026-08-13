# Autonomous implementation runbook

1. Perskaityk AGENTS.md, SPEC.md, PLAN.md ir STATUS.md.
2. Patikrink dabartinę Git būseną.
3. Nustatyk aktyvų neužbaigtą milestone.
4. Išanalizuok susijusius failus prieš juos keisdamas.
5. Įgyvendink nedidelę, nuoseklią pakeitimų grupę.
6. Paleisk jai tinkamas patikras.
7. Jeigu patikra nepraeina, pataisyk problemą ir pakartok.
8. Peržiūrėk savo diff.
9. Atnaujink PLAN.md ir STATUS.md.
10. Pereik prie kito saugaus darbo.

## Darbo tęstinumas

- Neužbaik sesijos vien pateikęs planą.
- Neužbaik sesijos vien įgyvendinęs vieną smulkų pataisymą.
- Tęsk, kol pasiekiamas release candidate arba nebelieka saugiai atliekamų vietinių užduočių.
- Jei kontekstas sutrumpinamas, iš naujo perskaityk SPEC.md, PLAN.md ir STATUS.md.
- Nedaryk kosmetinių STATUS.md pakeitimų vien tam, kad atrodytų, jog padaryta pažanga.
- Jei funkcijai būtina išorinė paskyra ar paslaptis, paruošk adapterį, validaciją, test doubles ir dokumentaciją, tačiau nenaudok realių duomenų.

## Sprendimų taisyklė

Kai yra keli tinkami variantai:

1. Rinkis suderinamą su esama architektūra.
2. Rinkis mažiausiai destruktyvų.
3. Rinkis lengviausiai testuojamą.
4. Rinkis lengviausiai atšaukiamą.
5. Dokumentuok svarbų kompromisą STATUS.md.

## Draudžiama pabaiga

Negalima galutinėje žinutėje tik pasiūlyti, ką vartotojas turėtų įgyvendinti pats, jeigu tai galima saugiai įgyvendinti vietoje.

Reikia realiai atlikti saugiai atliekamus pakeitimus, juos patikrinti ir pateikti įrodymus.
