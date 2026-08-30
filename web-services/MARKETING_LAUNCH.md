# Stilloak Web reklamos paleidimo rinkinys

Šis dokumentas skirtas pasiruošimui. Reklamos nepaleidžiamos, kol nepatvirtinta individuali veikla, nesutvarkyta PVM/SVS situacija ir nepriimtas atskiras sprendimas dėl biudžeto.

## Pagrindinis pasiūlymas

**Pažadas:** profesionali, greita ir telefonui pritaikyta verslo svetainė su aiškia kaina ir procesu.

**Pagrindinė auditorija:** Lietuvos smulkus verslas ir savarankiški specialistai, kuriems reikia pirmos profesionalios svetainės arba pasenusios svetainės atnaujinimo.

**Pagrindinis veiksmas:** pateikti svetainės kūrimo užklausą adresu `https://web.stilloak-studio.com/#kontaktai`.

## Kampanijų struktūra

1. `meta_lt_small_business_prospecting` – nauji smulkaus verslo klientai.
2. `meta_lt_website_refresh_prospecting` – verslai, turintys pasenusią svetainę.
3. `meta_lt_retarg_30d` – lankytojai, kurie buvo svetainėje, bet nepateikė užklausos. Aktyvuoti tik sukaupus pakankamą teisėtai surinktą auditoriją.

Pradinis testas: 5–10 Eur per dieną, dvi auditorijos, po 2 reklamos variantus. Vertinti ne paspaudimų kainą, o kvalifikuotų užklausų skaičių ir kainą.

### Profesionalaus testo matrica

| Kampanija | Auditorija | Žinutė | Vizualas | Tikslas |
| --- | --- | --- | --- | --- |
| Pirma svetainė | Smulkus verslas ir savarankiški specialistai | Profesionali svetainė nuo 299 € | Kvadratinis pasiūlymas | Užklausa |
| Atnaujinimas | Verslai su pasenusia arba nepritaikyta svetaine | Ar svetainė vis dar kuria pasitikėjimą? | 4:5 atnaujinimo vizualas | Užklausa |
| Procesas | Šiltesnė auditorija | Aiški kaina, privati projekto erdvė ir matoma eiga | Story/Reels | Grįžimas ir užklausa |

Vienu metu nekeisti auditorijos, teksto ir vizualo – kitaip nebus aišku, kas pagerino rezultatą.

## UTM žymos

Naudoti mažąsias raides ir nekeisti pavadinimų kampanijos metu.

```text
https://web.stilloak-studio.com/?utm_source=facebook&utm_medium=paid_social&utm_campaign=lt_small_business_launch&utm_content=static_offer_a
https://web.stilloak-studio.com/?utm_source=instagram&utm_medium=paid_social&utm_campaign=lt_small_business_launch&utm_content=story_offer_a
```

## Reklamos tekstai

### A – pirma svetainė

**Antraštė:** Profesionali svetainė jūsų verslui nuo 299 €

**Tekstas:** Klientai pirmiausia patikrina, kaip verslas atrodo internete. Sukursime greitą, telefonui pritaikytą svetainę su aiškia struktūra ir kontaktų forma. Peržiūrėkite kainas ir pateikite užklausą.

**Mygtukas:** Gauti pasiūlymą

### B – svetainės atnaujinimas

**Antraštė:** Ar jūsų svetainė vis dar kuria pasitikėjimą?

**Tekstas:** Atnaujiname pasenusias verslo svetaines: sutvarkome struktūrą, mobilų vaizdą, greitį ir kelią iki užklausos. Trumpai papasakokite, ką turite dabar – pasiūlysime aiškų sprendimą.

**Mygtukas:** Sužinoti daugiau

### C – aiški kaina

**Antraštė:** Svetainės kūrimas be neaiškaus proceso

**Tekstas:** Aiškūs paketai, darbų planas, privati projekto nuoroda ir matoma eiga nuo pasiūlymo iki paleidimo. Start paketas – 299 €, Business – 599 €, Pro – 999 €.

**Mygtukas:** Peržiūrėti kainas

## Vizualų specifikacija

- Kvadratas: 1080 × 1080 px.
- Story/Reels: 1080 × 1920 px, svarbų tekstą laikyti centrinėje saugioje zonoje.
- Pagrindinė žinutė vaizde: ne daugiau kaip 6–8 žodžiai.
- Rodyti realų Stilloak svetainės mobilų ir desktop vaizdą; koncepcinius darbus aiškiai žymėti kaip pavyzdžius.
- Vengti nepatvirtintų teiginių, netikrų klientų atsiliepimų ir garantuotų rezultatų pažadų.

