
from fastapi import APIRouter, HTTPException

from src.db import session as db_session
from src.schemas.game import LivePlayer

router = APIRouter()

@router.get("", response_model=list[LivePlayer])
async def get_live_players():
    return db_session.get_live_players()

@router.get("/{id}", response_model=LivePlayer)
async def get_live_player(id: str):
    player = db_session.get_live_player(id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

from typing import Annotated
from fastapi import Depends
from src.schemas.game import LivePlayerUpdate
from src.schemas.user import User
from src.api.deps import get_current_user

@router.post("/ping", status_code=204)
async def update_live_status(
    status: LivePlayerUpdate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Update the current user's live game status.
    This acts as a heartbeat for the multiplayer mode.
    """
    player = LivePlayer(
        id=current_user.id,
        username=current_user.username,
        score=status.score,
        mode=status.mode,
        snake=status.snake,
        food=status.food,
        direction=status.direction,
        isPlaying=status.isPlaying
    )
    db_session.update_live_player(player)
