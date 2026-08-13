# Asmeninio nario zonos uzbaigimo dokumentas

## Esama busena

- `MemberAreaPage.jsx` veikia kaip nario zonos shell: rodo planą, modulių navigaciją, admin/dev preview režimą ir atskiria Demo, Asmeninį bei Privataus verslo matomumą.
- `SavingsStudioPage.jsx` turi realų Asmeninio plano darbo srautą: onboarding, mėnesio apžvalgą, išlaidų įrašus, biudžetus, recurring mokėjimus, taupymo tikslus, analitiką, CSV importą, backup ir suvestinių siuntimo veiksmus.
- `SavingsStudioDemoPage.jsx` ir `BazinisMemberPage.jsx` lieka demonstraciniai paviršiai; pilnas `/api/savings-studio/*` backend API apsaugotas `protect` ir `requireSavingsStudioPro`.
- Serverio duomenys filtruojami pagal `req.user._id`; CRUD update/delete naudoja `findOne({ _id, user })`.
- Esami testai dengia planų prieigą, kainodarą, Saving Studio helperius, Personal UI statines būsenas, Business Studio regresijas ir auth/security srautus.

## Rastos ir taisytos problemos

- CSV preview galėjo parodyti tinkamas eilutes, bet serverio confirm etapas dar neturėjo savo dublikatų apsaugos. Tai reiškė, kad tiesioginis API kvietimas galėjo įrašyti pasikartojančius `date + amount + title + category` įrašus.
- CSV preview neskyrė serverio pusėje jau egzistuojančių dublikatų nuo naujų importuojamų eilučių.
- `entries/:entryId`, `goals/:goalId` ir `recurring/:recurringId` maršrutai neturėjo aiškios `ObjectId` validacijos prieš controller logiką.
- Įrašų, biudžetų, tikslų ir recurring sumoms trūko vienodos viršutinės ribos; profilio pajamoms ši riba jau buvo.

## Igyvendinimo planas

- Sustiprinti backend duomenų teisingumą ir prieigos kontrolės kraštus.
- Palikti esamus frontend srautus, bet priderinti CSV kokybės rodymą prie serverio atsakymo.
- Pridėti regresinius testus be realios MongoDB, el. pašto ar production servisų.
- Po pakeitimų paleisti tikslines patikras, build ir galutinį privalomų komandų rinkinį.

## Prieigos matrica

| Vartotojas | Frontend elgesys | Backend elgesys |
| --- | --- | --- |
| Neprisijungęs | `ProtectedRoute` nukreipia į `/login`. | `protect` grąžina 401. |
| Free / inactive | Nukreipiamas į kainodarą arba mato užrakintas zonas. | `requireSavingsStudioPro` grąžina 403. |
| Demo / basic active arba trialing | Mato Demo/Bazinis peržiūrą ir upgrade kryptį. | Pilnas Saving Studio API blokuojamas 403. |
| Personal active arba trialing | Mato pilną Asmeninio nario zoną ir Saving Studio. | Pilnas Saving Studio API leidžiamas. |
| Private business active arba trialing | Paveldi Asmeninio funkcionalumą. | Pilnas Saving Studio API leidžiamas. |
| Admin | Gali naudoti preview pagal esamą admin logiką. | Admin praeina planų guardus, bet nekeičia realaus vartotojo narystės. |
| canceled / past_due / netinkama būsena | Mokami srautai užrakinti, duomenys netrinami. | Mokamas API blokuojamas 403. |

## Priemimo kriterijai

- [x] Kainodara išlieka Demo 0, Asmeninis 14,99 EUR/mėn., Privatus verslas 44,99 EUR/mėn.
- [x] Serveris yra galutinis pilnos Saving Studio prieigos kontrolės sluoksnis.
- [x] Demo/basic negali naudoti pilno Saving Studio API.
- [x] Personal ir Private business paveldi pilną Saving Studio funkcionalumą.
- [x] Inactive/canceled/past_due mokama prieiga blokuojama, duomenų trynimas nevykdomas.
- [x] CSV preview nekeičia DB ir rodo tinkamas, klaidingas bei dublikacines eilutes.
- [x] CSV confirm importuoja tik priimtas eilutes ir grąžina atmestų eilučių informaciją.
- [x] CRUD ID parametrai validuojami prieš controller DB užklausas.
- [x] Įrašų, biudžetų, tikslų, recurring ir profilio sumos turi bendrą viršutinę ribą.
- [x] Frontend CSV kokybės kortelė naudoja serverio dublikatų informaciją.
- [x] Nauji regresiniai testai pridėti saugiai, be production servisų.

## Concurrent CSV confirm rizika

- Dabartinė CSV dublikatų apsauga yra best-effort, ne atominė.
- Sąmoningai nepridėtas globalus unique index, nes jis galėtų blokuoti teisėtus pasikartojančius rankinius įrašus arba skirtingų importų eilutes, kurios vartotojui yra prasmingos.
- Projekte nerastas esamas saugus Saving Studio importo idempotency raktas ar import session modelis. Atominiam sprendimui reikėtų produkto sprendimo dėl importo sesijos ID, failo hash ar vartotojo patvirtinamo dedupe režimo.
- Esama apsauga blokuoja jau DB esančius ir tame pačiame payload pasikartojančius visiškai sutampančius normalizuotus `date + amount + title + category` įrašus, bet du vienu metu paleisti identiški confirm kvietimai teoriškai gali lenktyniauti.

## Likusios rankines patikros

- Authenticated Personal Studio naršyklinis smoke su realia testine paskyra dar reikalauja saugių testinių credentials.
- Vizualinę 360 px, 768 px ir desktop peržiūrą verta pakartoti naršyklėje po review; šiame etape automatinė statinė responsive regresija lieka pagrindinė vietinė apsauga.
