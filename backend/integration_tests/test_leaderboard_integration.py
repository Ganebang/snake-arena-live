"""
Integration tests for leaderboard endpoints.
Tests score submission, leaderboard retrieval, and high score queries.
"""
from src.core.config import settings


class TestLeaderboardIntegration:
    """Integration tests for leaderboard functionality."""

    def test_submit_score_walls_mode(self, client):
        """Test submitting a score in walls mode."""
        # Create user and get token
        signup_data = {
            "email": "player1@example.com",
            "password": "password",
            "username": "player1"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Submit score
        score_data = {"score": 150, "mode": "walls"}
        response = client.post(
            f"{settings.API_V1_STR}/leaderboard",
            json=score_data,
            headers=headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["score"] == 150
        assert data["mode"] == "walls"
        assert data["username"] == "player1"
        assert "id" in data
        assert "createdAt" in data

    def test_submit_score_pass_through_mode(self, client):
        """Test submitting a score in pass-through mode."""
        # Create user and get token
        signup_data = {
            "email": "player2@example.com",
            "password": "password",
            "username": "player2"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Submit score
        score_data = {"score": 200, "mode": "pass-through"}
        response = client.post(
            f"{settings.API_V1_STR}/leaderboard",
            json=score_data,
            headers=headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["score"] == 200
        assert data["mode"] == "pass-through"
        assert data["username"] == "player2"

    def test_submit_score_requires_authentication(self, client):
        """Test that submitting a score requires authentication."""
        score_data = {"score": 100, "mode": "walls"}
        response = client.post(
            f"{settings.API_V1_STR}/leaderboard",
            json=score_data
        )

        assert response.status_code == 401

    def test_get_leaderboard_all_modes(self, client):
        """Test retrieving leaderboard without mode filter shows all entries."""
        # Create two users with different scores
        for i in range(2):
            signup_data = {
                "email": f"player{i}@example.com",
                "password": "password",
                "username": f"player{i}"
            }
            response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
            token = response.json()["token"]
            headers = {"Authorization": f"Bearer {token}"}

            # Submit scores for both modes
            client.post(
                f"{settings.API_V1_STR}/leaderboard",
                json={"score": (i + 1) * 100, "mode": "walls"},
                headers=headers
            )
            client.post(
                f"{settings.API_V1_STR}/leaderboard",
                json={"score": (i + 1) * 50, "mode": "pass-through"},
                headers=headers
            )

        # Get all leaderboard entries
        response = client.get(f"{settings.API_V1_STR}/leaderboard")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4  # 2 users * 2 modes
        # Verify ordering (highest score first)
        assert data[0]["score"] >= data[1]["score"]

    def test_get_leaderboard_filtered_by_walls_mode(self, client):
        """Test retrieving leaderboard filtered by walls mode."""
        # Create users and submit scores
        for i in range(3):
            signup_data = {
                "email": f"walls{i}@example.com",
                "password": "password",
                "username": f"walls{i}"
            }
            response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
            token = response.json()["token"]
            headers = {"Authorization": f"Bearer {token}"}

            # Submit score for walls mode
            client.post(
                f"{settings.API_V1_STR}/leaderboard",
                json={"score": (3 - i) * 100, "mode": "walls"},
                headers=headers
            )

        # Get walls mode leaderboard
        response = client.get(f"{settings.API_V1_STR}/leaderboard?mode=walls")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert all(entry["mode"] == "walls" for entry in data)
        # Verify ordering (highest score first)
        assert data[0]["score"] == 300
        assert data[1]["score"] == 200
        assert data[2]["score"] == 100

    def test_get_leaderboard_filtered_by_pass_through_mode(self, client):
        """Test retrieving leaderboard filtered by pass-through mode."""
        # Create user and submit scores
        signup_data = {
            "email": "passthrough@example.com",
            "password": "password",
            "username": "passthrough"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Submit scores for different modes
        client.post(
            f"{settings.API_V1_STR}/leaderboard",
            json={"score": 100, "mode": "walls"},
            headers=headers
        )
        client.post(
            f"{settings.API_V1_STR}/leaderboard",
            json={"score": 250, "mode": "pass-through"},
            headers=headers
        )

        # Get pass-through mode leaderboard
        response = client.get(f"{settings.API_V1_STR}/leaderboard?mode=pass-through")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["mode"] == "pass-through"
        assert data[0]["score"] == 250

    def test_get_high_score_for_user(self, client):
        """Test retrieving the highest score for a specific user."""
        # Create user
        signup_data = {
            "email": "highscore@example.com",
            "password": "password",
            "username": "highscore"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        user_id = response.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}

        # Submit multiple scores
        scores = [100, 250, 175, 300, 150]
        for score in scores:
            client.post(
                f"{settings.API_V1_STR}/leaderboard",
                json={"score": score, "mode": "walls"},
                headers=headers
            )

        # Get high score
        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=walls"
        )

        assert response.status_code == 200
        assert response.json()["score"] == 300

    def test_get_high_score_for_user_no_scores(self, client):
        """Test getting high score for user with no scores returns 0."""
        # Create user
        signup_data = {
            "email": "noscore@example.com",
            "password": "password",
            "username": "noscore"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        user_id = response.json()["user"]["id"]

        # Get high score (should be 0)
        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=walls"
        )

        assert response.status_code == 200
        assert response.json()["score"] == 0

    def test_get_high_score_filtered_by_mode(self, client):
        """Test getting high score filtered by specific game mode."""
        # Create user
        signup_data = {
            "email": "multimode@example.com",
            "password": "password",
            "username": "multimode"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        user_id = response.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}

        # Submit scores for different modes
        client.post(
            f"{settings.API_V1_STR}/leaderboard",
            json={"score": 150, "mode": "walls"},
            headers=headers
        )
        client.post(
            f"{settings.API_V1_STR}/leaderboard",
            json={"score": 400, "mode": "pass-through"},
            headers=headers
        )

        # Get high score for walls mode
        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=walls"
        )
        assert response.json()["score"] == 150

        # Get high score for pass-through mode
        response = client.get(
            f"{settings.API_V1_STR}/leaderboard/high-score?userId={user_id}&mode=pass-through"
        )
        assert response.json()["score"] == 400

    def test_leaderboard_ordering(self, client):
        """Test that leaderboard entries are correctly ordered by score (descending)."""
        # Create multiple users with varying scores
        expected_scores = [500, 300, 200, 100, 50]

        for i, score in enumerate(expected_scores):
            signup_data = {
                "email": f"order{i}@example.com",
                "password": "password",
                "username": f"order{i}"
            }
            response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
            token = response.json()["token"]
            headers = {"Authorization": f"Bearer {token}"}

            client.post(
                f"{settings.API_V1_STR}/leaderboard",
                json={"score": score, "mode": "walls"},
                headers=headers
            )

        # Get leaderboard
        response = client.get(f"{settings.API_V1_STR}/leaderboard?mode=walls")
        data = response.json()

        # Verify ordering
        actual_scores = [entry["score"] for entry in data]
        assert actual_scores == expected_scores
