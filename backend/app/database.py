"""
database.py — Supabase client initialisation.

Two clients are exposed:
  - supabase      : service-role client (backend-only, bypasses RLS)
  - supabase_anon : anon client (respects RLS, used for auth flows)

Both are singletons constructed once at import time so connections
are reused across requests.
"""

from supabase import create_client, Client
from .config import settings


# ── Service-role client (full DB access, never expose to frontend) ────────────
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,
)

# ── Anon client (honours RLS, safe for auth operations) ──────────────────────
supabase_anon: Client = create_client(
    settings.supabase_url,
    settings.supabase_anon_key,
)


def get_supabase() -> Client:
    """FastAPI dependency — returns the service-role Supabase client."""
    return supabase


def get_supabase_anon() -> Client:
    """FastAPI dependency — returns the anon Supabase client."""
    return supabase_anon
