from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from .. import models, schemas
from sqlalchemy.orm import Session
from ..database import get_db
from typing import List
from backend.app.models import Transactions, Portfolio, Orders , Stocks, Users, Wallet
from ..oauth2 import get_current_user
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException


router = APIRouter(
    # prefix="/orders",
    tags=['Orders']
)



@router.post("/buy")
async def buy_stock(
    stock: schemas.BuyStockCreate,
    db: Session = Depends(get_db),
    current_user: models.Users = Depends(get_current_user)
):

    db_stock = db.query(Stocks).filter(
        Stocks.symbol == stock.stock_symbol
    ).first()

    if not db_stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    # Calculate total cost
    total_cost = db_stock.current_price * stock.quantity

    # Check wallet balance
    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()

    if wallet.balance < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    try:
        # Deduct balance
        wallet.balance -= total_cost

        # Create Order
        order = Orders(
            user_id=current_user.id,
            stock_id=db_stock.id,
            quantity=stock.quantity,
            price=db_stock.current_price,
            type="Buy"
        )

        db.add(order)

        # Update Portfolio
        portfolio = db.query(Portfolio).filter(
            Portfolio.user_id == current_user.id,
            Portfolio.stock_id == db_stock.id
        ).first()

        if portfolio:
            total_quantity = portfolio.quantity + stock.quantity
            new_avg_price = (
                (portfolio.quantity * portfolio.avg_price) +
                (stock.quantity * db_stock.current_price)
            ) / total_quantity

            portfolio.quantity = total_quantity
            portfolio.avg_price = new_avg_price

        else:
            portfolio = Portfolio(
                user_id=current_user.id,
                stock_id=db_stock.id,
                quantity=stock.quantity,
                avg_price=db_stock.current_price
            )
            db.add(portfolio)

        db.commit()
        db.refresh(order)

        return order

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transaction failed")


@router.post("/sell")
async def sell_stock(
    stock: schemas.SellStockCreate,
    db: Session = Depends(get_db),
    current_user: models.Users = Depends(get_current_user)
):

    # Get stock from DB
    db_stock = db.query(Stocks).filter(
        Stocks.symbol == stock.stock_symbol
    ).first()

    if not db_stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    # 2️⃣ Get portfolio entry
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id,
        Portfolio.stock_id == db_stock.id
    ).first()

    if not portfolio:
        raise HTTPException(status_code=400, detail="You do not own this stock")

    if stock.quantity > portfolio.quantity:
        raise HTTPException(status_code=400, detail="Not enough shares to sell")

    # Calculate total sell value
    total_sell_value = db_stock.current_price * stock.quantity

    # Calculate realized P&L
    realized_profit = (db_stock.current_price - portfolio.avg_price) * stock.quantity

    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()

    try:
        # Add money to wallet
        wallet.balance += total_sell_value

        # Reduce portfolio quantity
        portfolio.quantity -= stock.quantity

        # Remove stock if quantity becomes zero
        if portfolio.quantity == 0:
            db.delete(portfolio)

        # Create Order record
        order = Orders(
            user_id=current_user.id,
            stock_id=db_stock.id,
            quantity=stock.quantity,
            price=db_stock.current_price,
            type="Sell",
            realized_pnl=realized_profit
        )

        db.add(order)

        db.commit()
        db.refresh(order)

        return {
            "message": "Stock sold successfully",
            "sell_price": db_stock.current_price,
            "realized_profit": realized_profit
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transaction failed")