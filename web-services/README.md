# Stilloak Web services site

Atskira React + Vite + TypeScript aplikacija svetainei `https://web.stilloak-studio.com`.

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

## Aplinkos kintamieji

Kopijuokite `.env.example` į lokalią `.env.local`, jei reikia testuoti užklausų siuntimą.

```text
VITE_WEB_LEAD_ENDPOINT=
VITE_WEB_CONTACT_EMAIL=hello@stilloak-studio.com
```

Jei `VITE_WEB_LEAD_ENDPOINT` nenustatytas, kontaktų forma nerodo netikro sėkmingo išsiuntimo ir pasiūlo susisiekti el. paštu.

## Vercel

Kuriant atskirą Vercel projektą:

- Framework Preset: `Vite`
- Root Directory: `web-services`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Production domenas: `https://web.stilloak-studio.com`.

Production deploy šiame repository autonomiškai nevykdomas.
