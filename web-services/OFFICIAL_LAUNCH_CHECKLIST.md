# Stilloak Web oficialaus paleidimo kontrolė

Šiame faile nėra ir neturi būti tikrų adresų, IBAN, PVM kodų ar API raktų.

## Jau paruošta

- Veiklos vykdytojas: Rokas Bernotas.
- Individualios veiklos pažymos numeris ir veiklos kodas saugomi tik privačioje platformos konfigūracijoje.
- Oficialus kontaktas `rokas@stilloak-studio.com`.
- Sąskaitų serija `ST-YYYY-NNNN` su atomine metine numeracija.
- Atskiri avanso ir galutinio mokėjimo dokumentai.
- Nekintama kiekvienos sąskaitos pardavėjo, pirkėjo, sumos ir mokėjimo kopija.
- Oficialus PDF ir el. laiško priedas.
- Testinių „Stripe“ mokėjimų apsauga nuo oficialios sąskaitos išrašymo.
- Senos testinės sąskaitos lieka atsisiunčiamos kaip testinės.

## Įvesti tik privačiose platformų konfigūracijose

Render serveryje:

```text
WEB_SERVICE_ACTIVITY_CERTIFICATE_NUMBER=<individualios veiklos pažymos numeris>
WEB_SERVICE_ACTIVITY_CODE=<veiklos kodas>
WEB_SERVICE_BUSINESS_ADDRESS=<veiklos arba korespondencijos adresas>
WEB_SERVICE_VAT_CODE=<VMI suteiktas kodas>
WEB_SERVICE_VAT_SCHEME=svs
WEB_SERVICE_OFFICIAL_DOCUMENTS_ENABLED=false
```

Pagrindinės svetainės Vercel projekte:

```text
VITE_WEB_SERVICE_ACTIVITY_CERTIFICATE_NUMBER=<individualios veiklos pažymos numeris>
VITE_WEB_SERVICE_ACTIVITY_CODE=<veiklos kodas>
VITE_WEB_SERVICE_BUSINESS_ADDRESS=<teisinėje informacijoje rodomas adresas>
```

## Gavus VMI sprendimą

1. Patikrinti PVM kodo įsigaliojimo datą ir SVS statusą Mano VMI.
2. Įvesti adresą ir PVM kodą į Render, paliekant oficialių dokumentų jungiklį `false`.
3. Paleisti testinį PDF su fiktyviais duomenimis ir vizualiai patikrinti vieną A4 puslapį.
4. Atnaujinti Vercel teisinės informacijos adreso kintamąjį.
5. Patikrinti privatumo, sąlygų ir grąžinimų puslapius telefone.

## Prieš pirmą realų mokėjimą

1. Atidaryti atskirą Revolut Pro sąskaitą ir gauti EUR IBAN.
2. Stripe Dashboard atlikti tapatybės bei individualios veiklos patikrą.
3. Pridėti Revolut Pro EUR IBAN kaip išmokėjimų sąskaitą.
4. Sukonfigūruoti atskirus `sk_live_` ir live webhook raktus tik platformose, ne kode.
5. Atlikti mažos sumos end-to-end mokėjimo, webhook, PDF ir išmokėjimo testą.
6. Tik po sėkmingo testo nustatyti `WEB_SERVICE_OFFICIAL_DOCUMENTS_ENABLED=true`.

## Apskaita

- Registruoti kliento sumokėtą bendrą sumą, ne vien Stripe neto išmoką.
- Stripe komisinį saugoti atskirai; jei taikomas 30 proc. išlaidų metodas, jo papildomai neatimti.
- Pervedimas tarp savo Revolut Pro ir SEB sąskaitų nėra naujos pajamos.
- Kiekvieną mėnesį išsaugoti Stripe balance / payout ataskaitas ir užsienio paslaugų sąskaitas.
- Mėnesį, kuriame įsigyta apmokestinamų užsienio paslaugų, patikrinti PVM101 prievolę ir terminą.
