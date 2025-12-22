# Integration Tests

This directory contains comprehensive integration tests for the Snake Arena Live backend API.

## Overview

The integration tests use **SQLite in-memory databases** to provide fast, isolated testing without requiring a PostgreSQL instance. Each test function gets a fresh database, ensuring complete isolation between tests.

## Test Structure

- `conftest.py` - Pytest fixtures and configuration
- `test_auth_integration.py` - Authentication flow tests (signup, login, logout, /me)
- `test_leaderboard_integration.py` - Leaderboard functionality tests (score submission, retrieval, filtering)
- `test_live_players_integration.py` - Live player endpoint tests (real-time game state)
- `test_end_to_end.py` - Complete user workflow tests (signup → play → submit score → leaderboard)

## Running Tests

### Run all integration tests:
```bash
cd backend
pytest integration_tests/ -v
```

### Run a specific test file:
```bash
pytest integration_tests/test_auth_integration.py -v
```

### Run a specific test:
```bash
pytest integration_tests/test_auth_integration.py::TestAuthIntegration::test_signup_creates_user -v
```

### Run with coverage:
```bash
pytest integration_tests/ --cov=src --cov-report=html
```

## Test Coverage

### Authentication Tests (test_auth_integration.py)
- ✅ User signup with valid credentials
- ✅ Duplicate email prevention
- ✅ Login with valid credentials
- ✅ Login failure scenarios (wrong email, wrong password)
- ✅ Current user retrieval with valid token
- ✅ Authentication failure scenarios (no token, invalid token)
- ✅ Logout functionality
- ✅ Complete auth workflow

### Leaderboard Tests (test_leaderboard_integration.py)
- ✅ Score submission for both game modes (walls, pass-through)
- ✅ Authentication requirement for score submission
- ✅ Leaderboard retrieval (all modes and filtered)
- ✅ Leaderboard ordering by score (descending)
- ✅ High score queries per user and per mode
- ✅ Multiple scores per user tracking

### Live Players Tests (test_live_players_integration.py)
- ✅ Retrieving all live players
- ✅ Retrieving specific player by ID
- ✅ Handling non-existent players (404)
- ✅ Both game modes (walls and pass-through)
- ✅ All snake directions (UP, DOWN, LEFT, RIGHT)
- ✅ Snake with multiple segments
- ✅ Player game state (isPlaying flag)
- ✅ Updating live player data
- ✅ Multiple simultaneous players

### End-to-End Tests (test_end_to_end.py)
- ✅ Complete game workflow (signup → play → submit score → check leaderboard)
- ✅ Multiple users competing simultaneously
- ✅ User playing multiple games with score progression
- ✅ User playing both game modes
- ✅ Authentication enforcement
- ✅ Live player data isolation
- ✅ Session persistence across gameplay

## Database Setup

Each test function receives a fresh SQLite in-memory database through the `test_db` and `client` fixtures defined in `conftest.py`. This ensures:

1. **Fast execution** - In-memory databases are extremely fast
2. **Complete isolation** - Each test starts with a clean slate
3. **No external dependencies** - No need for PostgreSQL during testing
4. **Automatic cleanup** - Databases are destroyed after each test

## Live Player Cache

The live players feature uses an in-memory cache (`_live_players_cache` in `src/db/session.py`) that is cleared between tests to ensure isolation.

## Continuous Integration

These tests are designed to run in CI/CD pipelines without requiring external database services. The SQLite in-memory approach makes them ideal for:

- Pre-commit hooks
- Pull request validation
- Continuous integration builds
- Local development testing

## Notes

- All tests use the test client provided by FastAPI's `TestClient`
- Database dependency injection is overridden to use the test database
- JWT tokens are generated and validated during authentication tests
- The `settings` object is used to reference API endpoints consistently
