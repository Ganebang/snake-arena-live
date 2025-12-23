from datetime import datetime

from pydantic import BaseModel

from .enums import Direction, GameMode


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
    snake: list[Position]
    food: Position
    direction: Direction
    isPlaying: bool
