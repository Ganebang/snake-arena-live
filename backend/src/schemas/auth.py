
from pydantic import BaseModel, EmailStr

from .user import User


class AuthCredentials(BaseModel):
    email: EmailStr
    password: str
    username: str | None = None

class AuthResponse(BaseModel):
    user: User
    token: str
