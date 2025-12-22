from pydantic import BaseModel, EmailStr
from typing import Optional
from .user import User

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None

class AuthResponse(BaseModel):
    user: User
    token: str
