#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U ${POSTGRES_USER:-snakearena}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready!"

echo "Initializing database..."
uv run python -c "from src.db.database import init_db; init_db(); print('Database initialized successfully!')"

echo "Starting FastAPI application..."
exec uv run uvicorn src.main:app --host 0.0.0.0 --port 8000
