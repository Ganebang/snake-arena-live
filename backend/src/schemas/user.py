from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_superuser: bool
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)
