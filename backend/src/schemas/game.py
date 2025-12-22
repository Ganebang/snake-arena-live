from pydantic import BaseModel
from typing import List
from datetime import datetime
from .enums import GameMode, Direction

class LeaderboardEntry(BaseModel):
    id: str
    userId: str
    username: str
    score: int
    mode: GameMode
    createdAt: datetime

class ScoreSubmission(BaseModel):
    score: int
    mode: GameMode

class Position(BaseModel):
    x: int
    y: int

class LivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    snake: List[Position]
    food: Position
    direction: Direction
    isPlaying: bool
