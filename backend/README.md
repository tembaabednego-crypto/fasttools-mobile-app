# FastTools Backend API

This backend handles:

- Real conversion endpoints (PDF to Word, image compression, audio cutting)
- File upload and processing
- Analytics event tracking
- Frontend error tracking
- Newsletter subscriptions

## 1) Setup

1. Install Python 3.11+.
2. In `backend`, create `.env` from `.env.example`.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

## 2) Run API

From `backend` directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health URL:

- `http://localhost:8000/api/health`

## 3) Conversion tools

- `pdf_to_word`: Uses CloudConvert API (requires `CLOUDCONVERT_API_KEY`)
- `image_compress`: Local compression with Pillow
- `audio_cutter`: Local audio clipping with pydub/ffmpeg

## 4) Environment values

- `CLOUDCONVERT_API_KEY`: required for PDF to Word
- `SENTRY_DSN`: optional, enables Sentry server-side tracking
- `ALLOWED_ORIGINS`: comma-separated CORS origins

## 5) Frontend connection

In browser, frontend calls:

- `POST /api/convert`
- `POST /api/subscribe`
- `POST /api/track`
- `POST /api/client-error`

Default frontend API base is `http://localhost:8000`.
