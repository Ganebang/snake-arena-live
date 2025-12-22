from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.main import app
from src.db.models import Base
from src.db.database import get_db
from src.core.config import settings

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    """Override the database dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override the dependency
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_read_main():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Snake Arena API"}

def test_auth_workflow():
    """Test complete authentication workflow: signup, login, get user."""
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
    """Test leaderboard functionality: submit score and retrieve."""
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
