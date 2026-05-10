"""auth.py — Signup, Login, Logout endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from ..database import get_supabase_anon
from .. import schemas

router = APIRouter(tags=["Authentication"])


def _serialize_auth_response(response) -> dict:
    """
    Convert the supabase-py AuthResponse (dataclasses) into a plain dict
    that FastAPI can JSON-serialize and the frontend can consume.
    """
    user = response.user
    session = response.session

    user_dict = {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "confirmed_at": user.confirmed_at.isoformat() if user.confirmed_at else None,
        "last_sign_in_at": user.last_sign_in_at.isoformat() if user.last_sign_in_at else None,
        "user_metadata": user.user_metadata or {},
        "app_metadata": user.app_metadata or {},
    }

    session_dict = None
    if session:
        session_dict = {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "token_type": session.token_type,
            "expires_in": session.expires_in,
            "expires_at": session.expires_at,
        }

    return {"user": user_dict, "session": session_dict}


@router.post("/signup")
def signup(
    body: schemas.SignupRequest,
    supabase: Client = Depends(get_supabase_anon),
):
    """
    Register a new user with Supabase Auth.
    The `handle_new_user` DB trigger automatically creates a row in
    public.users with a default balance of 100,000.
    """
    try:
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "display_name": body.email.split("@")[0]
                }
            }
        })
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup failed. Check if email confirmation is required in Supabase.",
            )
        return _serialize_auth_response(response)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/login")
def login(
    body: schemas.LoginRequest,
    supabase: Client = Depends(get_supabase_anon),
):
    """Authenticate an existing user and return a Supabase session."""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        return _serialize_auth_response(response)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(supabase: Client = Depends(get_supabase_anon)):
    """Sign out the current session on the server side."""
    try:
        supabase.auth.sign_out()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))