# Snake Arena Live Makefile
.PHONY: help install dev dev-backend dev-frontend build test clean seed-data \
	docker-build docker-up docker-down docker-restart docker-logs docker-logs-f \
	docker-clean docker-shell-backend docker-shell-db docker-test-backend

# Default target - show help
help:
	@echo "Snake Arena Live - Available Commands"
	@echo "======================================"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install          - Install all dependencies (backend + frontend)"
	@echo "  make install-backend  - Install backend dependencies only"
	@echo "  make install-frontend - Install frontend dependencies only"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Run both backend and frontend servers concurrently"
	@echo "  make dev-backend      - Run backend server only (port 8000)"
	@echo "  make dev-frontend     - Run frontend server only (port 8080)"
	@echo "  make seed-data        - Populate backend with test data"
	@echo ""
	@echo "Testing:"
	@echo "  make test             - Run all tests (backend + frontend)"
	@echo "  make test-backend     - Run backend tests only"
	@echo "  make test-frontend    - Run frontend tests only"
	@echo ""
	@echo "Database:"
	@echo "  make db-init          - Initialize/create database tables"
	@echo "  make db-seed          - Seed database with test data"
	@echo "  make db-reset         - Reset database (deletes all data)"
	@echo "  make db-inspect       - Show database statistics"
	@echo ""
	@echo "Docker (Production/Containerized):"
	@echo "  make docker-build     - Build Docker images for all services"
	@echo "  make docker-up        - Start all services with Docker Compose"
	@echo "  make docker-down      - Stop all Docker services"
	@echo "  make docker-restart   - Restart all Docker services"
	@echo "  make docker-logs      - View logs from all services"
	@echo "  make docker-logs-f    - Follow logs from all services"
	@echo "  make docker-clean     - Remove containers, volumes, and images"
	@echo "  make docker-shell-backend  - Open shell in backend container"
	@echo "  make docker-shell-db  - Open PostgreSQL shell"
	@echo ""
	@echo "Build & Deployment:"
	@echo "  make build            - Build production bundles"
	@echo "  make build-frontend   - Build frontend for production"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            - Clean build artifacts and dependencies"
	@echo "  make lint             - Run linters for both projects"
	@echo "  make format           - Format code in both projects"

# Installation targets
install: install-backend install-frontend

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && uv sync

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Development servers
dev:
	@echo "Starting backend and frontend servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:8080"
	@echo "Press Ctrl+C to stop both servers"
	@$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	@echo "Starting backend server on http://localhost:8000..."
	cd backend && uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "Starting frontend server on http://localhost:8080..."
	cd frontend && npm run dev

# Seed database with test data
seed-data:
	@echo "Seeding database with test data..."
	cd backend && uv run python seed_data.py

# Testing
test: test-backend test-frontend

test-backend:
	@echo "Running backend tests..."
	cd backend && uv run pytest

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test

# Build for production
build: build-frontend

build-frontend:
	@echo "Building frontend for production..."
	cd frontend && npm run build

# Linting
lint: lint-backend lint-frontend

lint-backend:
	@echo "Linting backend code..."
	cd backend && uv run ruff check .

lint-frontend:
	@echo "Linting frontend code..."
	cd frontend && npm run lint

# Code formatting
format: format-backend format-frontend

format-backend:
	@echo "Formatting backend code..."
	cd backend && uv run ruff format .

format-frontend:
	@echo "Formatting frontend code..."
	cd frontend && npm run lint -- --fix

# Database management
db-init:
	@echo "Initializing database..."
	cd backend && uv run python -c "from src.db.database import init_db; init_db(); print('Database initialized!')"

db-seed:
	@echo "Seeding database with test data..."
	cd backend && uv run python seed_data.py

db-reset:
	@echo "Resetting database (WARNING: This will delete all data!)"
	rm -f backend/snake_arena.db
	@echo "Database reset complete. Run 'make db-init' to recreate."

db-inspect:
	@echo "Database contents:"
	@cd backend && sqlite3 snake_arena.db "SELECT 'Users: ' || COUNT(*) FROM users; SELECT 'Scores: ' || COUNT(*) FROM leaderboard_entries;"

# Clean artifacts
clean:
	@echo "Cleaning build artifacts and dependencies..."
	rm -rf backend/.venv
	rm -rf backend/__pycache__
	rm -rf backend/.pytest_cache
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	rm -rf frontend/.vite
	@echo "Clean complete!"

# Docker commands
docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting Docker services..."
	docker-compose up -d
	@echo ""
	@echo "Services are starting up!"
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost/api/v1"
	@echo "Run 'make docker-logs-f' to follow logs"

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

docker-restart:
	@echo "Restarting Docker services..."
	docker-compose restart

docker-logs:
	docker-compose logs

docker-logs-f:
	docker-compose logs -f

docker-clean:
	@echo "Cleaning Docker containers, volumes, and images..."
	docker-compose down -v --rmi all
	@echo "Docker cleanup complete!"

docker-shell-backend:
	@echo "Opening shell in backend container..."
	docker-compose exec backend /bin/bash

docker-shell-db:
	@echo "Opening PostgreSQL shell..."
	docker-compose exec postgres psql -U snakearena -d snakearena

docker-test-backend:
	@echo "Running backend tests in Docker..."
	docker-compose exec backend uv run pytest integration_tests/
