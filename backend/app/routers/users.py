from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from .. import models, schemas, utils
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter(
    # prefix="/users",
    tags=['Users']
)

@router.post("/user", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(models.Users).filter(
        models.Users.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user_data = user.dict()
    user_data["password"] = utils.hash(user.password)
    
    # The database model does not have a username column at the moment
    if "username" in user_data:
        del user_data["username"]

    new_user = models.Users(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize wallet with $10,000
    new_wallet = models.Wallet(user_id=new_user.id, balance=10000)
    db.add(new_wallet)
    db.commit()

    return new_user


