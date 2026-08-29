# Stilloak Studio Codex instructions

Prieš keisdamas pagrindinės Stilloak Studio sistemos kodą visiškai perskaityk:

- codex-work/SPEC.md
- codex-work/PLAN.md
- codex-work/IMPLEMENT.md
- codex-work/STATUS.md

## Patvirtintos kainos

- Demo – nemokamas.
- Asmeninis – 14,99 EUR/mėn.
- Privatus verslas – 44,99 EUR/mėn.

## Bendros saugumo taisyklės

- Neklausti rutininių klausimų, jeigu užduotis aiški ir veiksmas saugus.
- Rinktis saugius, lengvai atšaukiamus ir mažiausios būtinos apimties sprendimus.
- Nenaudoti Stripe Live ir nevykdyti realių mokėjimų.
- Nekeisti produkcinės duomenų bazės, DNS, domenų ar išorinių paskyrų, jeigu vartotojas to aiškiai neprašė.
- Nerodyti, nekeisti ir necommitinti slaptažodžių, API raktų, tokenų ar `.env` reikšmių.
- Nenaudoti `git reset --hard`, `git clean -fd`, force push ar kitų destruktyvių Git komandų.
- Saugoti vartotojo pakeitimus ir neliesti su užduotimi nesusijusių failų.

## Pagrindinės Stilloak Studio sistemos darbo tvarka

Šios taisyklės taikomos root `client`, `server`, `shared`, `database` ir su narystėmis susijusiems failams:

- Pirmiausia užbaigti Asmeninį planą, tik tada tęsti Privataus verslo planą.
- Po kiekvienos pakeitimų grupės vykdyti aktualius testus, lint, typecheck ir build.
- Nepraeitas patikras pataisyti prieš tęsiant.
- Nuolat atnaujinti `codex-work/STATUS.md`, kai keičiasi pagrindinės sistemos būsena.
- Production deploy leidžiamas tik tada, kai vartotojas aiškiai paprašo deployinti būtent pagrindinę sistemą.
- Stripe Live ir produkcinės DB pakeitimams visada reikia atskiro aiškaus vartotojo nurodymo.

## Stilloak Web: darbas iš telefono

Šios taisyklės taikomos tik savarankiškai aplikacijai `web-services/`, kuri diegiama į `web.stilloak-studio.com`.

Kai vartotojas telefonu paprašo pakeisti, sutvarkyti, testuoti ar deployinti Stilloak Web:

1. Pats surask aktualius failus ir įgyvendink užduotį nuo pradžios iki galo. Nereikalauk, kad vartotojas jungtų kompiuterį, PowerShell ar lokaliai vykdytų komandas.
2. Jei lokalaus repo nėra, naudok prijungtą GitHub ir dirbk tiesiogiai su `Rokasberr/manoshop-lite`.
3. Prieš pakeitimus patikrink dabartinę šaką, esamus failus ir neperrašyk nesusijusių vartotojo darbų.
4. Pakeitimams naudok atskirą trumpai pavadintą šaką, kai užduotis didesnė ar rizikingesnė. Mažą dokumentacijos ar aiškų vieno failo pataisymą galima commitinti tiesiai į `main`.
5. Niekada necommitink `.env`, Vercel tokenų ar kitų paslapčių. Vercel aplinkos kintamuosius naudok tik per prijungtą Vercel projektą.
6. Įdiek priklausomybes ir `web-services/` kataloge vykdyk:
   - `npm ci`
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`
7. Jei pakeitimas veikia vartotojo srautą ir yra tinkami naršykliniai testai, atlik aktualų smoke arba end-to-end testą mobiliame ir desktop dydžiuose.
8. Jei kuri nors privaloma patikra nepraeina, išsiaiškink priežastį ir pataisyk. Nedeployink žinomos klaidos, nebent gedimas aiškiai nesusijęs ir vartotojui tiksliai tai paaiškinta.
9. Kai patikros praeina, sukurk aiškų commitą ir pushink į GitHub be papildomo rutininio patvirtinimo.
10. GitHub/Vercel integracijos atveju pirmiausia patikrink sugeneruotą preview deployment. Patvirtinus preview būseną ir pagrindinį smoke testą, merge į `main` arba promote/deploy į production.
11. Vartotojo nurodymas „deployink“, „paleisk“, „įkelk į web.stilloak-studio.com“ ar lygiavertis aiškus prašymas suteikia leidimą atlikti `web-services` production deploy be papildomo klausimo.
12. Po production deploy patikrink:
    - deployment būsena yra `READY`;
    - `https://web.stilloak-studio.com` atsidaro;
    - nėra akivaizdžių console ar runtime klaidų;
    - pagrindinė navigacija, CTA ir kontaktų forma bent smoke lygiu veikia.
13. Jei production patikra nepraeina, išanalizuok Vercel build/runtime logus ir saugiai pataisyk arba rollbackink į paskutinę veikiančią versiją.
14. Baigęs trumpai pateik: ką pakeitei, kokios patikros praėjo, GitHub commit/PR nuorodą, Vercel URL ir galutinę production būseną.

## Git ir deploy leidimai

- Leidžiama kurti šakas, commitus, pull requestus, juos mergeinti ir vykdyti paprastą `git push`, kai tai būtina aiškiai vartotojo Stilloak Web užduočiai.
- Leidžiama atlikti `web-services` preview ir production deploy pagal aukščiau aprašytą testų vartų tvarką.
- Commitų kūrimas nebepriklauso nuo vietinio PowerShell runnerio.
- Šie leidimai automatiškai netaikomi Stripe Live, produkcinei DB, DNS ar pagrindinės Stilloak Studio sistemos production deploy.
