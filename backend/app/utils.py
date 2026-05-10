"""
utils.py — Shared utility functions.

Password hashing is kept here for reference, but since auth is now
fully delegated to Supabase Auth, these functions are NOT used in
production flows. They remain useful for:
  - Unit tests that need to verify password logic independently.
  - Any future local-auth fallback if Supabase Auth is disabled.
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Return the bcrypt hash of a plaintext password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# Legacy aliases so any old imports don't break immediately
hash   = hash_password    # noqa: A001
verify = verify_password
