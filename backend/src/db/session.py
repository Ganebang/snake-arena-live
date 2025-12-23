"""
Database session and CRUD operations using SQLAlchemy
"""

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from ..schemas.game import GameMode, LeaderboardEntry, LivePlayer
from ..schemas.user import User
from .models import GameModeEnum
from .models import LeaderboardEntry as LeaderboardEntryModel
from .models import User as UserModel

# Note: LivePlayer is not persisted to database (in-memory only for active games)
_live_players_cache: dict[str, LivePlayer] = {}

def create_user(db: Session, username: str, email: str, password_hash: str) -> User:
    """Create a new user in the database"""
    db_user = UserModel(
        username=username,
        email=email,
        hashed_password=password_hash
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return User(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        createdAt=db_user.created_at.isoformat()
    )

def get_user_by_email(db: Session, email: str) -> User | None:
    """Get user by email address"""
    db_user = db.query(UserModel).filter(UserModel.email == email).first()
    if not db_user:
        return None

    return User(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        createdAt=db_user.created_at.isoformat()
    )

def get_user_by_id(db: Session, user_id: str) -> User | None:
    """Get user by ID"""
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        return None

    return User(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        createdAt=db_user.created_at.isoformat()
    )

def get_password_hash(db: Session, user_id: str) -> str | None:
    """Get hashed password for a user"""
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    return db_user.hashed_password if db_user else None

def add_score(db: Session, user_id: str, username: str, score: int, mode: GameMode) -> LeaderboardEntry:
    """Add a new score to the leaderboard"""
    # Convert GameMode to GameModeEnum
    mode_enum = GameModeEnum(mode)

    db_entry = LeaderboardEntryModel(
        user_id=user_id,
        username=username,
        score=score,
        mode=mode_enum
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    return LeaderboardEntry(
        id=db_entry.id,
        userId=db_entry.user_id,
        username=db_entry.username,
        score=db_entry.score,
        mode=db_entry.mode.value,
        createdAt=db_entry.created_at.isoformat()
    )

def get_leaderboard(db: Session, mode: GameMode | None = None) -> list[LeaderboardEntry]:
    """Get leaderboard entries, optionally filtered by game mode"""
    query = db.query(LeaderboardEntryModel)

    if mode:
        mode_enum = GameModeEnum(mode)
        query = query.filter(LeaderboardEntryModel.mode == mode_enum)

    # Order by score descending
    query = query.order_by(desc(LeaderboardEntryModel.score))

    entries = query.all()

    return [
        LeaderboardEntry(
            id=entry.id,
            userId=entry.user_id,
            username=entry.username,
            score=entry.score,
            mode=entry.mode.value,
            createdAt=entry.created_at.isoformat()
        )
        for entry in entries
    ]

def get_user_high_score(db: Session, user_id: str, mode: GameMode | None = None) -> int:
    """Get the highest score for a user, optionally filtered by game mode"""
    query = db.query(func.max(LeaderboardEntryModel.score)).filter(
        LeaderboardEntryModel.user_id == user_id
    )

    if mode:
        mode_enum = GameModeEnum(mode)
        query = query.filter(LeaderboardEntryModel.mode == mode_enum)

    result = query.scalar()
    return result if result is not None else 0

# Live players functions (in-memory, not persisted)
def get_live_players() -> list[LivePlayer]:
    """Get all live players"""
    return list(_live_players_cache.values())

def get_live_player(player_id: str) -> LivePlayer | None:
    """Get a specific live player by ID"""
    return _live_players_cache.get(player_id)

def update_live_player(player: LivePlayer):
    """Update or add a live player"""
    _live_players_cache[player.id] = player

def remove_live_player(player_id: str):
    """Remove a live player"""
    if player_id in _live_players_cache:
        del _live_players_cache[player_id]

def clear_live_players():
    """Clear all live players"""
    _live_players_cache.clear()
