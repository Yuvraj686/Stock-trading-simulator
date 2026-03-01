from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from .. import models, schemas
from sqlalchemy.orm import Session
from ..database import get_db
from typing import List

router = APIRouter(
    # prefix="/posts",
    tags=['Stocks']
)


@router.get("/stocks",response_model=List[schemas.stockOut])
def get_stocks(db: Session = Depends(get_db)):
    result = db.query(models.Stocks).all()
    return result


@router.get("/stocks/{name}", response_model=List[schemas.stockOut])
def get_one_stock(name: str, db: Session = Depends(get_db)):
    result = db.query(models.Stocks).filter(models.Stocks.name == name).first()
    return [result]
