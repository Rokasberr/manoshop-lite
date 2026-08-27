# Stilloak Web Orders V1

## Srautas

`web.stilloak-studio.com` → `POST /api/web-service-requests` → MongoDB `WebServiceRequest` → `/admin/web-orders`.

## Paketai

- Start — 299 EUR
- Business — 599 EUR
- Pro — 999 EUR
- Pagal poreikius — individuali kaina

Fiksuotų paketų bazinė kaina nustatoma tik backend `server/config/webServicePlans.js`. Kliento payload negali pakeisti bazinės kainos.

## Production aplinkos reikalavimai

- `web-services` turi turėti `VITE_API_URL` su pagrindinio backend `/api` adresu arba tiesioginį `VITE_WEB_LEAD_ENDPOINT`.
- Backend `CLIENT_URL` CORS sąraše turi leisti `https://web.stilloak-studio.com` kartu su pagrindiniu Stilloak frontend origin.
- Tik admin rolė gali skaityti ir redaguoti Web užsakymus.
- Viešas užsakymo POST turi 5 užklausų / 15 min. IP rate limitą ir honeypot patikrą.

## Patikros

GitHub Actions `Stilloak CI` tikrina:

- core: install, lint, typecheck, tests, build;
- web-services: install, lint, typecheck, build.

Production deploy, production MongoDB ir realių paslapčių ši šaka nekeičia.
