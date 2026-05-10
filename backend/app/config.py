from pathlib import Path
from pydantic_settings import BaseSettings

# ── Path resolution ───────────────────────────────────────────────────────────
# This file lives at:  <project-root>/backend/app/config.py
# The single .env lives at: <project-root>/.env
# Parents: [0]=app  [1]=backend  [2]=project-root
ROOT_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT_DIR / ".env"


class Settings(BaseSettings):
    # ── Supabase ──────────────────────────────────────────────────────────────
    supabase_url:              str
    supabase_anon_key:         str
    supabase_service_role_key: str

    # ── JWT ───────────────────────────────────────────────────────────────────
    secret_key:                  str
    algorithm:                   str = "HS256"
    access_token_expire_minutes: int = 30

    # ── External APIs ─────────────────────────────────────────────────────────
    alpha_vantage_api_key: str = ""

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"

    model_config = {
        "env_file":          str(ENV_PATH),   # single source of truth
        "env_file_encoding": "utf-8",
        "extra":             "ignore",         # silently skip VITE_* and other frontend-only keys
    }


settings = Settings()
