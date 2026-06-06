from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class TaskCreation(BaseModel):
    title :str
    description : str
    is_completed : bool = False
    priority : int = Field(default=1, ge=1, le=5)

class TaskResponse(BaseModel):
    id : int
    title : str
    description : str
    is_completed : bool
    priority : int
    user_id : int

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    title : str = Field(..., min_length=1, max_length=100)
    description : str = Field(..., min_length=1)
    is_completed : bool
    priority : int = Field(..., ge=1, le=5)

class PartialUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, min_length=1)
    is_completed: bool | None = None
    priority: int | None = Field(None, ge=1, le=5)


class UserCreation(BaseModel):
    user_name : str = Field(..., min_length=3, max_length=50)
    email : EmailStr
    password : str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id : int
    user_name : str
    email : EmailStr

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token : str
    token_type : str

