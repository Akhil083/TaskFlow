from sqlalchemy import Column, Integer,String,Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key = True, index = True)
    title = Column(String, index = True, nullable = False)
    description = Column(String, nullable = False)
    is_completed = Column(Boolean, default = False,nullable = False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable = False)
    priority = Column(Integer, nullable = False, default = 1)

    owner = relationship("User", back_populates = "tasks")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True)
    user_name = Column(String, index = True, nullable = False, unique = True)
    email = Column(String, unique = True, nullable = False)
    hashed_password = Column(String, nullable = False)


    tasks = relationship("Task", back_populates = "owner", cascade="all, delete-orphan")
    





     
