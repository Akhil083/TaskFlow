from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , declarative_base
from app.config import settings


Database_URL = settings.Database_URL

connect_args = {}
# only sqllite uses single thread thats why we are speifically mentioning 
# the connect_args to ignore single thread and accept request from any threads
if Database_URL.startswith("sqllite"):
    connect_args = {"check_same_thread": False}


engine = create_engine(
    Database_URL, 
    connect_args=connect_args
    )

SessionLocal = sessionmaker(
    autocommit= False,
    autoflush = False,
    bind = engine
    )

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()       