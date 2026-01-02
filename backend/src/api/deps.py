from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.config import settings
from src.core.security import oauth2_scheme
from src.db import session as db_session
from src.db.database import get_db
from src.schemas.user import User


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError as e:
        raise credentials_exception from e

    user = db_session.get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user
