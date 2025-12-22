from fastapi import APIRouter, Depends, Query
from typing import List, Optional, Annotated

from src.schemas.game import LeaderboardEntry, ScoreSubmission, GameMode
from src.schemas.user import User
from src.db.session import get_db, MockDatabase
from .auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    db: Annotated[MockDatabase, Depends(get_db)],
    mode: Optional[GameMode] = None
):
    return db.get_leaderboard(mode)

@router.post("", response_model=LeaderboardEntry, status_code=201)
async def submit_score(
    submission: ScoreSubmission, 
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[MockDatabase, Depends(get_db)]
):
    return db.add_score(current_user.id, current_user.username, submission.score, submission.mode)

@router.get("/high-score")
async def get_high_score(
    userId: str, 
    db: Annotated[MockDatabase, Depends(get_db)],
    mode: Optional[GameMode] = None
):
    score = db.get_user_high_score(userId, mode)
    return {"score": score}
