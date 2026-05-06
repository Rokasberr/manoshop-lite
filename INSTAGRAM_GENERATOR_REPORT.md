# Instagram Generator Report

## How It Works

The admin Instagram generator adds a protected workspace at `/admin/instagram-generator`. The React admin page sends validated post content to the Express admin API, and the server renders branded SVG templates into real image files with `sharp`.

Generated assets are saved under:

`server/generated/instagram`

That folder is ignored by git because generated Instagram images are runtime artifacts.

## Files Changed

- `client/src/App.jsx` - registers `/admin/instagram-generator`.
- `client/src/components/admin-dashboard/AdminShell.jsx` - adds the Instagram admin nav item.
- `client/src/pages/admin/InstagramGeneratorPage.jsx` - premium admin generator UI, presets, preview, caption, download, recent list.
- `client/src/services/instagramPostService.js` - authenticated generator, recent, preview, and download API client.
- `server/config/stilloakBrandConfig.js` - central brand config for image generation.
- `server/services/instagramPostGeneratorService.js` - validation, captions, SVG templates, sharp rendering, safe file lookup.
- `server/controllers/instagramPostController.js` - admin controller actions.
- `server/routes/adminRoutes.js` - admin-protected Instagram routes and rate limit.
- `server/tests/adminRoutes.test.js` - route coverage.
- `server/tests/instagramPostGeneratorService.test.js` - validation, filename, and caption coverage.
- `server/package.json` / `package-lock.json` - adds `sharp`.
- `.gitignore` - ignores generated image outputs.

## Routes Added

- `POST /api/admin/instagram-posts/generate`
- `GET /api/admin/instagram-posts/recent`
- `GET /api/admin/instagram-posts/download/:filename`

All routes run behind the existing `protect` and `adminOnly` middleware. The generation endpoint also has a per-admin rate limit.

## Supported Formats

- Square feed post: `1080x1080`
- Portrait feed post: `1080x1350`
- Story/Reel: `1080x1920`

## Supported Templates

- `template-brand-intro`
- `template-plan`
- `template-comparison`
- `template-faq`
- `template-cta`

## How To Generate Posts

1. Sign in as an admin.
2. Open `/admin/instagram-generator`.
3. Choose a preset or fill the form fields.
4. Select a format and output file type.
5. Click `Generate Instagram post`.
6. Preview the generated image and use the download buttons.

If PNG is selected, the server creates a PNG plus the default JPG download.

## How To Download JPG

Use the `Download JPG` button after generation, or download a JPG from the recent generated posts list. The frontend fetches files through the authenticated admin download route, so the generated folder is not exposed as public static storage.

## Recommended Instagram Upload Sizes

- Square feed: `1080x1080`
- Portrait feed: `1080x1350`
- Story/Reel: `1080x1920`

The templates keep generous safe margins for profile-grid cropping and story UI overlays.

## Future Improvements

- Store generated post metadata in MongoDB for richer search and reuse.
- Add thumbnail previews to the recent list.
- Add scheduled campaign batches.
- Add custom font embedding for exact typography parity across hosting environments.
- Add template-level visual controls for accent intensity and feature row style.