### Galutinė premium kampanijos kryptis

Naudoti tik kataloge `marketing-assets/premium` esančius galutinius PNG failus:

- `stilloak-premium-dark.png` – pagrindinė 4:5 įvaizdinė reklama;
- `stilloak-premium-light.png` – kvadratinė šviesi reklama;
- `stilloak-premium-story.png` – atskirai sukomponuota Story/Reels reklama.

Kataloge `marketing-assets/drafts` palikti ankstesni techniniai juodraščiai nenaudojami kampanijoje. Premium krypties principai: redakcinė fotografija, tikros medžiagų tekstūros, santūri spalvų paletė, daug neigiamos erdvės ir ne daugiau kaip viena pagrindinė žinutė viename vizuale.

## Matavimo įvykiai

- `page_view` / `PageView` – apsilankymas.
- `cta_click` – pagrindinio mygtuko, el. pašto arba telefono paspaudimas.
- `select_package` – paketo pasirinkimas.
- `generate_lead`, `lead_submit` ir Meta `Lead` – sėkmingai priimta užklausa.
- UTM, `gclid` ir `fbclid` išsaugomi kartu su užklausa administravime.

Meta Pixel įkeliamas tik nustačius `VITE_META_PIXEL_ID` ir lankytojui sutikus su rinkodaros slapukais.

## Pagrindiniai rodikliai

Pirmojo testo tikslas yra ne kuo daugiau pigių paspaudimų, o gauti pirmas kvalifikuotas užklausas ir suprasti jų kainą.

| Rodiklis | Ką parodo | Veiksmas |
| --- | --- | --- |
| Landing page peržiūros | Ar reklama realiai atveda lankytoją | Tikrinti, jei ryškiai mažiau nei nuorodos paspaudimų |
| CTA paspaudimai | Ar pasiūlymas sukelia ketinimą | Lyginti pagal kampaniją ir vizualą |
| Paketų pasirinkimai | Kokia kaina ir paketas domina | Naudoti pasiūlymo tobulinimui |
| Kvalifikuotos užklausos | Realūs potencialūs klientai | Pagrindinis optimizavimo rodiklis |
| Kaina už kvalifikuotą užklausą | Ar reklama ekonomiškai pagrįsta | Biudžetą didinti tik stabilizavus šį rodiklį |

Kvalifikuota užklausa: pateikti galiojantys kontaktai, aiškus verslo poreikis ir projektas atitinka teikiamas paslaugas. Vien formos pateikimas dar nelaikomas pardavimu.

## Biudžeto valdymas

- Pirmas 7 dienas nekeisti biudžeto dažniau nei kartą per 48 valandas.
- Nedidinti biudžeto po vienos geros dienos.
- Stabdyti reklamą, jei gaunamas nekokybiškas srautas, klaidinantys komentarai arba neveikia užklausos kelias.
- Didinti biudžetą palaipsniui, tik turint kelias kvalifikuotas užklausas ir aiškią jų aptarnavimo eigą.
- Atskirai žymėti, kiek užklausų virto pasiūlymais, avansais ir užbaigtais projektais.

## Užklausos aptarnavimo standartas

1. Naują užklausą peržiūrėti tą pačią darbo dieną.
2. Patikrinti svetainę ar verslą, jei klientas pateikė nuorodą.
3. Atsakyti asmeniškai, ne vien automatiniu šablonu.
4. Surinkti trūkstamą informaciją ir tik tada rengti pasiūlymą.
5. Administravime pažymėti reklamos šaltinį, pasiūlymo vertę ir galutinį rezultatą.

## Paleidimo vartai

- [ ] VMI individualios veiklos pažyma aktyvi.
- [ ] Sutvarkyta PVM/SVS registracija užsienio reklamos ir platformų paslaugoms.
- [ ] Svetainėje ir sąskaitose įrašyti oficialūs rekvizitai.
- [ ] Patvirtintas reklamos biudžetas ir mokėjimo kortelė.
- [ ] Meta Pixel ID įrašytas Vercel aplinkoje ir ištestuotas su sutikimu.
- [ ] Užklausa iš telefono pasiekia administravimą ir el. paštą.
- [ ] Patikrinti privatumo ir slapukų tekstai.
- [ ] Pirmą savaitę tikrinamos užklausos kasdien; biudžetas nedidinamas be duomenų.
