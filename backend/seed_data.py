#!/usr/bin/env python3
"""
Seed script to populate the database with fake data for testing.
Run this with: uv run python seed_data.py
"""

import sys
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from src.core.security import get_password_hash
from src.db import session as db_session
from src.db.database import SessionLocal, engine, init_db
from src.db.models import Base, LeaderboardEntry, User

# Test users to create
TEST_USERS = [
    {"email": "admin@example.com", "password": "password123", "username": "Admin", "is_superuser": True},
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
    print("🗑️  dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("🔨 Creating tables...")
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
                # Create user manually to set is_superuser if needed
                new_user = User(
                    username=user["username"],
                    email=user["email"],
                    hashed_password=hashed_password,
                    is_superuser=user.get("is_superuser", False)
                )
                db.add(new_user)
                try:
                    db.commit()
                    db.refresh(new_user)
                    users_data.append(new_user)
                    print(f"✅ Created user: {user['username']} ({user['email']}) {'[ADMIN]' if new_user.is_superuser else ''}")
                except Exception as e:
                    db.rollback()
                    print(f"❌ Failed to create user {user['username']}: {e}")

        print()
        print(f"📊 Total users: {len(users_data)}")
        print()

        # 2. Submit scores for users
        score_idx = 0
        total_scores = 0
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
                    total_scores += 1
                    print(f"✅ Added score for {user.username}: {score} ({mode})")
                except Exception as e:
                    print(f"❌ Failed to add score for {user.username}: {e}")

        print()
        print("✨ Seeding complete!")
        print()

        # 3. Verification
        print("🔍 Verifying data integrity...")
        user_count = db.query(User).count()
        score_count = db.query(LeaderboardEntry).count()

        if user_count == len(TEST_USERS):
            print(f"✅ User count verified: {user_count}")
        else:
            print(f"❌ User count mismatch: Expected {len(TEST_USERS)}, got {user_count}")

        print(f"📊 Total scores in DB: {score_count}")

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
        print("  - admin@example.com / password123 [ADMIN]")

    finally:
        db.close()

if __name__ == "__main__":
    main()
