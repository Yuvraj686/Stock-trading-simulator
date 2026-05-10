"""
oauth2.py — JWT / Supabase token verification dependency.

get_current_user validates the Bearer token sent by the frontend
(issued by Supabase Auth) and returns the Supabase user object.
All protected routes use `Depends(oauth2.get_current_user)`.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from .database import get_supabase

security = HTTPBearer(auto_error=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
):
    """
    Validate the Supabase JWT Bearer token.
    Returns the Supabase User object on success.
    Raises HTTP 401 on missing/invalid/expired token.
    """
    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
        if user_response is None or user_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_response.user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
