from jose import JWTError, jwt, ExpiredSignatureError
from datetime import datetime,timedelta,timezone
from . import schemas, database, models
from fastapi import Depends,status,HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models
from .config import settings

oauth2_schema = OAuth2PasswordBearer(tokenUrl='login')

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes 

def create_access_token(data: dict):
    to_encode = data.copy()
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.replace(tzinfo=timezone.utc).timestamp())})
    
    encoded_jwt = jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        print("Decoded token payload:", payload)
        id = payload.get("user_id")

        if id is None:
            raise credentials_exception
        token_data = schemas.TokenData(id=id)
    except ExpiredSignatureError as e:
        print("Token expired:", e)
        raise credentials_exception
    except JWTError as e:
        print("JWT error:", e)
        raise credentials_exception
    return token_data

def get_current_user(
    token: str = Depends(oauth2_schema),
    db: Session = Depends(database.get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = verify_access_token(token, credentials_exception)

    user = db.query(models.Users).filter(
        models.Users.id == token_data.id
    ).first()

    if user is None:
        raise credentials_exception

    print(models.Users.id)
    return user

