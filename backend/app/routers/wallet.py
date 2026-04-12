from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from backend.app import models
from backend.app.models import Wallet
from backend.app.oauth2 import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from .. import models
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db


router = APIRouter(
    # prefix="/posts",
    tags=['Wallet']
)

@router.get("/wallet")
def get_wallet(
    db: Session = Depends(get_db),
    current_user: models.Users = Depends(get_current_user)
):

    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()

    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=10000)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    return wallet