"""users.py — Current user profile and balance endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from ..database import get_supabase
from .. import schemas, oauth2

router = APIRouter(tags=["Users"])


@router.get("/user", response_model=schemas.UserOut)
def get_current_user_profile(
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Return the authenticated user's profile including current balance."""
    try:
        response = (
            supabase.table("users")
            .select("*")
            .eq("id", str(current_user.id))
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/wallet")
def get_wallet(
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Return the user's current cash balance (from users.balance)."""
    try:
        response = (
            supabase.table("users")
            .select("id, balance, updated_at")
            .eq("id", str(current_user.id))
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        row = response.data[0]
        return {
            "user_id": row["id"],
            "balance": row["balance"],
            "updated_at": row["updated_at"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.patch("/user/display-name", response_model=schemas.UserOut)
def update_display_name(
    display_name: str,
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Update the user's display name."""
    if not display_name.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Display name cannot be empty")
    try:
        response = (
            supabase.table("users")
            .update({"display_name": display_name.strip()})
            .eq("id", str(current_user.id))
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
