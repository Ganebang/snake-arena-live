from fastapi import APIRouter, Depends, Query
from typing import List, Optional, Annotated
from sqlalchemy.orm import Session

from src.schemas.game import LeaderboardEntry, ScoreSubmission, GameMode
from src.schemas.user import User
from src.db.database import get_db
from src.db import session as db_session
from .auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    db: Annotated[Session, Depends(get_db)],
    mode: Optional[GameMode] = None
):
    return db_session.get_leaderboard(db, mode)

@router.post("", response_model=LeaderboardEntry, status_code=201)
async def submit_score(
    submission: ScoreSubmission, 
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    return db_session.add_score(db, current_user.id, current_user.username, submission.score, submission.mode)

@router.get("/high-score")
async def get_high_score(
    userId: str, 
    db: Annotated[Session, Depends(get_db)],
    mode: Optional[GameMode] = None
):
    score = db_session.get_user_high_score(db, userId, mode)
    return {"score": score}
