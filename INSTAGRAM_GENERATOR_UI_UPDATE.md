# Instagram Generator UI Update

## What Changed

- Added a full-screen preview lightbox for generated Instagram images.
- Added an admin dashboard shortcut card for the Instagram generator.
- Improved the generator preview area with clearer spacing, click-to-preview behavior, and an `Open full screen` action near the download buttons.

## Files Modified

- `client/src/pages/admin/InstagramGeneratorPage.jsx`
- `client/src/components/admin-dashboard/AdminDashboardOverview.jsx`
- `INSTAGRAM_GENERATOR_UI_UPDATE.md`

## Full-Screen Preview

Generated image previews are now clickable. Clicking the image or the `Open full screen` button opens a fixed full-screen lightbox with a darkened, blurred backdrop.

The lightbox can be closed by:

- clicking the `X` button
- clicking the dark backdrop
- pressing `ESC`

The image is centered and constrained with `max-width` and `max-height` so it fits cleanly on desktop and mobile. The modal content area allows overflow scrolling for zoom-friendly inspection.

## Admin Button Location

The admin dashboard now shows an admin-only `Instagram generator` card below the metric cards. It links to:

`/admin/instagram-generator`
