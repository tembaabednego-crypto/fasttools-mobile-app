# FastTools Mobile App (PWA + Backend)

Your app now includes frontend + backend to support real conversion flow.

## Included now

- UI based on your design
- PWA support for Android/iPhone browser install
- Conversion workflow wired to backend API
- Backend file processing:
  - Image compression (local)
  - Audio cutting (local)
  - PDF to Word (CloudConvert API)
- Analytics and error tracking endpoints
- Newsletter subscription backend
- AdSense units embedded in UI
- Sentry browser error tracking integration
- Capacitor wrapper config for Android/iOS
- Dark mode support (system auto + manual toggle)

## Project structure

- `index.html`, `styles.css`, `app.js` - frontend
- `backend/app/main.py` - API server
- `backend/app/services/conversion_service.py` - conversion logic
- `backend/app/services/analytics_service.py` - analytics/error DB logging

## Run frontend

Serve this folder with any static server and open in browser.

Before production, edit `config.js`:

- `FASTTOOLS_API_BASE`
- `FASTTOOLS_SENTRY_DSN`
- `FASTTOOLS_GA_MEASUREMENT_ID` (for Google Analytics traffic tracking)
- `FASTTOOLS_ADS.client`
- `FASTTOOLS_ADS.slots.*`

## Run backend

Follow steps in `backend/README.md`.

## Ads

AdSense units are now added in the layout. Replace placeholder IDs in:

- `index.html` (client + slot defaults)
- `config.js` (runtime override values)

Use:

- AdSense for web/PWA
- AdMob when wrapping as native app for stores

## Sentry

Frontend:

- Set `window.FASTTOOLS_SENTRY_DSN` in `config.js`

Backend:

- Set `SENTRY_DSN` in `backend/.env`

## Capacitor (Android + iOS app packaging)

After Node is installed:

1. `npm install`
2. `npx cap add android`
3. `npx cap add ios`
4. `npx cap sync`
5. `npx cap open android` or `npx cap open ios`

Config file:

- `capacitor.config.json`

## Infrastructure templates

- `NGINX.conf.example` - reverse proxy + static hosting starter config
- `.github/workflows/deploy.yml` - CI check + GitHub Pages deploy
- `TRADEMARK_READY.md` - brand/trademark launch checklist

## Brand icon pack

Generated brand icons are available in `assets/`:

- `favicon-32.png`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `logo.svg` and `wordmark.svg` (vector originals)
