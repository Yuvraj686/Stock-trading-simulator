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

    new_user = models.Users(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# @router.post("/login", response_model=schemas.Token)
# def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):

#     user = db.query(models.Users).filter(
#         models.Users.email == user_credentials.email
#     ).first()

#     if not user:
#         raise HTTPException(status_code=403, detail="Invalid credentials")

#     if not utils.verify(user_credentials.password, user.password):
#         raise HTTPException(status_code=403, detail="Invalid credentials")

#     access_token = create_access_token(data={"user_id": user.id})

#     return {"access_token": access_token, "token_type": "bearer"}
