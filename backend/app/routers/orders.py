"""orders.py — Buy/Sell execution, portfolio, and transaction history."""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from decimal import Decimal
from typing import List

from ..database import get_supabase
from .. import schemas, oauth2

router = APIRouter(tags=["Orders"])


@router.post("/buy", response_model=schemas.TradeResult)
def buy_stock(
    body: schemas.BuyStockCreate,
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Execute a market buy order.
    Uses the `execute_trade` Postgres function for atomicity.
    """
    try:
        # Resolve stock
        stock_resp = (
            supabase.table("stocks")
            .select("id, current_price, is_active")
            .eq("symbol", body.stock_symbol.upper())
            .execute()
        )
        if not stock_resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock not found")
        stock = stock_resp.data[0]
        if not stock.get("is_active", True):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stock is not currently tradeable")

        # Atomic trade via stored function
        result = supabase.rpc("execute_trade", {
            "p_user_id":  str(current_user.id),
            "p_stock_id": str(stock["id"]),
            "p_type":     "buy",
            "p_quantity": body.quantity,
            "p_price":    float(stock["current_price"]),
        }).execute()

        trade = result.data
        if isinstance(trade, list):
            trade = trade[0]

        if not trade.get("success"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=trade.get("error", "Trade failed"))

        return schemas.TradeResult(
            success=True,
            order_id=trade["order_id"],
            balance_after=Decimal(str(trade["balance_after"])),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/sell", response_model=schemas.TradeResult)
def sell_stock(
    body: schemas.SellStockCreate,
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Execute a market sell order.
    Uses the `execute_trade` Postgres function for atomicity.
    Realised P&L is returned in the response.
    """
    try:
        stock_resp = (
            supabase.table("stocks")
            .select("id, current_price, is_active")
            .eq("symbol", body.stock_symbol.upper())
            .execute()
        )
        if not stock_resp.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock not found")
        stock = stock_resp.data[0]

        result = supabase.rpc("execute_trade", {
            "p_user_id":  str(current_user.id),
            "p_stock_id": str(stock["id"]),
            "p_type":     "sell",
            "p_quantity": body.quantity,
            "p_price":    float(stock["current_price"]),
        }).execute()

        trade = result.data
        if isinstance(trade, list):
            trade = trade[0]

        if not trade.get("success"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=trade.get("error", "Trade failed"))

        return schemas.TradeResult(
            success=True,
            order_id=trade["order_id"],
            balance_after=Decimal(str(trade["balance_after"])),
            pnl=Decimal(str(trade["pnl"])),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/portfolio", response_model=List[schemas.PortfolioItemOut])
def get_portfolio(
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Return the current user's holdings with live P&L calculations."""
    try:
        rows = (
            supabase.table("portfolio")
            .select("*, stocks(id, symbol, name, sector, current_price)")
            .eq("user_id", str(current_user.id))
            .order("updated_at", desc=True)
            .execute()
        )
        result = []
        for item in rows.data:
            stock = item["stocks"]
            avg   = Decimal(str(item["avg_price"]))
            cur   = Decimal(str(stock["current_price"]))
            qty   = item["quantity"]
            pnl   = (cur - avg) * qty
            pnl_pct = ((cur - avg) / avg * 100) if avg > 0 else Decimal("0")
            result.append({
                "stock_id":      item["stock_id"],
                "symbol":        stock["symbol"],
                "name":          stock["name"],
                "sector":        stock["sector"],
                "quantity":      qty,
                "avg_price":     avg,
                "current_price": cur,
                "total_value":   cur * qty,
                "pnl":           pnl,
                "pnl_pct":       round(pnl_pct, 2),
                "updated_at":    item["updated_at"],
            })
        return result
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/transactions", response_model=List[schemas.TransactionListItem])
def get_transactions(
    current_user=Depends(oauth2.get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Return the user's complete order history, newest first."""
    try:
        rows = (
            supabase.table("orders")
            .select("*, stocks(symbol), transactions(pnl)")
            .eq("user_id", str(current_user.id))
            .order("executed_at", desc=True)
            .execute()
        )
        result = []
        for order in rows.data:
            # transactions is a list (1-to-1 but returned as array by Supabase)
            txn_list = order.get("transactions") or []
            pnl = Decimal(str(txn_list[0]["pnl"])) if txn_list else Decimal("0")
            result.append({
                "id":          order["id"],
                "symbol":      order["stocks"]["symbol"],
                "order_type":  order["order_type"],
                "quantity":    order["quantity"],
                "price":       Decimal(str(order["price"])),
                "total_value": Decimal(str(order["total_value"])),
                "pnl":         pnl,
                "date":        order["executed_at"],
                "status":      order.get("status", "completed"),
            })
        return result
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))