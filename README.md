# ManoShop Lite

`ManoShop Lite` yra pagrindinis `Stilloak Studio` produktas šiame repozitoriume. Produkcinis kelias šiuo metu yra tik:

```text
/client    -> React + Vite frontend
/server    -> Node.js + Express API
/database  -> MongoDB seed/connect failai
```

`ai-sales-copilot-saas/` yra atskiras, šiuo metu neintegruotas Next.js projektas. Jo nelaikyk pagrindinio `ManoShop Lite` produkcinio deploy dalimi.

## Kas jau veikia

- JWT autentifikacija su `customer` ir `admin` rolėmis.
- Produktų CRUD administratoriaus dalyje.
- Krepšelis, checkout ir užsakymai.
- Stripe vienkartiniai mokėjimai produktams.
- Stripe prenumeratos mokamiems planams.
- PDF sąskaitos.
- Refund / cancel payment administratoriaus pusėje.
- MongoDB Atlas integracija.
- Saving Studio ir Business Studio moduliai.

## Narystės Planai

- `basic` / Demo: nemokamas internal planas, 0 EUR. Jis nėra siunčiamas į Stripe Checkout.
- `personal` / Asmeninis: mokamas Stripe planas, 24 EUR per mėn.
- `private_business` / Privatus verslas: mokamas Stripe planas, 99 EUR per mėn.

Seni aliasai `bazinis`, `asmeninis` ir `privatus_verslas` paliekami duomenų suderinamumui.

## Lokalinis Paleidimas

1. Įdiek priklausomybes:

```bash
npm install
```

2. Susikurk env failus pagal pavyzdžius:

- `server/.env.example`
- `client/.env.example`

3. Jei reikia demo duomenų:

```bash
npm run seed
```

4. Paleisk development režimu:

```bash
npm run dev
```

Frontend veikia per Vite, backend per Express API.

## Aplinkos Kintamieji

Backend naudoja šiuos kintamųjų pavadinimus:

- `PORT`
- `NODE_ENV`
- `TRUST_PROXY`
- `MONGO_URI`
- `MONGO_DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PASSWORD_RESET_BASE_URL`
- `PASSWORD_RESET_TOKEN_TTL_MINUTES`
- `CLIENT_URL`
- `COMPANY_NAME`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ASMENINIS`
- `STRIPE_PRICE_PRIVATUS_VERSLAS`
- `STRIPE_WEBHOOK_TOLERANCE_SECONDS`
- `STRIPE_DYNAMIC_TAX_BEHAVIOR`
- `EMAIL_FROM`
- `EMAIL_LOGO_URL`
- `BREVO_API_KEY`
- `BREVO_API_TIMEOUT`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `BREVO_LAUNCH_SOON_LIST_ID`
- `SAVINGS_STUDIO_SUMMARY_SCHEDULER_ENABLED`
- `SAVINGS_STUDIO_SUMMARY_INTERVAL_MINUTES`

Frontend naudoja:

- `VITE_API_URL`

Demo planui Stripe Price ID nereikalingas. Stripe Price ID privalomi tik `Asmeninis` ir `Privatus verslas` planams.

## Deploy Architektūra

Rekomenduojamas variantas:

- Frontend: Vercel, root directory `client`.
- Backend: Render, pagal `render.yaml`.
- DB: MongoDB Atlas.
- Stripe webhook: backend kelias `/api/billing/webhook`.

Backend health patikra: `/api/health`.

## Stripe Webhook

Stripe webhook turi likti pagrindinis narystės aktyvavimo šaltinis. Rekomenduojami eventai:

- `checkout.session.completed`
- `checkout.session.expired`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `charge.refunded`
- `refund.updated`

Po mokėjimo frontend gali kviesti saugų atsarginį sinchronizavimo endpointą, perduodamas tik Stripe Checkout Session ID. Serveris pats patikrina Stripe sesiją ir jos priklausymą prisijungusiam vartotojui.

## Administratoriaus Paskyra

Viešų administratoriaus prisijungimo duomenų repozitoriume neturi būti. Administratoriaus paskyra turi būti sukuriama arba nustatoma saugiu, neviešinamu būdu, pavyzdžiui per kontroliuojamą seed, vidinį administravimo procesą arba tiesioginę saugią DB operaciją.

Produkcijoje savininkas turi patikrinti, kad administratoriaus paskyros slaptažodis yra unikalus, stiprus ir nėra naudotas jokioje viešoje dokumentacijoje ar demo aplinkoje.

Jei savininkas nebegali prisijungti ir įprastas el. pašto atkūrimas neveikia, atskirame patvirtintame priežiūros lange galima naudoti avarinį CLI. Jo nevykdyti be aiškaus DB ir savininko el. pašto patvirtinimo:

```bash
npm run owner:recover-password -- --target-email=owner@example.com --confirm-email=owner@example.com
```

Komanda nepriima slaptažodžio per argumentus. Ji parodo pasirinktą MongoDB duomenų bazės vardą, tada naują slaptažodį skaito per paslėptą promptą arba stdin. Ji keičia tik nurodyto vartotojo slaptažodį, išvalo atkūrimo tokeną ir padidina `authVersion`, kad senos JWT sesijos nebegaliotų.

Slaptažodžio atkūrimo el. laiškams būtina sukonfigūruoti `EMAIL_FROM` ir vieną siuntimo kelią: `BREVO_API_KEY` Brevo API keliui arba SMTP keliui `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`.

## Produkcinis Checklist

- `MongoDB Atlas` prijungtas.
- Backend health endpoint veikia.
- Frontend SPA route fallback veikia.
- `CLIENT_URL` leidžia tik realius frontend origin.
- `VITE_API_URL` rodo į realų backend `/api` adresą.
- Stripe webhook signing secret nustatytas backend aplinkoje.
- `Asmeninis` ir `Privatus verslas` Stripe Price ID nustatyti backend aplinkoje ir atitinka 24 EUR/mėn. bei 99 EUR/mėn.
- Demo planas aktyvuojamas internal būdu be Stripe.
- Viešų admin prisijungimo duomenų nėra dokumentacijoje.
