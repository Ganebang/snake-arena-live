from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta
from typing import Annotated

from src.core.config import settings
from src.core.security import create_access_token, get_password_hash, verify_password, oauth2_scheme
from src.schemas.auth import AuthCredentials, AuthResponse
from src.schemas.user import User
from src.db.session import get_db, MockDatabase

router = APIRouter()

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[MockDatabase, Depends(get_db)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # In a real app we'd decode JWT here to get user ID/email
    # For now we reuse the simplified logic from before but updated imports
    try:
        import jwt
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

@router.post("/login", response_model=AuthResponse)
async def login(credentials: AuthCredentials, db: Annotated[MockDatabase, Depends(get_db)]):
    user = db.get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    hashed_password = db.get_password_hash(user.id)
    if not verify_password(credentials.password, hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return AuthResponse(user=user, token=access_token)

@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(credentials: AuthCredentials, db: Annotated[MockDatabase, Depends(get_db)]):
    if db.get_user_by_email(credentials.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(credentials.password)
    username = credentials.username or credentials.email.split("@")[0]
    
    user = db.create_user(username, credentials.email, hashed_password)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return AuthResponse(user=user, token=access_token)

@router.post("/logout", status_code=204)
async def logout(current_user: Annotated[User, Depends(get_current_user)]):
    pass

@router.get("/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
