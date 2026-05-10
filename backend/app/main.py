"""
main.py — FastAPI application entry point for the Stock Trading Simulator.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .routers import auth, stocks, users, orders, messages, watchlist

# ── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── Application ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Stock Trading Simulator API",
    description="Paper-trading platform backed by Supabase. Buy, sell, track portfolio & chat.",
    version="2.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api")
app.include_router(stocks.router,    prefix="/api")
app.include_router(users.router,     prefix="/api")
app.include_router(orders.router,    prefix="/api")
app.include_router(messages.router,  prefix="/api")
app.include_router(watchlist.router, prefix="/api")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Stock Trading Simulator API v2.0"}


@app.get("/health", tags=["Health"])
def liveness():
    return {"status": "healthy"}
