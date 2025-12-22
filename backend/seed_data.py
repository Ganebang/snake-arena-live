#!/usr/bin/env python3
"""
Seed script to populate the backend with fake data for testing.
Run this with: uv run python seed_data.py
"""

import httpx
import asyncio
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

# Test users to create
TEST_USERS = [
    {"email": "alice@example.com", "password": "password123", "username": "Alice"},
    {"email": "bob@example.com", "password": "password123", "username": "Bob"},
    {"email": "charlie@example.com", "password": "password123", "username": "Charlie"},
    {"email": "diana@example.com", "password": "password123", "username": "Diana"},
    {"email": "eve@example.com", "password": "password123", "username": "Eve"},
    {"email": "frank@example.com", "password": "password123", "username": "Frank"},
    {"email": "grace@example.com", "password": "password123", "username": "Grace"},
    {"email": "hank@example.com", "password": "password123", "username": "Hank"},
]

# Scores to submit for each user (mode, score)
SCORES_DATA = [
    # Alice - Expert player
    ("walls", 450),
    ("walls", 380),
    ("pass-through", 520),
    
    # Bob - Good player
    ("walls", 320),
    ("pass-through", 410),
    
    # Charlie - Moderate player
    ("walls", 250),
    ("walls", 180),
    ("pass-through", 290),
    
    # Diana - High scorer
    ("walls", 500),
    ("pass-through", 600),
    
    # Eve - Beginner
    ("walls", 120),
    ("pass-through", 150),
    
    # Frank - Consistent player
    ("walls", 280),
    ("walls", 290),
    ("walls", 300),
    ("pass-through", 310),
    
    # Grace - Pass-through specialist
    ("pass-through", 550),
    ("pass-through", 590),
    ("walls", 200),
    
    # Hank - Walls specialist
    ("walls", 480),
    ("walls", 470),
    ("pass-through", 250),
]

async def main():
    async with httpx.AsyncClient() as client:
        print("🚀 Starting data seeding...")
        print()
        
        # 1. Create users and get their tokens
        tokens = []
        user_data = []
        
        for i, user in enumerate(TEST_USERS):
            try:
                response = await client.post(
                    f"{BASE_URL}/auth/signup",
                    json=user
                )
                
                if response.status_code == 201:
                    data = response.json()
                    tokens.append(data["token"])
                    user_data.append(data["user"])
                    print(f"✅ Created user: {user['username']} ({user['email']})")
                elif response.status_code == 400:
                    # User already exists, try to login
                    login_response = await client.post(
                        f"{BASE_URL}/auth/login",
                        json={"email": user["email"], "password": user["password"]}
                    )
                    if login_response.status_code == 200:
                        data = login_response.json()
                        tokens.append(data["token"])
                        user_data.append(data["user"])
                        print(f"✅ Logged in existing user: {user['username']} ({user['email']})")
                else:
                    print(f"❌ Failed to create user {user['username']}: {response.status_code}")
            except Exception as e:
                print(f"❌ Error creating user {user['username']}: {e}")
        
        print()
        print(f"📊 Created/loaded {len(tokens)} users")
        print()
        
        # 2. Submit scores for users
        score_idx = 0
        for i, user in enumerate(user_data):
            if i >= len(tokens):
                break
                
            # Calculate how many scores this user should submit
            scores_count = 3 if i < 3 else (4 if i == 5 else 2)
            if i == 6:
                scores_count = 3
            if i == 7:
                scores_count = 3
                
            for _ in range(scores_count):
                if score_idx >= len(SCORES_DATA):
                    break
                    
                mode, score = SCORES_DATA[score_idx]
                score_idx += 1
                
                try:
                    response = await client.post(
                        f"{BASE_URL}/leaderboard",
                        json={"score": score, "mode": mode},
                        headers={"Authorization": f"Bearer {tokens[i]}"}
                    )
                    
                    if response.status_code == 201:
                        print(f"✅ Added score for {user['username']}: {score} ({mode})")
                    else:
                        print(f"❌ Failed to add score for {user['username']}: {response.status_code}")
                except Exception as e:
                    print(f"❌ Error adding score for {user['username']}: {e}")
        
        print()
        print("✨ Seeding complete!")
        print()
        print("You can now test the following endpoints:")
        print(f"  - GET {BASE_URL}/leaderboard (all scores)")
        print(f"  - GET {BASE_URL}/leaderboard?mode=walls (walls mode only)")
        print(f"  - GET {BASE_URL}/leaderboard?mode=pass-through (pass-through mode only)")
        print(f"  - GET {BASE_URL}/live-players (currently empty, will be populated during gameplay)")
        print()
        print("Test credentials for login:")
        for user in TEST_USERS[:3]:
            print(f"  - {user['email']} / {user['password']}")

if __name__ == "__main__":
    asyncio.run(main())
