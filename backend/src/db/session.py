import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from ..schemas.user import User
from ..schemas.game import LeaderboardEntry, LivePlayer, GameMode, Position, Direction

class MockDatabase:
    def __init__(self):
        self.users: Dict[str, User] = {}  # id -> User
        self.users_by_email: Dict[str, User] = {} # email -> User
        self.passwords: Dict[str, str] = {} # user_id -> hashed_password
        self.leaderboard: List[LeaderboardEntry] = []
        self.live_players: Dict[str, LivePlayer] = {}

    def create_user(self, username: str, email: str, password_hash: str) -> User:
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            username=username,
            email=email,
            createdAt=datetime.now(timezone.utc)
        )
        self.users[user_id] = user
        self.users_by_email[email] = user
        self.passwords[user_id] = password_hash
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.users_by_email.get(email)
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)

    def get_password_hash(self, user_id: str) -> Optional[str]:
        return self.passwords.get(user_id)

    def add_score(self, user_id: str, username: str, score: int, mode: GameMode) -> LeaderboardEntry:
        entry = LeaderboardEntry(
            id=str(uuid.uuid4()),
            userId=user_id,
            username=username,
            score=score,
            mode=mode,
            createdAt=datetime.now(timezone.utc)
        )
        self.leaderboard.append(entry)
        return entry

    def get_leaderboard(self, mode: Optional[GameMode] = None) -> List[LeaderboardEntry]:
        if mode:
            return [entry for entry in self.leaderboard if entry.mode == mode]
        return self.leaderboard

    def get_user_high_score(self, user_id: str, mode: Optional[GameMode] = None) -> int:
        scores = [entry.score for entry in self.leaderboard 
                 if entry.userId == user_id and (mode is None or entry.mode == mode)]
        return max(scores) if scores else 0

    def get_live_players(self) -> List[LivePlayer]:
        return list(self.live_players.values())

    def get_live_player(self, player_id: str) -> Optional[LivePlayer]:
        return self.live_players.get(player_id)

    def update_live_player(self, player: LivePlayer):
        self.live_players[player.id] = player

    def remove_live_player(self, player_id: str):
        if player_id in self.live_players:
            del self.live_players[player_id]

    def clear(self):
        self.users.clear()
        self.users_by_email.clear()
        self.passwords.clear()
        self.leaderboard.clear()
        self.live_players.clear()

# Global instance for mock persistence
db_instance = MockDatabase()

def get_db() -> MockDatabase:
    return db_instance
