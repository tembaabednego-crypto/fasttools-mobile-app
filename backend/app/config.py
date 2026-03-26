import os
from dataclasses import dataclass


@dataclass
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "*")
    cloudconvert_api_key: str = os.getenv("CLOUDCONVERT_API_KEY", "")
    sentry_dsn: str = os.getenv("SENTRY_DSN", "")


settings = Settings()
