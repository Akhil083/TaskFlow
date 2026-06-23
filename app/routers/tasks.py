from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

import app.models as models
import app.schemas as schemas
from app.database import get_db
from app.security import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# Create a new task
@router.post("", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreation,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    db_task = models.Task(
        title=task.title,
        description=task.description,
        is_completed=task.is_completed,
        priority=task.priority,
        user_id=current_user.id,
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


# Delete a task by ID
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.user_id == current_user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"detail": f"Task with task_id {task_id} has been deleted."}


# Filtering Tast by Query Parameters
@router.get("", response_model=List[schemas.TaskResponse])
def get_tasks(
    is_completed: Annotated[bool | None, Query()] = None,
    title: Annotated[str | None, Query()] = None,
    limit: Annotated[int, Query(gt=0, lt=50)] = 10,
    skip: Annotated[int, Query(ge=0)] = 0,
    sort_by: Annotated[str, Query()] = "id",
    order_by: Annotated[str, Query()] = "desc",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    query = db.query(models.Task).filter(models.Task.user_id == current_user.id)

    if is_completed is not None:
        query = query.filter(models.Task.is_completed == is_completed)
    if title is not None:
        query = query.filter(models.Task.title.ilike(f"%{title}%"))
    allowed_sort_fields = {"id": models.Task.id, "title": models.Task.title}

    sort_column = allowed_sort_fields.get(sort_by)
    if not sort_column:
        raise HTTPException(
            status_code=400, detail="Invalid sort filed.Allowd value: id, title"
        )
    if order_by == "asc":
        query = query.order_by(sort_column.asc())
    elif order_by == "desc":
        query = query.order_by(sort_column.desc())
    else:
        raise HTTPException(
            status_code=400, detail="Invalid order value.Allowed values are asc, desc"
        )

    if limit is not None:
        query = query.limit(limit)

    tasks = query.offset(skip).limit(limit).all()
    return tasks


# Get a task by ID
@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


# Update a Task by ID using PUT
@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.user_id == current_user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.title = task_data.title
    task.description = task_data.description
    task.is_completed = task_data.is_completed

    db.commit()
    db.refresh(task)
    return task


# Partial Update a Task by ID using PATCH
@router.patch("/{task_id}", response_model=schemas.TaskResponse)
def partial_update(
    task_id: int,
    task_data: schemas.PartialUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):

    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.user_id == current_user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    if task_data.is_completed is not None:
        task.is_completed = task_data.is_completed

    if task_data.priority is not None:
        task.priority = task_data.priority

    db.commit()
    db.refresh(task)
    return task


# Mark a task as completed
@router.patch("/{task_id}/complete", response_model=schemas.TaskResponse)
def mark_task_completed(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.user_id == current_user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = True
    db.commit()
    db.refresh(task)
    return task
