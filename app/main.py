from fastapi import FastAPI
from fastapi.responses import HTMLResponse
#from app.database import engine, Base
from app import models
from app.routers import tasks 
from app.routers import auth
from app.config import settings
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title=settings.APP_NAME, description="A simple application to manage tasks and track them on daily basis.")

origins = [
    "http://127.0.0.1:5500",  # Default Live Server port for VS Code
    "http://localhost:5500",
    "http://127.0.0.1:8000",
    "*",                      # Allows all origins (remove this in production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(tasks.router)
app.include_router(auth.router)


@app.get("/", response_class = HTMLResponse)
def home():
    return {"message:" "The application has started."}


