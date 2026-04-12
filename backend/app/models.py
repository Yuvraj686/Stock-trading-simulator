from datetime import datetime

from .database import Base
from sqlalchemy import Column, DateTime, Integer, String, Boolean, ForeignKey, Float, Enum
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text
from sqlalchemy.orm import relationship
import enum

class Users(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, nullable=False)
    # username = Column(String, unique=True, nullable=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String , nullable= False)
    balance = Column(Integer , nullable= False)
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    is_active = Column(Boolean, server_default= 'True')
    created_at = Column(TIMESTAMP(timezone=True), nullable= False, server_default=text('now()'))


class Stocks(Base):
    __tablename__ = "stocks"
    
    id =  Column(Integer , primary_key = True , nullable = False)
    symbol = Column(String, nullable= False)
    name = Column(String , nullable= False)
    price = Column(Integer , nullable= False)
    sector = Column(String, nullable=False)
    # is_active = Column(Boolean, server_default= 'True')

class Orders(Base):
    __tablename__ = "orders"
    
    id =  Column(Integer , primary_key = True , nullable = False)
    user_id = Column(
                    Integer, 
                    ForeignKey("users.id", ondelete="CASCADE"), 
                    nullable = False)
    user = relationship("Users")
    
    stock_id = Column(Integer,
                    ForeignKey("stocks.id"),
                    nullable= False)
    stock = relationship("Stocks")
    
    type = Column(String , nullable= False)
    quantity = Column(Integer , nullable= False)
    price = Column(Float , nullable= False)
    executed_at = Column(TIMESTAMP(timezone=True),nullable=False, server_default=text('now()'))

class Portfolio(Base):
    __tablename__ = "portfolio"
    
    id =  Column(Integer , primary_key = True , nullable = False)
    user_id = Column(
                    Integer, 
                    ForeignKey("users.id", ondelete="CASCADE"), 
                    nullable = False)
    user = relationship("Users")
    
    stock_id = Column(Integer,
                    ForeignKey("stocks.id"),
                    nullable= False)
    stock = relationship("Stocks")
    
    quantity = Column(Integer , nullable= False)
    avg_price = Column(Float , nullable= False)
    updated_at = Column(TIMESTAMP(timezone=True),nullable=False, server_default=text('now()'))


class MyEnum(enum.Enum):
    one = "CREDIT"
    two = "DEBIT"

class Transactions(Base):
    __tablename__ = "transaction"
    
    id =  Column(Integer , primary_key = True , nullable = False)
    order_id = Column(
                    Integer, 
                    ForeignKey("orders.id"), 
                    nullable = False)
    user = relationship("Orders")
    
    stock_id = Column(Integer,
                    ForeignKey("stocks.id"),
                    nullable= False)
    stock = relationship("Stocks")
    
    amount = Column(Integer , nullable= False)
    pnl = Column(Float , nullable= False)
    transaction_type = Column(Enum(MyEnum), nullable= False)
    executed_at = Column(TIMESTAMP(timezone=True),nullable=False, server_default=text('now()'))


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    balance = Column(Float, default=100000.0)  # Default virtual balance ₹1,00,000
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("Users", back_populates="wallet")