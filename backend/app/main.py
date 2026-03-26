import os
from pathlib import Path
from typing import Any, Dict

import sentry_sdk
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr

from .config import settings
from .services.analytics_service import AnalyticsService
from .services.conversion_service import ConversionService


load_dotenv()

if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn, traces_sample_rate=0.2)


class TrackPayload(BaseModel):
    eventName: str
    payload: Dict[str, Any] = {}


class ClientErrorPayload(BaseModel):
    message: str
    stack: str = ""
    context: Dict[str, Any] = {}


class SubscribePayload(BaseModel):
    email: EmailStr


app = FastAPI(title="FastTools API", version="1.0.0")
analytics = AnalyticsService()
converter = ConversionService(settings.cloudconvert_api_key)

origins = [origin.strip() for origin in settings.allowed_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/track")
def track(payload: TrackPayload) -> Dict[str, bool]:
    analytics.track(payload.eventName, payload.payload)
    return {"success": True}


@app.post("/api/client-error")
def client_error(payload: ClientErrorPayload) -> Dict[str, bool]:
    analytics.track_error(payload.message, payload.stack, payload.context)
    if settings.sentry_dsn:
        sentry_sdk.capture_message(payload.message)
    return {"success": True}


@app.post("/api/subscribe")
def subscribe(payload: SubscribePayload) -> Dict[str, bool]:
    analytics.save_subscription(payload.email)
    analytics.track("subscribe", {"email": payload.email})
    return {"success": True}


@app.post("/api/convert")
async def convert(
    file: UploadFile = File(...),
    tool: str = Form(...),
    quality: str = Form("75"),
    start: str = Form("0"),
    end: str = Form("10"),
) -> FileResponse:
    try:
        file_bytes = await file.read()
        options = {"quality": quality, "start": start, "end": end}
        output_path = converter.convert(tool, file.filename or "upload.bin", file_bytes, options)
        analytics.track("convert_success", {"tool": tool, "file": file.filename})
        media_type = "application/octet-stream"
        if output_path.suffix == ".docx":
            media_type = (
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
        elif output_path.suffix == ".jpg":
            media_type = "image/jpeg"
        elif output_path.suffix == ".mp3":
            media_type = "audio/mpeg"

        return FileResponse(
            path=str(output_path),
            media_type=media_type,
            filename=output_path.name,
        )
    except Exception as exc:
        analytics.track("convert_failed", {"tool": tool, "error": str(exc)})
        if settings.sentry_dsn:
            sentry_sdk.capture_exception(exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/storage-info")
def storage_info() -> Dict[str, Any]:
    base = Path(__file__).resolve().parent.parent / "storage"
    uploads = base / "uploads"
    outputs = base / "outputs"
    return {
        "uploadsCount": len(list(uploads.glob("*"))),
        "outputsCount": len(list(outputs.glob("*"))),
        "cwd": os.getcwd(),
    }
