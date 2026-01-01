"""
Pytest configuration for integration tests.
This sets up a test database using SQLite and provides fixtures.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.main import app
from src.db.database import get_db
from src.db.models import Base
from src.db.session import clear_live_players


# Create a test database engine using SQLite in-memory
@pytest.fixture(scope="function")
def test_db():
    """Create a fresh test database for each test."""
    # Use in-memory SQLite for fast tests
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Enable foreign key support for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session factory
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    yield TestingSessionLocal
    
    # Cleanup: Drop all tables after test
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(test_db):
    """Provide a database session for tests."""
    session = test_db()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client with a fresh database."""
    def override_get_db():
        session = test_db()
        try:
            yield session
        finally:
            session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Clear live players cache before each test
    clear_live_players()
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear overrides after test
    app.dependency_overrides.clear()
    clear_live_players()


@pytest.fixture(scope="function")
def auth_headers(client, db_session):
    """Create an authenticated user and return auth headers."""
    from src.core.security import get_password_hash
    from src.db import session as db_session_module
    
    # Create a test user
    user = db_session_module.create_user(
        db=db_session,
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("testpassword")
    )
    
    # Login to get token
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    
    assert response.status_code == 200
    token = response.json()["token"]
    
    return {"Authorization": f"Bearer {token}"}
