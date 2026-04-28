# Projekto Valdymo Atmintinė

Trumpas dokumentas, kaip toliau valdyti `Mano Atelier / ManoShop Lite` projektą po paleidimo.

## Gyvi adresai

- Frontend: `https://manoshop-lite-client.vercel.app`
- Backend API: `https://manoshop-api.onrender.com`
- Health check: `https://manoshop-api.onrender.com/api/health`

## Kur kas valdomas

- Frontend deploy: `Vercel`
- Backend deploy: `Render`
- Duomenų bazė: `MongoDB Atlas`
- Mokėjimai: `Stripe`
- Kodas: `GitHub`

## Kas vyksta po `git push`

- `Vercel` automatiškai perdeployina frontend iš `main`
- `Render` automatiškai perdeployina backend iš `main`

Jei po `push` kažkas neužsikrauna:
- patikrink `Vercel -> Deployments`
- patikrink `Render -> manoshop-api -> Events / Logs`

## Kaip atnaujinti projektą

1. Lokaliai pakeiti kodą
2. Pasitikrini lokaliai:

```bash
npm run dev
```

3. Įkeli į GitHub:

```bash
git add .
git commit -m "Trumpas pakeitimo aprašas"
git push
```

4. Palauki automatinio deploy

## Svarbiausi env kintamieji

### Vercel

- `VITE_API_URL`

Dabartinė reikšmė:

```env
VITE_API_URL=https://manoshop-api.onrender.com/api
```

### Render

- `CLIENT_URL`
- `MONGO_URI`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Rekomenduojamas `CLIENT_URL` formatas:

```env
https://manoshop-lite-client.vercel.app,https://*.vercel.app,http://127.0.0.1:5173,http://localhost:5173
```

## Jei neveikia registracija ar login

Dažniausia priežastis:
- blogas `CLIENT_URL` Render pusėje

Ką daryti:
1. `Render -> manoshop-api -> Environment`
2. patikrink `CLIENT_URL`
3. išsaugok
4. `Manual Deploy`

## Jei neveikia Stripe mokėjimas

Patikrink:

1. `Render -> STRIPE_SECRET_KEY`
   Turi būti `sk_test_...` arba `sk_live_...`
   Negali būti `pk_test_...`

2. `Render -> STRIPE_WEBHOOK_SECRET`
   Turi būti tikras `whsec_...` iš Stripe Dashboard webhook endpointo

3. Stripe webhook endpoint:

```text
https://manoshop-api.onrender.com/api/billing/webhook
```

4. Stripe eventai:
- `checkout.session.completed`
- `checkout.session.expired`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## Jei Render backend neužsikuria

Dažniausios priežastys:

- `MongoDB Atlas` neleidžia prisijungimo
- blogas `MONGO_URI`
- neteisingi Stripe env

Ką tikrinti:

1. `Render -> Logs`
2. `MongoDB Atlas -> Network Access`
3. `MongoDB Atlas -> Database Access`

## Jei frontend nepasiekia backend

Patikrink:

1. ar veikia:
```text
https://manoshop-api.onrender.com/api/health
```

2. ar Vercel `VITE_API_URL` yra:
```text
https://manoshop-api.onrender.com/api
```

3. ar `Render CLIENT_URL` leidžia tavo frontend origin

## Saugumo priežiūra

Jei slapti raktai buvo rodyti ekrane ar pokalbiuose:

1. pasikeisk `STRIPE_SECRET_KEY`
2. pasikeisk `MongoDB Atlas` DB vartotojo slaptažodį
3. atnaujink `Render` env reikšmes
4. redeployink backend

Niekada nekišk į GitHub:

- `.env`
- slaptažodžių
- `sk_test_...`, `sk_live_...`
- `whsec_...`
- `MONGO_URI` su tikru slaptažodžiu

## Custom domain planas

Jei prijungsi domeną:

- frontend: `www.manoshop.lt`
- backend: `api.manoshop.lt`

Tada reikės:

### Vercel

```env
VITE_API_URL=https://api.manoshop.lt/api
```

### Render

```env
CLIENT_URL=https://www.manoshop.lt,https://manoshop.lt
```

### Stripe

Naujas webhook endpoint:

```text
https://api.manoshop.lt/api/billing/webhook
```

Ir naujas `whsec_...` Render pusėje.

## Greitas tikrinimo checklist po kiekvieno didesnio pakeitimo

Patikrink:

1. atsidaro homepage
2. veikia registracija
3. veikia login
4. veikia `/shop`
5. veikia admin prisijungimas
6. veikia produkto checkout
7. veikia Stripe success puslapis
8. užsakymas matomas profilyje
9. užsakymas matomas admin panelėje
10. parsisiunčia PDF sąskaita

## Kur žiūrėti klaidas

- Frontend deploy klaidos: `Vercel -> Deployments`
- Backend deploy klaidos: `Render -> Events / Logs`
- DB klaidos: `MongoDB Atlas`
- Mokėjimų klaidos: `Stripe -> Events / Webhooks / Payments`

## Rekomendacija toliau

Jei projektas bus naudojamas realiai:

1. prijunk custom domain
2. pasikeisk visus testinius raktus į produkcinius
3. padaryk galutinį saugumo cleanup
4. kartą per laiką pratestuok pilną pirkimo srautą nuo pradžios iki galo
