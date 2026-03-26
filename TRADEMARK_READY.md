# Trademark Ready Setup

This file is your final checklist to make the app ready for your trademark.

## 1) Set your brand values

Edit `config.js`:

- `FASTTOOLS_BRAND.name`
- `FASTTOOLS_BRAND.tagline`
- `FASTTOOLS_BRAND.description`
- `FASTTOOLS_BRAND.primaryColor`
- `FASTTOOLS_BRAND.primaryColorDark`
- `FASTTOOLS_BRAND.logoUrl`
- `FASTTOOLS_BRAND.copyright`
- `FASTTOOLS_BRAND.legalCompanyName`

These values now auto-update:

- Header brand name
- Tagline
- Browser title
- Meta description
- Theme color
- Footer copyright
- Main blue theme colors

## 2) Set package/app identity

Update:

- `capacitor.config.json`:
  - `appId` (must be unique and final)
  - `appName`
- `manifest.json`:
  - `name`
  - `short_name`
  - `description`

## 3) Add your trademark assets

- Prebuilt brand logo files are now included:
  - `assets/logo.svg` (icon/app mark)
  - `assets/wordmark.svg` (logo + brand text)
- `config.js` already points to `./assets/logo.svg`.
- If you replace the logo later, keep the same file name or update `logoUrl`.

## 4) Legal pages

Before release, add real content and links for:

- Privacy Policy
- Terms of Service
- Trademark notice
- Contact details: `+255698690722`

## 5) Ads and analytics under your brand

- Set your AdSense/AdMob IDs in `config.js`.
- Set `FASTTOOLS_GA_MEASUREMENT_ID` in `config.js` for website traffic analytics.
- Set your Sentry DSN in `config.js` and backend `.env`.
- Confirm all tracking dashboards show your final app name.

## 6) Store listing consistency

Use identical branding across:

- App icon
- App name
- Store screenshots
- Store descriptions
- Website domain

## 7) Final trademark-safe go live

- [ ] Brand name exactly matches your trademark spelling
- [ ] Logo is your final approved mark
- [ ] Colors are official brand palette
- [ ] App ID/BUNDLE ID is final and unique
- [ ] Legal pages include trademark owner entity
- [ ] Domain and store listing use same trademark

Note: This is a technical readiness checklist, not legal advice. For formal registration/compliance in your country, confirm with a trademark professional.
