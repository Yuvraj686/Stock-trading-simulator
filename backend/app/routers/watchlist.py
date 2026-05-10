"""watchlist.py — Add / remove / list stocks on the user's watchlist."""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import List
from uuid import UUID

from ..database import get_supabase
from .. import schemas, oauth2

router = APIRouter(tags=["Watchlist"])


@router.get("/watchlist", response_model=List[schemas.WatchlistItemOut])
def get_watchlist(
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Return all stocks on the current user's watchlist with live prices."""
    try:
        rows = (
            supabase.table("watchlist")
            .select("id, stock_id, added_at, stocks(symbol, name, sector, current_price, prev_close)")
            .eq("user_id", str(current_user.id))
            .order("added_at", desc=True)
            .execute()
        )
        result = []
        for item in rows.data:
            stock = item["stocks"]
            result.append({
                "id":            item["id"],
                "stock_id":      item["stock_id"],
                "symbol":        stock["symbol"],
                "name":          stock["name"],
                "sector":        stock["sector"],
                "current_price": stock["current_price"],
                "prev_close":    stock.get("prev_close"),
                "added_at":      item["added_at"],
            })
        return result
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/watchlist", response_model=schemas.WatchlistItemOut, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    body: schemas.WatchlistAddRequest,
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Add a stock to the user's watchlist. Silently succeeds if already present."""
    try:
        # Verify stock exists
        stock_resp = (
            supabase.table("stocks")
            .select("id, symbol, name, sector, current_price, prev_close")
            .eq("id", str(body.stock_id))
            .execute()
        )
        if not stock_resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock not found")
        stock = stock_resp.data[0]

        # Upsert watchlist row (ignore conflict)
        row_resp = (
            supabase.table("watchlist")
            .upsert(
                {"user_id": str(current_user.id), "stock_id": str(body.stock_id)},
                on_conflict="user_id,stock_id",
            )
            .execute()
        )
        row = row_resp.data[0]
        return {
            "id":            row["id"],
            "stock_id":      row["stock_id"],
            "symbol":        stock["symbol"],
            "name":          stock["name"],
            "sector":        stock["sector"],
            "current_price": stock["current_price"],
            "prev_close":    stock.get("prev_close"),
            "added_at":      row["added_at"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.delete("/watchlist/{stock_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(
    stock_id: UUID,
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Remove a stock from the user's watchlist."""
    try:
        response = (
            supabase.table("watchlist")
            .delete()
            .eq("user_id", str(current_user.id))
            .eq("stock_id", str(stock_id))
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock not in watchlist")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
