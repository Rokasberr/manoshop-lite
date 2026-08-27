# Stilloak Web services site

Atskira React + Vite + TypeScript aplikacija svetainei `https://web.stilloak-studio.com`.

## Svetainių užsakymo V1

Paketai:

- Start — 299 EUR
- Business — 599 EUR
- Pro — 999 EUR
- Pagal poreikius — individuali kaina

Fiksuotų paketų kainos yra patvirtinamos backend faile `server/config/webServicePlans.js`; frontend siunčia tik pasirinkto paketo ID.

Užsakymo srautas:

`web.stilloak-studio.com` → `/api/web-service-requests` → MongoDB → `stilloak-studio.com/admin/web-orders`.

## Lokalios komandos

```powershell
cd web-services
npm install
npm run dev
```

Vite dev serveris pagal nutylėjimą veiks `http://localhost:5173`.

## Patikros

```powershell
cd web-services
npm run lint
npm run typecheck
npm run build
```

Šias patikras taip pat automatiškai vykdo GitHub Actions `Stilloak CI`, todėl kasdieniam darbui lokalus kompiuteris nėra būtinas.

## Aplinkos kintamieji

Kopijuokite `.env.example` į lokalią `.env.local` tik jei reikia lokalaus testavimo.

```text
VITE_API_URL=
VITE_WEB_LEAD_ENDPOINT=
VITE_WEB_CONTACT_EMAIL=hello@stilloak-studio.com
```

Rekomenduojama cloud aplinkoje nustatyti `VITE_API_URL` į pagrindinio Stilloak backend `/api` adresą. `VITE_WEB_LEAD_ENDPOINT` naudojamas tik kaip tiesioginis override.

Jei nei vienas API adresas nenustatytas, forma nerodo netikro sėkmingo išsiuntimo ir pasiūlo susisiekti el. paštu.

## Vercel

`web.stilloak-studio.com` turi būti atskiras Vercel projektas, nors kodas lieka tame pačiame GitHub repository.

Kuriant projektą:

- Git repository: `Rokasberr/manoshop-lite`
- Framework Preset: `Vite`
- Root Directory: `web-services`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Production branch: `main`
- Production domain: `web.stilloak-studio.com`

Vercel environment variables:

- `VITE_API_URL` — pagrindinio Stilloak backend `/api` URL
- `VITE_WEB_CONTACT_EMAIL` — viešas Stilloak Web kontaktinis el. paštas

Backend CORS `CLIENT_URL` sąraše turi būti leidžiamas ir `https://web.stilloak-studio.com`.

Production deploy šiame repository autonomiškai nevykdomas.
