#!/usr/bin/env python3
"""
Seed script to populate the database with fake data for testing.
Run this with: uv run python seed_data.py
"""

import sys
import os
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from src.db.database import SessionLocal, init_db
from src.db import session as db_session
from src.core.security import get_password_hash

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

def main():
    print("🚀 Starting data seeding...")
    print()
    
    # Initialize database
    init_db()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # 1. Create users and collect their data
        users_data = []
        
        for user in TEST_USERS:
            # Check if user already exists
            existing_user = db_session.get_user_by_email(db, user["email"])
            
            if existing_user:
                print(f"✅ User already exists: {user['username']} ({user['email']})")
                users_data.append(existing_user)
            else:
                # Create new user
                hashed_password = get_password_hash(user["password"])
                new_user = db_session.create_user(
                    db, 
                    user["username"], 
                    user["email"], 
                    hashed_password
                )
                users_data.append(new_user)
                print(f"✅ Created user: {user['username']} ({user['email']})")
        
        print()
        print(f"📊 Total users: {len(users_data)}")
        print()
        
        # 2. Submit scores for users
        score_idx = 0
        for i, user in enumerate(users_data):
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
                    entry = db_session.add_score(db, user.id, user.username, score, mode)
                    print(f"✅ Added score for {user.username}: {score} ({mode})")
                except Exception as e:
                    print(f"❌ Failed to add score for {user.username}: {e}")
        
        print()
        print("✨ Seeding complete!")
        print()
        print("You can now test the following endpoints:")
        print("  - GET http://localhost:8000/api/v1/leaderboard (all scores)")
        print("  - GET http://localhost:8000/api/v1/leaderboard?mode=walls (walls mode only)")
        print("  - GET http://localhost:8000/api/v1/leaderboard?mode=pass-through (pass-through mode only)")
        print("  - GET http://localhost:8000/api/v1/live-players (currently empty, will be populated during gameplay)")
        print()
        print("Test credentials for login:")
        for user in TEST_USERS[:3]:
            print(f"  - {user['email']} / {user['password']}")
            
    finally:
        db.close()

if __name__ == "__main__":
    main()
