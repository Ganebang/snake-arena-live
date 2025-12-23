#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h ${POSTGRES_HOST:-postgres} -p 5432 -U ${POSTGRES_USER:-snakearena}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready!"

cd /app/backend

echo "Initializing database..."
uv run python -c "from src.db.database import init_db; init_db(); print('Database initialized successfully!')"

echo "Creating supervisor log directory..."
mkdir -p /var/log/supervisor

echo "Starting services via supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
