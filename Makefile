# Snake Arena Live Makefile
.PHONY: help install dev dev-backend dev-frontend build test clean seed-data

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
