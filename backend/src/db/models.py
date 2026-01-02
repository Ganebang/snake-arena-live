"""
SQLAlchemy database models for Snake Arena Live
"""
import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Index, Integer, String
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    """Base class for all database models"""
    pass

class GameModeEnum(str, enum.Enum):
    """Game mode enumeration"""
    walls = "walls"
    pass_through = "pass-through"

class User(Base):
    """User model for authentication and user data"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"

class LeaderboardEntry(Base):
    """Leaderboard entry model for game scores"""
    __tablename__ = "leaderboard_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    username = Column(String(50), nullable=False)  # Denormalized for performance
    score = Column(Integer, nullable=False, index=True)
    mode = Column(Enum(GameModeEnum), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="leaderboard_entries")

    # Indexes for common queries
    __table_args__ = (
        Index('ix_leaderboard_mode_score', 'mode', 'score'),
        Index('ix_leaderboard_user_mode', 'user_id', 'mode'),
    )

    def __repr__(self):
        return f"<LeaderboardEntry(id={self.id}, username={self.username}, score={self.score}, mode={self.mode})>"
