"""
Integration tests for authentication endpoints.
Tests signup, login, logout, and current user retrieval.
"""
import pytest
from src.core.config import settings


class TestAuthIntegration:
    """Integration tests for the authentication flow."""
    
    def test_signup_creates_user(self, client):
        """Test that signup creates a new user and returns a token."""
        signup_data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "username": "newuser"
        }
        
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        
        assert response.status_code == 201
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "newuser@example.com"
        assert data["user"]["username"] == "newuser"
        assert "id" in data["user"]
        assert "createdAt" in data["user"]
    
    def test_signup_duplicate_email_fails(self, client):
        """Test that signup fails when email is already registered."""
        signup_data = {
            "email": "duplicate@example.com",
            "password": "password123",
            "username": "user1"
        }
        
        # First signup succeeds
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        assert response.status_code == 201
        
        # Second signup with same email fails
        signup_data["username"] = "user2"
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_login_with_valid_credentials(self, client):
        """Test that login works with valid credentials."""
        # First create a user
        signup_data = {
            "email": "loginuser@example.com",
            "password": "MyPassword123",
            "username": "loginuser"
        }
        client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        
        # Now login
        login_data = {
            "email": "loginuser@example.com",
            "password": "MyPassword123"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "loginuser@example.com"
    
    def test_login_with_invalid_email(self, client):
        """Test that login fails with non-existent email."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "invalid credentials" in response.json()["detail"].lower()
    
    def test_login_with_wrong_password(self, client):
        """Test that login fails with incorrect password."""
        # Create a user
        signup_data = {
            "email": "wrongpass@example.com",
            "password": "CorrectPassword",
            "username": "wrongpass"
        }
        client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        
        # Try to login with wrong password
        login_data = {
            "email": "wrongpass@example.com",
            "password": "WrongPassword"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "invalid credentials" in response.json()["detail"].lower()
    
    def test_get_current_user(self, client):
        """Test retrieving current user info with valid token."""
        # Signup
        signup_data = {
            "email": "currentuser@example.com",
            "password": "password123",
            "username": "currentuser"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        
        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get(f"{settings.API_V1_STR}/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "currentuser@example.com"
        assert data["username"] == "currentuser"
    
    def test_get_current_user_without_token(self, client):
        """Test that accessing /me without token fails."""
        response = client.get(f"{settings.API_V1_STR}/auth/me")
        
        assert response.status_code == 401
    
    def test_get_current_user_with_invalid_token(self, client):
        """Test that accessing /me with invalid token fails."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get(f"{settings.API_V1_STR}/auth/me", headers=headers)
        
        assert response.status_code == 401
    
    def test_logout_endpoint(self, client):
        """Test that logout endpoint is accessible with valid token."""
        # Signup
        signup_data = {
            "email": "logoutuser@example.com",
            "password": "password123",
            "username": "logoutuser"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        token = response.json()["token"]
        
        # Logout
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post(f"{settings.API_V1_STR}/auth/logout", headers=headers)
        
        assert response.status_code == 204
    
    def test_complete_auth_workflow(self, client):
        """Test complete authentication workflow: signup -> login -> me -> logout."""
        # 1. Signup
        signup_data = {
            "email": "workflow@example.com",
            "password": "WorkflowPass123",
            "username": "workflowuser"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/signup", json=signup_data)
        assert response.status_code == 201
        signup_token = response.json()["token"]
        user_id = response.json()["user"]["id"]
        
        # 2. Login with same credentials
        login_data = {
            "email": "workflow@example.com",
            "password": "WorkflowPass123"
        }
        response = client.post(f"{settings.API_V1_STR}/auth/login", json=login_data)
        assert response.status_code == 200
        login_token = response.json()["token"]
        
        # 3. Verify /me with login token
        headers = {"Authorization": f"Bearer {login_token}"}
        response = client.get(f"{settings.API_V1_STR}/auth/me", headers=headers)
        assert response.status_code == 200
        assert response.json()["id"] == user_id
        
        # 4. Logout
        response = client.post(f"{settings.API_V1_STR}/auth/logout", headers=headers)
        assert response.status_code == 204
