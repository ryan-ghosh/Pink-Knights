# Images Directory

This directory contains static images for the application.

## Required Image

- **sky-bg.jpg** - Background image used in the app

## How to Add the Image

1. Place your background image file here as `sky-bg.jpg`
2. The image should be:
   - A sky/background image (suggested: 1920x1080 or similar)
   - JPG format
   - Optimized for web (compressed)

## Image Path

The image is referenced in the code as `/images/sky-bg.jpg`, which Next.js serves from `public/images/sky-bg.jpg`.

## Temporary Solution

If you don't have the image yet, the app will show a broken image icon. You can:
1. Use a placeholder service like `https://via.placeholder.com/1920x1080`
2. Download a free sky background from Unsplash or similar
3. Create a gradient background using CSS instead

## CSS Alternative

If you prefer not to use an image, you can replace the Image component with a CSS gradient in `app/page.tsx` and `app/signup/page.tsx`.
