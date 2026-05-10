"""stocks.py — Stock listing and price history endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client
from typing import List, Optional

from ..database import get_supabase_anon, get_supabase
from .. import schemas, oauth2

router = APIRouter(tags=["Stocks"])


@router.get("/stocks", response_model=List[schemas.StockOut])
def get_stocks(
    sector: Optional[str] = Query(None, description="Filter by sector"),
    supabase: Client = Depends(get_supabase_anon),
):
    """Return all active stocks, optionally filtered by sector."""
    try:
        query = supabase.table("stocks").select("*").eq("is_active", True)
        if sector:
            query = query.eq("sector", sector)
        response = query.order("symbol").execute()
        return response.data
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/stocks/{symbol}", response_model=schemas.StockOut)
def get_stock(symbol: str, supabase: Client = Depends(get_supabase_anon)):
    """Return a single stock by its ticker symbol (case-insensitive)."""
    try:
        response = (
            supabase.table("stocks")
            .select("*")
            .eq("symbol", symbol.upper())
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Stock '{symbol}' not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/stocks/{symbol}/history", response_model=List[schemas.PriceHistoryOut])
def get_price_history(
    symbol: str,
    interval: str = Query("daily", description="Candle interval: daily, 1min, 5min"),
    limit: int = Query(30, ge=1, le=365),
    supabase: Client = Depends(get_supabase_anon),
):
    """Return OHLCV price history for a stock."""
    try:
        # First get the stock id
        stock_resp = (
            supabase.table("stocks")
            .select("id")
            .eq("symbol", symbol.upper())
            .execute()
        )
        if not stock_resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Stock '{symbol}' not found")

        stock_id = stock_resp.data[0]["id"]
        history = (
            supabase.table("price_history")
            .select("*")
            .eq("stock_id", stock_id)
            .eq("interval", interval)
            .order("recorded_at", desc=True)
            .limit(limit)
            .execute()
        )
        return history.data[::-1]  # oldest-first for charting
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.patch("/stocks/{symbol}/price", response_model=schemas.StockOut)
def update_stock_price(
    symbol: str,
    body: schemas.StockPriceUpdate,
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Update the current price of a stock.
    Used by background tasks / Alpha Vantage sync jobs.
    Requires a valid auth token (service-level usage).
    """
    try:
        update_data = {"current_price": float(body.current_price), "last_updated": "now()"}
        if body.prev_close is not None:
            update_data["prev_close"] = float(body.prev_close)
        if body.day_high is not None:
            update_data["day_high"] = float(body.day_high)
        if body.day_low is not None:
            update_data["day_low"] = float(body.day_low)
        if body.volume is not None:
            update_data["volume"] = body.volume

        response = (
            supabase.table("stocks")
            .update(update_data)
            .eq("symbol", symbol.upper())
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Stock '{symbol}' not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
