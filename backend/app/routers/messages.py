"""messages.py — Community chat board endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import List

from ..database import get_supabase_anon, get_supabase
from .. import schemas, oauth2

router = APIRouter(tags=["Messages"])


@router.get("/messages", response_model=List[schemas.MessageOut])
def get_messages(
    limit: int = Query(50, ge=1, le=200),
    supabase: Client = Depends(get_supabase_anon),
):
    """Return the latest community chat messages, oldest-first."""
    try:
        response = (
            supabase.table("messages")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data[::-1]  # reverse → oldest first for display
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/messages", response_model=schemas.MessageOut, status_code=status.HTTP_201_CREATED)
def create_message(
    body: schemas.MessageCreate,
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Post a new message to the community chat."""
    try:
        username = (
            current_user.user_metadata.get("display_name")
            or current_user.email.split("@")[0]
        )
        response = (
            supabase.table("messages")
            .insert({
                "user_id":  str(current_user.id),
                "username": username,
                "content":  body.content.strip(),
            })
            .execute()
        )
        return response.data[0]
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: str,
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Delete own message by ID."""
    try:
        response = (
            supabase.table("messages")
            .delete()
            .eq("id", message_id)
            .eq("user_id", str(current_user.id))
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found or not yours")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))