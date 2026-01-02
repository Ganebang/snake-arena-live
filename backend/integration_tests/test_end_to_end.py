"""
End-to-end integration tests that simulate complete user workflows.
Tests the full flow from signup to playing games and submitting scores.
"""
from src.core.config import settings
from src.db import session as db_session
from src.schemas.enums import Direction, GameMode
from src.schemas.game import LivePlayer, Position


class TestEndToEndWorkflow:
    """End-to-end integration tests simulating real user workflows."""

    def test_complete_game_workflow(self, client):
        """Test complete workflow: signup -> play game -> submit score -> check leaderboard."""
        # 1. User signs up
        signup_data = {
            "email": "gamer@example.com",
            "password": "GamerPass123",
            "username": "ProGamer"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        assert response.status_code == 201
        token = response.json()["token"]
        user_id = response.json()["user"]["id"]
        username = response.json()["user"]["username"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. User starts playing a game (simulate live player)
        live_player = LivePlayer(
            id=user_id,
            username=username,
            score=0,
            mode=GameMode.walls,
            snake=[Position(x=10, y=10)],
            food=Position(x=15, y=15),
            direction=Direction.RIGHT,
            isPlaying=True
        )
        db_session.update_live_player(live_player)

        # 3. Verify player is in live players list
        response = client.get(f"{settings.API_V1_STR}/live-players")
        assert response.status_code == 200
        live_players = response.json()
        assert len(live_players) == 1
        assert live_players[0]["username"] == username

        # 4. Simulate game progression (score increases)
        live_player.score = 350
        live_player.snake = [Position(x=i, y=10) for i in range(10, 17)]
        db_session.update_live_player(live_player)

        response = client.get(f"{settings.API_V1_STR}/live-players/{user_id}")
        assert response.json()["score"] == 350

        # 5. Game ends - user submits final score
        score_data = {"score": 350, "mode": "walls"}
        response = client.post(
            f"{settings.API_V1_STR}/leaderboard",
            json=score_data,
            headers=headers
        )
        assert response.status_code == 201

        # 6. Remove player from live players (game over)
        db_session.remove_live_player(user_id)
        response = client.get(f"{settings.API_V1_STR}/live-players")
        assert len(response.json()) == 0

        # 7. Check leaderboard to see the score
        response = client.get(f"{settings.API_V1_STR}/leaderboard?mode=walls")
        assert response.status_code == 200
        leaderboard = response.json()
        assert len(leaderboard) == 1
        assert leaderboard[0]["score"] == 350
        assert leaderboard[0]["username"] == username

        # 8. Verify high score
        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=walls"
        )
        assert response.json()["score"] == 350

    def test_multiple_users_competitive_gameplay(self, client):
        """Test multiple users competing on the leaderboard."""
        users = []

        # 1. Three users sign up
        for i in range(3):
            signup_data = {
                "email": f"competitor{i}@example.com",
                "password": "password",
                "username": f"Competitor{i}"
            }
            response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
            users.append({
                "id": response.json()["user"]["id"],
                "username": response.json()["user"]["username"],
                "token": response.json()["token"]
            })

        # 2. All users start playing simultaneously
        for user in users:
            live_player = LivePlayer(
                id=user["id"],
                username=user["username"],
                score=0,
                mode=GameMode.walls,
                snake=[Position(x=10, y=10)],
                food=Position(x=15, y=15),
                direction=Direction.RIGHT,
                isPlaying=True
            )
            db_session.update_live_player(live_player)

        # 3. Verify all players are live
        response = client.get(f"{settings.API_V1_STR}/live-players")
        assert len(response.json()) == 3

        # 4. Users achieve different scores and submit them
        scores = [450, 320, 480]  # Different final scores
        for user, score in zip(users, scores):
            headers = {"Authorization": f"Bearer {user['token']}"}
            score_data = {"score": score, "mode": "walls"}
            response = client.post(
                f"{settings.API_V1_STR}/leaderboard",
                json=score_data,
                headers=headers
            )
            assert response.status_code == 201

        # 5. Check leaderboard ordering (highest first)
        response = client.get(f"{settings.API_V1_STR}/leaderboard?mode=walls")
        leaderboard = response.json()
        assert len(leaderboard) == 3
        assert leaderboard[0]["score"] == 480  # Highest
        assert leaderboard[1]["score"] == 450
        assert leaderboard[2]["score"] == 320  # Lowest

    def test_user_plays_multiple_games(self, client):
        """Test user playing multiple games and improving their high score."""
        # 1. User signs up
        signup_data = {
            "email": "persistent@example.com",
            "password": "password",
            "username": "PersistentPlayer"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        user_id = response.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Play first game - score 100
        score_data = {"score": 100, "mode": "walls"}
        client.post(f"{settings.API_V1_STR}/leaderboard", json=score_data, headers=headers)

        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=walls"
        )
        assert response.json()["score"] == 100

        # 3. Play second game - score 250 (improvement)
        score_data = {"score": 250, "mode": "walls"}
        client.post(f"{settings.API_V1_STR}/leaderboard", json=score_data, headers=headers)

        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=walls"
        )
        assert response.json()["score"] == 250

        # 4. Play third game - score 180 (worse than high score)
        score_data = {"score": 180, "mode": "walls"}
        client.post(f"{settings.API_V1_STR}/leaderboard", json=score_data, headers=headers)

        # High score should still be 250
        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=walls"
        )
        assert response.json()["score"] == 250

        # 5. Verify all games are in leaderboard
        response = client.get(f"{settings.API_V1_STR}/leaderboard?mode=walls")
        user_entries = [e for e in response.json() if e["userId"] == user_id]
        assert len(user_entries) == 3

    def test_user_plays_both_game_modes(self, client):
        """Test user playing both walls and pass-through modes."""
        # 1. User signs up
        signup_data = {
            "email": "multimode@example.com",
            "password": "password",
            "username": "MultiModePlayer"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        user_id = response.json()["user"]["id"]
        username = response.json()["user"]["username"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Play walls mode
        db_session.update_live_player(LivePlayer(
            id=f"{user_id}-walls",
            username=username,
            score=200,
            mode=GameMode.walls,
            snake=[Position(x=10, y=10)],
            food=Position(x=15, y=15),
            direction=Direction.RIGHT,
            isPlaying=True
        ))

        score_data = {"score": 200, "mode": "walls"}
        client.post(f"{settings.API_V1_STR}/leaderboard", json=score_data, headers=headers)

        # 3. Play pass-through mode
        db_session.update_live_player(LivePlayer(
            id=f"{user_id}-passthrough",
            username=username,
            score=350,
            mode=GameMode.pass_through,
            snake=[Position(x=10, y=10)],
            food=Position(x=15, y=15),
            direction=Direction.UP,
            isPlaying=True
        ))

        score_data = {"score": 350, "mode": "pass-through"}
        client.post(f"{settings.API_V1_STR}/leaderboard", json=score_data, headers=headers)

        # 4. Verify high scores for each mode
        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=walls"
        )
        assert response.json()["score"] == 200

        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=pass-through"
        )
        assert response.json()["score"] == 350

        # 5. Verify both scores appear in their respective leaderboards
        response = client.get(f"{settings.API_V1_STR}/leaderboard?mode=walls")
        assert any(e["userId"] == user_id for e in response.json())

        response = client.get(f"{settings.API_V1_STR}/leaderboard?mode=pass-through")
        assert any(e["userId"] == user_id for e in response.json())

    def test_authentication_required_for_score_submission(self, client):
        """Test that unauthenticated users cannot submit scores."""
        # Try to submit score without authentication
        score_data = {"score": 100, "mode": "walls"}
        response = client.post(f"{settings.API_V1_STR}/leaderboard", json=score_data)

        assert response.status_code == 401

    def test_live_player_isolation(self, client):
        """Test that live player data is isolated between different games."""
        # Create two users
        user1_data = {
            "email": "user1@example.com",
            "password": "password",
            "username": "User1"
        }
        user2_data = {
            "email": "user2@example.com",
            "password": "password",
            "username": "User2"
        }

        response1 = client.post(f"{settings.API_V1_STR}/auth/signup", json=user1_data)
        response2 = client.post(f"{settings.API_V1_STR}/auth/signup", json=user2_data)

        user1_id = response1.json()["user"]["id"]
        user2_id = response2.json()["user"]["id"]

        # Both users start playing
        db_session.update_live_player(LivePlayer(
            id=user1_id,
            username="User1",
            score=100,
            mode=GameMode.walls,
            snake=[Position(x=5, y=5)],
            food=Position(x=10, y=10),
            direction=Direction.RIGHT,
            isPlaying=True
        ))

        db_session.update_live_player(LivePlayer(
            id=user2_id,
            username="User2",
            score=200,
            mode=GameMode.pass_through,
            snake=[Position(x=15, y=15)],
            food=Position(x=20, y=20),
            direction=Direction.LEFT,
            isPlaying=True
        ))

        # Verify each player's data is separate
        response = client.get(f"{settings.API_V1_STR}/live-players/{user1_id}")
        user1_data = response.json()
        assert user1_data["score"] == 100
        assert user1_data["mode"] == "walls"

        response = client.get(f"{settings.API_V1_STR}/live-players/{user2_id}")
        user2_data = response.json()
        assert user2_data["score"] == 200
        assert user2_data["mode"] == "pass-through"

    def test_session_persistence_after_game(self, client):
        """Test that user session persists after playing a game."""
        # 1. User signs up
        signup_data = {
            "email": "persistent_session@example.com",
            "password": "password",
            "username": "SessionUser"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Play and submit score
        score_data = {"score": 150, "mode": "walls"}
        client.post(f"{settings.API_V1_STR}/leaderboard", json=score_data, headers=headers)

        # 3. Verify user can still access their profile
        response = client.get(f"{settings.API_V1_STR}/auth/me", headers=headers)
        assert response.status_code == 200
        assert response.json()["email"] == "persistent_session@example.com"

        # 4. User can play another game
        score_data = {"score": 200, "mode": "walls"}
        response = client.post(
            f"{settings.API_V1_STR}/leaderboard",
            json=score_data,
            headers=headers
        )
        assert response.status_code == 201
