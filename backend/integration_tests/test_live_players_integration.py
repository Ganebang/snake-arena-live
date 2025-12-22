"""
Integration tests for live player endpoints.
Tests retrieving live players and individual player data during active games.
"""
import pytest
from src.core.config import settings
from src.schemas.game import LivePlayer, Position
from src.schemas.enums import GameMode, Direction
from src.db import session as db_session


class TestLivePlayersIntegration:
    """Integration tests for live players functionality."""
    
    def test_get_live_players_empty(self, client):
        """Test getting live players when no players are active."""
        response = client.get(f"{settings.API_V1_STR}/live-players")
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_get_live_players_with_active_players(self, client):
        """Test getting all active live players."""
        # Add live players to cache
        player1 = LivePlayer(
            id="p1",
            username="player1",
            score=100,
            mode=GameMode.walls,
            snake=[Position(x=10, y=10), Position(x=11, y=10)],
            food=Position(x=20, y=15),
            direction=Direction.RIGHT,
            isPlaying=True
        )
        player2 = LivePlayer(
            id="p2",
            username="player2",
            score=200,
            mode=GameMode.pass_through,
            snake=[Position(x=5, y=5)],
            food=Position(x=15, y=15),
            direction=Direction.UP,
            isPlaying=True
        )
        
        db_session.update_live_player(player1)
        db_session.update_live_player(player2)
        
        # Get all live players
        response = client.get(f"{settings.API_V1_STR}/live-players")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        
        # Verify player data
        player_ids = {p["id"] for p in data}
        assert "p1" in player_ids
        assert "p2" in player_ids
    
    def test_get_specific_live_player(self, client):
        """Test retrieving a specific live player by ID."""
        # Add a live player
        player = LivePlayer(
            id="specific-player",
            username="specificPlayer",
            score=150,
            mode=GameMode.walls,
            snake=[Position(x=12, y=8), Position(x=12, y=7), Position(x=12, y=6)],
            food=Position(x=18, y=18),
            direction=Direction.DOWN,
            isPlaying=True
        )
        db_session.update_live_player(player)
        
        # Get specific player
        response = client.get(f"{settings.API_V1_STR}/live-players/specific-player")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "specific-player"
        assert data["username"] == "specificPlayer"
        assert data["score"] == 150
        assert data["mode"] == "walls"
        assert len(data["snake"]) == 3
        assert data["snake"][0]["x"] == 12
        assert data["snake"][0]["y"] == 8
        assert data["food"]["x"] == 18
        assert data["food"]["y"] == 18
        assert data["direction"] == "DOWN"
        assert data["isPlaying"] is True
    
    def test_get_nonexistent_live_player(self, client):
        """Test that getting a non-existent player returns 404."""
        response = client.get(f"{settings.API_V1_STR}/live-players/nonexistent-id")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_live_player_walls_mode(self, client):
        """Test live player in walls game mode."""
        player = LivePlayer(
            id="walls-player",
            username="wallsPlayer",
            score=250,
            mode=GameMode.walls,
            snake=[Position(x=15, y=15), Position(x=14, y=15)],
            food=Position(x=25, y=25),
            direction=Direction.LEFT,
            isPlaying=True
        )
        db_session.update_live_player(player)
        
        response = client.get(f"{settings.API_V1_STR}/live-players/walls-player")
        
        assert response.status_code == 200
        data = response.json()
        assert data["mode"] == "walls"
        assert data["isPlaying"] is True
    
    def test_live_player_pass_through_mode(self, client):
        """Test live player in pass-through game mode."""
        player = LivePlayer(
            id="passthrough-player",
            username="passthroughPlayer",
            score=300,
            mode=GameMode.pass_through,
            snake=[Position(x=20, y=20)],
            food=Position(x=10, y=10),
            direction=Direction.UP,
            isPlaying=True
        )
        db_session.update_live_player(player)
        
        response = client.get(f"{settings.API_V1_STR}/live-players/passthrough-player")
        
        assert response.status_code == 200
        data = response.json()
        assert data["mode"] == "pass-through"
        assert data["isPlaying"] is True
    
    def test_live_player_with_long_snake(self, client):
        """Test live player with a longer snake."""
        snake_positions = [Position(x=i, y=10) for i in range(10)]
        
        player = LivePlayer(
            id="long-snake",
            username="longSnake",
            score=500,
            mode=GameMode.walls,
            snake=snake_positions,
            food=Position(x=30, y=30),
            direction=Direction.RIGHT,
            isPlaying=True
        )
        db_session.update_live_player(player)
        
        response = client.get(f"{settings.API_V1_STR}/live-players/long-snake")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["snake"]) == 10
        assert data["score"] == 500
    
    def test_live_player_not_playing(self, client):
        """Test live player who is not currently playing (game over)."""
        player = LivePlayer(
            id="game-over",
            username="gameOver",
            score=175,
            mode=GameMode.walls,
            snake=[Position(x=5, y=5)],
            food=Position(x=10, y=10),
            direction=Direction.LEFT,
            isPlaying=False
        )
        db_session.update_live_player(player)
        
        response = client.get(f"{settings.API_V1_STR}/live-players/game-over")
        
        assert response.status_code == 200
        data = response.json()
        assert data["isPlaying"] is False
    
    def test_update_live_player(self, client):
        """Test that updating a live player works correctly."""
        # Add initial player
        player1 = LivePlayer(
            id="update-test",
            username="updateTest",
            score=100,
            mode=GameMode.walls,
            snake=[Position(x=10, y=10)],
            food=Position(x=15, y=15),
            direction=Direction.RIGHT,
            isPlaying=True
        )
        db_session.update_live_player(player1)
        
        # Update the same player with new data
        player2 = LivePlayer(
            id="update-test",
            username="updateTest",
            score=150,  # Score increased
            mode=GameMode.walls,
            snake=[Position(x=11, y=10), Position(x=10, y=10)],  # Snake grew
            food=Position(x=20, y=20),  # New food position
            direction=Direction.RIGHT,
            isPlaying=True
        )
        db_session.update_live_player(player2)
        
        # Verify the update
        response = client.get(f"{settings.API_V1_STR}/live-players/update-test")
        
        assert response.status_code == 200
        data = response.json()
        assert data["score"] == 150
        assert len(data["snake"]) == 2
        assert data["food"]["x"] == 20
    
    def test_multiple_players_different_modes(self, client):
        """Test multiple players playing in different game modes."""
        players = [
            LivePlayer(
                id=f"player-{i}",
                username=f"player{i}",
                score=i * 100,
                mode=GameMode.walls if i % 2 == 0 else GameMode.pass_through,
                snake=[Position(x=i*5, y=i*5)],
                food=Position(x=i*10, y=i*10),
                direction=Direction.RIGHT,
                isPlaying=True
            )
            for i in range(5)
        ]
        
        for player in players:
            db_session.update_live_player(player)
        
        # Get all players
        response = client.get(f"{settings.API_V1_STR}/live-players")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        
        # Verify mode distribution
        walls_count = sum(1 for p in data if p["mode"] == "walls")
        passthrough_count = sum(1 for p in data if p["mode"] == "pass-through")
        assert walls_count == 3
        assert passthrough_count == 2
    
    def test_live_player_directions(self, client):
        """Test that all direction types are handled correctly."""
        directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT]
        
        for i, direction in enumerate(directions):
            player = LivePlayer(
                id=f"dir-{i}",
                username=f"dirPlayer{i}",
                score=100,
                mode=GameMode.walls,
                snake=[Position(x=10, y=10)],
                food=Position(x=15, y=15),
                direction=direction,
                isPlaying=True
            )
            db_session.update_live_player(player)
        
        # Verify all players
        response = client.get(f"{settings.API_V1_STR}/live-players")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4
        
        # Verify each direction is present
        directions_in_response = {p["direction"] for p in data}
        assert "UP" in directions_in_response
        assert "DOWN" in directions_in_response
        assert "LEFT" in directions_in_response
        assert "RIGHT" in directions_in_response
