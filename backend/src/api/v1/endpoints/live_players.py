
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
