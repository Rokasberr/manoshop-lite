# ManoShop Lite

Premium e-commerce projektas su atskiru `React + Vite` frontend ir `Node.js + Express + MongoDB` backend, Stripe mokėjimais, admin panel ir PDF sąskaitomis.

## Architektūra

```text
/client    -> Vite frontend (Vercel)
/server    -> Express API (Render)
/database  -> MongoDB seed/connect failai
```

## Kas jau veikia

- JWT autentifikacija su `customer` ir `admin`
- Produktų CRUD admin dalyje
- Krepšelis, checkout ir užsakymai
- Stripe product checkout
- Stripe subscription checkout
- PDF sąskaitos
- Refund / cancel payment admin pusėje
- MongoDB Atlas integracija

## Lokalinis paleidimas

1. Įrašyk priklausomybes:

```bash
npm install
```

2. Susikurk env failus pagal pavyzdžius:

- [server/.env.example](/C:/Users/User/Documents/New project/server/.env.example)
- [client/.env.example](/C:/Users/User/Documents/New project/client/.env.example)

3. Jei nori demo duomenų:

```bash
npm run seed
```

4. Paleisk development režimu:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Deploy planas

Rekomenduojamas variantas:

- Frontend: `Vercel`
- Backend: `Render`
- DB: `MongoDB Atlas`
- Domenai:
  - `www.manoshop.lt` -> frontend
  - `api.manoshop.lt` -> backend

## 1. Backend deploy į Render

Repo jau turi [render.yaml](/C:/Users/User/Documents/New project/render.yaml), todėl greičiausias kelias:

1. Push’ink repo į `GitHub`.
2. Render dashboard’e rinkis `New -> Blueprint`.
3. Nurodyk šitą repo.
4. Render perskaitys `render.yaml` ir sukurs `manoshop-api` web service.
5. Per pirmą setup įvesk secret env reikšmes, kurioms pažymėta `sync: false`.

Svarbiausi backend env:

- `MONGO_URI`
- `CLIENT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Papildomai:

- `JWT_SECRET` generuojamas automatiškai per `render.yaml`
- `PORT=10000` ir `NODE_ENV=production` nustatyti blueprint’e

### Render env rekomendacija

`CLIENT_URL` pirmą reikšmę laikyk pagrindiniu produkciniu frontend adresu.

Pavyzdys:

```env
CLIENT_URL=https://www.manoshop.lt,https://manoshop-frontend.vercel.app,https://*.vercel.app
```

Tai svarbu, nes:

- CORS dabar palaiko kelis origin’us
- palaikomi wildcard preview domenai
- Stripe redirect srautai grįžta į pirmą pagrindinį frontend URL, jei origin nėra tiksliai žinomas

### MongoDB Atlas pastaba

Jei backend po deploy negalės prisijungti prie Atlas, Atlas pusėje patikrink `IP Access List`.

Greitas variantas:

- pridėti `0.0.0.0/0`

Saugesnis variantas:

- susiaurinti prieigą pagal tavo infrastruktūros poreikį

## 2. Frontend deploy į Vercel

Repo jau turi [client/vercel.json](/C:/Users/User/Documents/New project/client/vercel.json), kuris užtikrina SPA route fallback React Router puslapiams.

Vercel žingsniai:

1. `Add New Project`
2. Importuok tą patį repo
3. `Root Directory` nustatyk į `client`
4. Framework preset palik `Vite`
5. Environment variable:

```env
VITE_API_URL=https://manoshop-api.onrender.com/api
```

6. Deploy

Po to Vercel duos URL, pvz.:

```text
https://manoshop-frontend.vercel.app
```

Jį pridėk ir į Render `CLIENT_URL`.

## 3. Stripe webhook produkcijoje

Kai backend jau turi savo viešą Render URL arba custom domain, Stripe dashboard’e susikurk produkcinį webhook endpointą:

```text
https://api.manoshop.lt/api/billing/webhook
```

arba laikinai:

```text
https://manoshop-api.onrender.com/api/billing/webhook
```

Rekomenduojami event’ai šitam projektui:

- `checkout.session.completed`
- `checkout.session.expired`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Gautą `Signing secret` įrašyk į:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 4. Custom domain

Kai abu deploy’ai veikia:

1. Vercel pridėk `www.manoshop.lt`
2. Render pridėk `api.manoshop.lt`
3. DNS pusėje nukreipk:
   - `www` -> Vercel
   - `api` -> Render

Po to atnaujink env:

Frontend:

```env
VITE_API_URL=https://api.manoshop.lt/api
```

Backend:

```env
CLIENT_URL=https://www.manoshop.lt,https://manoshop-frontend.vercel.app,https://*.vercel.app
```

## 5. Produkcinis checklist

- `MongoDB Atlas` prijungtas
- `Render` backend health veikia per `/api/health`
- `Vercel` frontend rodo visus route’us be 404
- `Stripe Secret Key` yra produkcinė arba testinė pagal tavo aplinką
- `Stripe Webhook Secret` įrašytas iš produkcinio webhook endpointo
- `CLIENT_URL` rodo tikrus frontend origin’us
- `VITE_API_URL` rodo tikrą backend `/api` adresą

## Demo admin

Po `npm run seed`:

- El. paštas: `admin@manoshop.lt`
- Slaptažodis: `Admin123!`
