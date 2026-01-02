from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.api.v1.endpoints.auth import get_current_user
from src.db.database import get_db
from src.db.models import LeaderboardEntry, User
from src.schemas import user as user_schema

router = APIRouter()

def get_current_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
) -> Any:
    """
    Get system statistics
    """
    user_count = db.query(User).count()
    game_count = db.query(LeaderboardEntry).count()

    # Get games by mode
    from sqlalchemy import func
    games_by_mode = db.query(
        LeaderboardEntry.mode,
        func.count(LeaderboardEntry.id)
    ).group_by(LeaderboardEntry.mode).all()

    return {
        "users": user_count,
        "games": game_count,
        "games_by_mode": dict(games_by_mode)
    }

@router.get("/users", response_model=list[user_schema.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
) -> Any:
    """
    Retrieve all users
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        user_schema.User(
            id=user.id,
            username=user.username,
            email=user.email,
            is_superuser=user.is_superuser,
            createdAt=user.created_at.isoformat()
        )
        for user in users
    ]

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
) -> Any:
    """
    Delete a user
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Users can not delete themselves"
        )
    db.delete(user)
    db.commit()
    return {"status": "success", "message": "User deleted"}
