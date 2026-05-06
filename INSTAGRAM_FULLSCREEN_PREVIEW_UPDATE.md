# Instagram Fullscreen Preview Update

## What Changed

- Refined the generated image preview into a true full-screen lightbox for desktop and mobile.
- Added focus handling so the close button receives focus when the modal opens and focus returns to the trigger after closing.
- Added click/tap zoom for generated images inside the full-screen preview.
- Added a mobile bottom action bar with `Zoom` / `Fit screen` and `Download` actions.
- Kept existing image generation, download, captions, recent posts, and admin API behavior unchanged.

## Files Modified

- `client/src/pages/admin/InstagramGeneratorPage.jsx`
- `client/src/components/admin-dashboard/AdminDashboardOverview.jsx`
- `INSTAGRAM_FULLSCREEN_PREVIEW_UPDATE.md`

## How The Full-Screen Preview Works

After an image is generated, the preview image and `Open full screen` button both open a fixed full-screen dialog. The dialog uses a dark premium backdrop, centers the generated image, preserves aspect ratio, and prevents background scrolling while open.

The modal closes by:

- pressing the close `X` button
- clicking outside the image
- pressing `Escape`

## Desktop Behavior

- The modal fills the viewport with safe margins.
- The generated image scales to the largest size that fits the visible area.
- The close control sits in the top action bar.
- JPG download remains available in the top action bar.
- Clicking the image toggles a slightly zoomed view for inspection.

## Mobile Behavior

- The modal uses `100dvh` so it fits mobile browser viewports more reliably.
- The image remains centered and contained by default.
- Large tap targets are used for close and bottom actions.
- A bottom action bar provides `Zoom` / `Fit screen` and `Download`.
- The zoomed state allows scrollable inspection without cutting off controls.

## Admin Generator Link

The admin dashboard includes an admin-only card linking to:

`/admin/instagram-generator`

Card copy:

- Title: `Instagram generator`
- Description: `Generate branded Stilloak Studio Instagram posts`
- Button: `Open generator`

## QA

- `npm run build` passed.
- `npm run lint` passed.
- `npm test` passed.
- Build still reports the existing Vite large chunk warning.
