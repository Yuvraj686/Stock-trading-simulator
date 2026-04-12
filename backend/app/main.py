from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

# from backend.app.routers import wallet
from .database import engine , get_db
from . import models , schemas
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .routers import orders, stocks, users, auth, wallet

app = FastAPI(title="Stock Trading Simulator")
from sqlalchemy import inspect

inspector = inspect(engine)
print(inspector.get_table_names())
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)
print(models.Base.metadata.tables.keys())

app.include_router(stocks.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(wallet.router)


@app.get("/")
def get_root():
    return {"message":"Welcome to my stock simulator"}
