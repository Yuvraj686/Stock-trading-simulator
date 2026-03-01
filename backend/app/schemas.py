from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str
    balance: int

class UserOut(BaseModel):
    id: int
    email: EmailStr
    balance: int
    created_at: datetime
    class Config:
        from_attributes = True

class stockOut(BaseModel):
    symbol: str
    name: str
    price: int
    is_active: bool

class orders(BaseModel):
    id: int
    user_id: int
    stock_id: int
    type: str
    quantity: int
    price: int
    timestamp: datetime

class portfolio(BaseModel):
    user_id: int
    stock_id: int
    quantity: int
    avg_price: int

class transaction(BaseModel):
    id: int
    order_id: int
    pnl: int

class BuyStockCreate(BaseModel):
    user_id: int
    stock_symbol: str
    quantity: int
    price: float

class BuyStockResponse(BaseModel):
    id: int
    user_id: int
    stock_symbol: str
    quantity: int
    price: float
    type: str

    class Config:
        from_attributes = True  # Pydantic v2

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: int


class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user_id: int

class SellStockCreate(BaseModel):
    user_id: int
    stock_symbol: str
    quantity: int
    price: float
    type: str