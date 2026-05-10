"""
schemas.py — Pydantic v2 request / response schemas.

Aligned with the new database schema (no wallets table,
orders use order_type, transactions include pnl & balance_after).
"""

from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID


# ── Auth ──────────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email:    EmailStr
    password: str = Field(min_length=6)

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class AuthResponse(BaseModel):
    """Raw pass-through of the Supabase auth response."""
    user:    dict
    session: dict

class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"

class TokenData(BaseModel):
    id: UUID


# ── Users ────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id:           UUID
    email:        EmailStr
    display_name: Optional[str] = None
    balance:      Decimal
    is_active:    bool
    created_at:   datetime
    updated_at:   datetime

    model_config = {"from_attributes": True}


# ── Stocks ───────────────────────────────────────────────────────────────────

class StockOut(BaseModel):
    id:            UUID
    symbol:        str
    name:          str
    sector:        str
    current_price: Decimal
    prev_close:    Optional[Decimal] = None
    day_high:      Optional[Decimal] = None
    day_low:       Optional[Decimal] = None
    volume:        Optional[int]     = None
    market_cap:    Optional[Decimal] = None
    is_active:     bool
    last_updated:  datetime

    model_config = {"from_attributes": True}

class StockPriceUpdate(BaseModel):
    """Used by admin/background tasks to update stock price."""
    current_price: Decimal = Field(gt=0)
    prev_close:    Optional[Decimal] = None
    day_high:      Optional[Decimal] = None
    day_low:       Optional[Decimal] = None
    volume:        Optional[int]     = None


# ── Price History ─────────────────────────────────────────────────────────────

class PriceHistoryOut(BaseModel):
    id:          UUID
    stock_id:    UUID
    open:        Decimal
    high:        Decimal
    low:         Decimal
    close:       Decimal
    volume:      int
    interval:    str
    recorded_at: datetime

    model_config = {"from_attributes": True}


# ── Portfolio ─────────────────────────────────────────────────────────────────

class PortfolioItemOut(BaseModel):
    """Portfolio row joined with stock info."""
    stock_id:      UUID
    symbol:        str
    name:          str
    sector:        str
    quantity:      int
    avg_price:     Decimal
    current_price: Decimal
    total_value:   Decimal
    pnl:           Decimal          # unrealised P&L
    pnl_pct:       Decimal          # unrealised P&L %
    updated_at:    datetime

    model_config = {"from_attributes": True}


# ── Orders ────────────────────────────────────────────────────────────────────

class BuyStockCreate(BaseModel):
    stock_symbol: str
    quantity:     int = Field(gt=0)

class SellStockCreate(BaseModel):
    stock_symbol: str
    quantity:     int = Field(gt=0)

class OrderOut(BaseModel):
    id:          UUID
    user_id:     UUID
    stock_id:    UUID
    order_type:  str
    quantity:    int
    price:       Decimal
    total_value: Decimal
    status:      str
    executed_at: datetime

    model_config = {"from_attributes": True}

class TradeResult(BaseModel):
    """Response returned after executing a buy or sell."""
    success:       bool
    order_id:      Optional[UUID]    = None
    balance_after: Optional[Decimal] = None
    pnl:           Optional[Decimal] = None   # only on sell
    error:         Optional[str]     = None


# ── Transactions ──────────────────────────────────────────────────────────────

class TransactionOut(BaseModel):
    id:               UUID
    order_id:         UUID
    user_id:          UUID
    stock_id:         UUID
    transaction_type: str
    amount:           Decimal
    pnl:              Decimal
    balance_after:    Decimal
    executed_at:      datetime

    model_config = {"from_attributes": True}

class TransactionListItem(BaseModel):
    """Flattened view used by the /transactions endpoint."""
    id:          UUID
    symbol:      str
    order_type:  str
    quantity:    int
    price:       Decimal
    total_value: Decimal
    pnl:         Decimal
    date:        datetime
    status:      str = "completed"

    model_config = {"from_attributes": True}


# ── Watchlist ─────────────────────────────────────────────────────────────────

class WatchlistAddRequest(BaseModel):
    stock_id: UUID

class WatchlistItemOut(BaseModel):
    id:            UUID
    stock_id:      UUID
    symbol:        str
    name:          str
    sector:        str
    current_price: Decimal
    prev_close:    Optional[Decimal] = None
    added_at:      datetime

    model_config = {"from_attributes": True}


# ── Messages ──────────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)

class MessageOut(BaseModel):
    id:         UUID
    user_id:    UUID
    username:   str
    content:    str
    created_at: datetime

    model_config = {"from_attributes": True}