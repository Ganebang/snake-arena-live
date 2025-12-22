from fastapi import APIRouter, HTTPException, Depends
from typing import List, Annotated

from src.schemas.game import LivePlayer
from src.db.session import get_db, MockDatabase

router = APIRouter()

@router.get("", response_model=List[LivePlayer])
async def get_live_players(db: Annotated[MockDatabase, Depends(get_db)]):
    return db.get_live_players()

@router.get("/{id}", response_model=LivePlayer)
async def get_live_player(id: str, db: Annotated[MockDatabase, Depends(get_db)]):
    player = db.get_live_player(id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player
