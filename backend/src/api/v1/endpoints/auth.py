from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.core.config import settings
from src.core.security import create_access_token, get_password_hash, verify_password
from src.db import session as db_session
from src.db.database import get_db
from src.schemas.auth import AuthCredentials, AuthResponse
from src.schemas.user import User

router = APIRouter()

from src.api.deps import get_current_user


@router.post("/login", response_model=AuthResponse)
async def login(credentials: AuthCredentials, db: Annotated[Session, Depends(get_db)]):
    user = db_session.get_user_by_email(db, credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    hashed_password = db_session.get_password_hash(db, user.id)
    if not verify_password(credentials.password, hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )

    return AuthResponse(user=user, token=access_token)

@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(credentials: AuthCredentials, db: Annotated[Session, Depends(get_db)]):
    if db_session.get_user_by_email(db, credentials.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(credentials.password)
    username = credentials.username or credentials.email.split("@")[0]

    user = db_session.create_user(db, username, credentials.email, hashed_password)
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
