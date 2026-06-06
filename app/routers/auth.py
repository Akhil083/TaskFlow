from datetime import timedelta
from fastapi import APIRouter, Depends,HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_ 
from app.database import get_db
from app import models, schemas
from app.security import hash_password, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES


router = APIRouter(prefix = "/auth", tags = ["Authentication"])


# User Registration 
@router.post("/register", response_model = schemas.UserResponse, status_code = status.HTTP_201_CREATED)
def register (user:schemas.UserCreation, db: Session = Depends(get_db)):

    
    db_user = db.query(models.User).filter( or_(models.User.email == user.email,
                                                models.User.user_name == user.user_name)).first()
    
    if db_user is not None:
        raise HTTPException(status_code =status.HTTP_400_BAD_REQUEST,
                            detail = "Email or username already exists."
                            )
    
    new_user = models.User(
        user_name = user.user_name,
        hashed_password = hash_password(user.password.strip()),
        email = user.email
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user




# User Login
@router.post("/login", response_model = schemas.Token)
def login(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter( models.User.user_name == user.username).first()
    
    if db_user is None or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, 
                            detail = "Invalid credentials",
                            headers={"WWW-Authenticate": "Bearer"})
    
    access_token = create_access_token(data={"sub": db_user.user_name}, 
                                       expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    return {"access_token": access_token, "token_type": "bearer"}




# Get Current User
@router.get("/me", response_model = schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user

