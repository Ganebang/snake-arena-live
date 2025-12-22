from fastapi.testclient import TestClient
import pytest
from src.main import app
from src.db.session import db_instance
from src.core.config import settings

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    # Reset database before each test
    db_instance.clear()

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Snake Arena API"}

def test_auth_workflow():
    # 1. Signup
    signup_data = {
        "email": "test@example.com",
        "password": "strongpassword",
        "username": "testuser"
    }
    response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == "test@example.com"
    token = data["token"]
    
    # 2. Login
    login_data = {
        "email": "test@example.com",
        "password": "strongpassword"
    }
    response = client.post(f"{settings.API_V1_STR}/auth/login", json=login_data)
    assert response.status_code == 200
    assert "token" in response.json()
    
    # 3. Get Me
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"{settings.API_V1_STR}/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_leaderboard():
    # Setup user
    signup_data = {"email": "player@example.com", "password": "pwd", "username": "player"}
    response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
    token = response.json()["token"]
    user_id = response.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Submit score
    score_data = {"score": 100, "mode": "walls"}
    response = client.post(f"{settings.API_V1_STR}/leaderboard", json=score_data, headers=headers)
    assert response.status_code == 201
    
    # Get leaderboard
    response = client.get(f"{settings.API_V1_STR}/leaderboard?mode=walls")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["score"] == 100
    
    # Get high score
    response = client.get(f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=walls")
    assert response.status_code == 200
    assert response.json()["score"] == 100

def test_live_players():
    # Manually add a live player to mock db for testing
    from src.schemas.game import LivePlayer, GameMode, Direction, Position
    
    player = LivePlayer(
        id="p1",
        username="live_player",
        score=50,
        mode=GameMode.walls,
        snake=[Position(x=10, y=10)],
        food=Position(x=20, y=20),
        direction=Direction.RIGHT,
        isPlaying=True
    )
    db_instance.update_live_player(player)
    
    # Get all players
    response = client.get(f"{settings.API_V1_STR}/live-players")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["username"] == "live_player"
    
    # Get specific player
    response = client.get(f"{settings.API_V1_STR}/live-players/p1")
    assert response.status_code == 200
    assert response.json()["id"] == "p1"
