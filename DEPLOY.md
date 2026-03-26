# FastTools Production Deploy Checklist

Use this checklist to launch FastTools as a real product.

---

## 1) Local prerequisites

- Install **Python 3.11+**
- Install **Node.js LTS**
- Install **Git** (recommended)
- For Android release: install **Android Studio**
- For iOS release: use **macOS + Xcode**

---

## 2) Configure environment

### Frontend config

Edit `config.js`:

- `window.FASTTOOLS_API_BASE` -> your backend URL (example: `https://api.fasttools.app`)
- `window.FASTTOOLS_SENTRY_DSN` -> your Sentry frontend DSN
- `window.FASTTOOLS_GA_MEASUREMENT_ID` -> your GA4 measurement ID (example: `G-XXXXXXXXXX`)
- `window.FASTTOOLS_ADS.client` -> your AdSense publisher ID
- `window.FASTTOOLS_ADS.slots.*` -> your real AdSense ad slot IDs
- Theme mode:
  - Auto uses system preference
  - Users can switch using the top `Dark Mode` button
  - Preference is saved locally

### Backend config

Copy `backend/.env.example` to `backend/.env`, then set:

- `APP_ENV=production`
- `ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- `CLOUDCONVERT_API_KEY=...`
- `SENTRY_DSN=...` (optional, recommended)

---

## 3) Run backend in production

From `backend/`:

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Production recommendation:

- Put backend behind **Nginx/Caddy**
- Enable **HTTPS**
- Add process manager (**systemd**, **supervisor**, or **docker**)
- Use `NGINX.conf.example` as your starter server config

Health check:

- `GET /api/health`

---

## 4) Deploy frontend (PWA)

Deploy `fasttools-mobile-app` static files to one of:

- Netlify
- Vercel
- Cloudflare Pages
- GitHub Pages (if backend is external and CORS is configured)

After deploy:

- Open website on phone
- Add to home screen (PWA install)
- Verify service worker and offline behavior

---

## 5) Ads setup (AdSense + AdMob)

### AdSense (web/PWA)

- Create site in Google AdSense
- Verify domain ownership
- Replace placeholder ad client + slots in `config.js`
- Confirm ads are serving on production domain

### AdMob (native Android/iOS wrapper)

- Create Android/iOS apps in AdMob
- Add real AdMob IDs in native integration
- Use test ads before release
- Switch to production ad IDs before publishing

---

## 6) Error tracking & analytics

- Create Sentry project(s): `frontend`, `backend`
- Set:
  - Frontend DSN in `config.js`
  - Backend DSN in `backend/.env`
- Trigger a test error and verify it appears in Sentry
- Verify events are stored in backend SQLite (`backend/storage/analytics.db`)

---

## 7) Android release (Play Store)

From project root:

```bash
npm install
npx cap add android
npx cap sync
npx cap open android
```

In Android Studio:

- Set package name: `com.fasttools.app` (or your final ID)
- Update app icon, name, version code, version name
- Build signed **AAB**
- Upload to Play Console internal testing first
- Run tests, then publish to production

---

## 8) iOS release (App Store)

From macOS:

```bash
npm install
npx cap add ios
npx cap sync
npx cap open ios
```

In Xcode:

- Set bundle identifier
- Configure signing/team
- Update app icons, launch screen, version/build
- Archive and upload via Xcode Organizer
- Submit in App Store Connect

---

## 9) Security and reliability checks

- Enforce HTTPS on frontend + backend
- Restrict `ALLOWED_ORIGINS` (do not keep `*` in production)
- Add file size limits for uploads
- Add cleanup job for old files in `backend/storage/uploads` and `outputs`
- Add basic rate limiting on conversion endpoint

---

## 10) Final go-live checklist

- [ ] Frontend production URL works on Android + iPhone
- [ ] Dark mode toggle works and saved preference persists
- [ ] Backend health endpoint is stable
- [ ] PDF to Word works with CloudConvert key
- [ ] Image compression works
- [ ] Audio cutting works
- [ ] AdSense ads load
- [ ] Sentry captures test errors
- [ ] Analytics events recorded
- [ ] Play Store build passes internal test
- [ ] App Store build passes TestFlight test

---

## Optional next improvements

- Move analytics from SQLite to PostgreSQL
- Add job queue for heavy conversions (RQ/Celery)
- Add user upload limits and abuse protection
- Add admin dashboard for analytics and failures
- Use `.github/workflows/deploy.yml` for CI + Pages deploy
