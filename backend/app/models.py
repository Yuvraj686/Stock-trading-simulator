"""
models.py — Python dataclass representations of the Supabase schema.

These are NOT SQLAlchemy ORM models. They are plain Python dataclasses
used for type-safety when working with data returned by the Supabase
client. All persistence is done via supabase-py's table / rpc calls.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID


@dataclass
class User:
    """Maps to public.users table."""
    id:           UUID
    email:        str
    balance:      Decimal
    is_active:    bool
    created_at:   datetime
    updated_at:   datetime
    display_name: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "User":
        return cls(
            id=UUID(data["id"]),
            email=data["email"],
            display_name=data.get("display_name"),
            balance=Decimal(str(data["balance"])),
            is_active=data.get("is_active", True),
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
        )


@dataclass
class Stock:
    """Maps to public.stocks table."""
    id:            UUID
    symbol:        str
    name:          str
    sector:        str
    current_price: Decimal
    is_active:     bool
    last_updated:  datetime
    prev_close:    Optional[Decimal] = None
    day_high:      Optional[Decimal] = None
    day_low:       Optional[Decimal] = None
    volume:        Optional[int] = None
    market_cap:    Optional[Decimal] = None

    @classmethod
    def from_dict(cls, data: dict) -> "Stock":
        return cls(
            id=UUID(data["id"]),
            symbol=data["symbol"],
            name=data["name"],
            sector=data["sector"],
            current_price=Decimal(str(data["current_price"])),
            prev_close=Decimal(str(data["prev_close"])) if data.get("prev_close") else None,
            day_high=Decimal(str(data["day_high"])) if data.get("day_high") else None,
            day_low=Decimal(str(data["day_low"])) if data.get("day_low") else None,
            volume=data.get("volume"),
            market_cap=Decimal(str(data["market_cap"])) if data.get("market_cap") else None,
            is_active=data.get("is_active", True),
            last_updated=datetime.fromisoformat(data["last_updated"]),
        )


@dataclass
class PriceHistory:
    """Maps to public.price_history table."""
    id:          UUID
    stock_id:    UUID
    open:        Decimal
    high:        Decimal
    low:         Decimal
    close:       Decimal
    volume:      int
    interval:    str
    recorded_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> "PriceHistory":
        return cls(
            id=UUID(data["id"]),
            stock_id=UUID(data["stock_id"]),
            open=Decimal(str(data["open"])),
            high=Decimal(str(data["high"])),
            low=Decimal(str(data["low"])),
            close=Decimal(str(data["close"])),
            volume=data.get("volume", 0),
            interval=data.get("interval", "daily"),
            recorded_at=datetime.fromisoformat(data["recorded_at"]),
        )


@dataclass
class Portfolio:
    """Maps to public.portfolio table."""
    id:         UUID
    user_id:    UUID
    stock_id:   UUID
    quantity:   int
    avg_price:  Decimal
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> "Portfolio":
        return cls(
            id=UUID(data["id"]),
            user_id=UUID(data["user_id"]),
            stock_id=UUID(data["stock_id"]),
            quantity=data["quantity"],
            avg_price=Decimal(str(data["avg_price"])),
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
        )


@dataclass
class Order:
    """Maps to public.orders table."""
    id:          UUID
    user_id:     UUID
    stock_id:    UUID
    order_type:  str   # 'buy' | 'sell'
    quantity:    int
    price:       Decimal
    total_value: Decimal
    status:      str   # 'completed' | 'pending' | 'cancelled' | 'failed'
    executed_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> "Order":
        return cls(
            id=UUID(data["id"]),
            user_id=UUID(data["user_id"]),
            stock_id=UUID(data["stock_id"]),
            order_type=data["order_type"],
            quantity=data["quantity"],
            price=Decimal(str(data["price"])),
            total_value=Decimal(str(data["total_value"])),
            status=data.get("status", "completed"),
            executed_at=datetime.fromisoformat(data["executed_at"]),
        )


@dataclass
class Transaction:
    """Maps to public.transactions table."""
    id:               UUID
    order_id:         UUID
    user_id:          UUID
    stock_id:         UUID
    transaction_type: str   # 'DEBIT' | 'CREDIT'
    amount:           Decimal
    pnl:              Decimal
    balance_after:    Decimal
    executed_at:      datetime

    @classmethod
    def from_dict(cls, data: dict) -> "Transaction":
        return cls(
            id=UUID(data["id"]),
            order_id=UUID(data["order_id"]),
            user_id=UUID(data["user_id"]),
            stock_id=UUID(data["stock_id"]),
            transaction_type=data["transaction_type"],
            amount=Decimal(str(data["amount"])),
            pnl=Decimal(str(data.get("pnl", 0))),
            balance_after=Decimal(str(data["balance_after"])),
            executed_at=datetime.fromisoformat(data["executed_at"]),
        )


@dataclass
class WatchlistItem:
    """Maps to public.watchlist table."""
    id:       UUID
    user_id:  UUID
    stock_id: UUID
    added_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> "WatchlistItem":
        return cls(
            id=UUID(data["id"]),
            user_id=UUID(data["user_id"]),
            stock_id=UUID(data["stock_id"]),
            added_at=datetime.fromisoformat(data["added_at"]),
        )


@dataclass
class Message:
    """Maps to public.messages table."""
    id:         UUID
    user_id:    UUID
    username:   str
    content:    str
    created_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> "Message":
        return cls(
            id=UUID(data["id"]),
            user_id=UUID(data["user_id"]),
            username=data["username"],
            content=data["content"],
            created_at=datetime.fromisoformat(data["created_at"]),
        )