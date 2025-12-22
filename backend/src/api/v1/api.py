from fastapi import APIRouter
from .endpoints import auth, leaderboard, live_players

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
api_router.include_router(live_players.router, prefix="/live-players", tags=["live-players"])
