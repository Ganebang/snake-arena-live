# Docker Setup Guide for Snake Arena Live

This guide explains how to run the Snake Arena Live application using Docker Compose with PostgreSQL and a unified application container combining both the FastAPI backend and Nginx frontend.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

To verify your installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Set Up Environment Variables

Copy the example environment file and customize if needed:

```bash
cp .env.example .env
```

Edit `.env` to configure:
- PostgreSQL credentials
- Backend secret key (change for production!)
- CORS origins

### 2. Build Docker Images

Build all service images:

```bash
make docker-build
# or
docker-compose build
```

### 3. Start Services

Start all containers in detached mode:

```bash
make docker-up
# or
docker-compose up -d
```

The application will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api/v1

### 4. View Logs

Follow logs from all services:

```bash
make docker-logs-f
# or
docker-compose logs -f
```

View logs from a specific service:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 5. Stop Services

Stop all containers:

```bash
make docker-down
# or
docker-compose down
```

## Architecture

The Docker Compose setup includes two services:

### 1. PostgreSQL Database (`postgres`)
- **Image**: postgresql:17-alpine
- **Internal Port**: 5432
- **Exposed Port**: 5432 (for debugging)
- **Volume**: `postgres_data` for data persistence
- **Health Check**: Automatic health monitoring

### 2. Unified Application (`app`)
- **Built from**: `./Dockerfile` (multi-stage build)
- **Exposed Port**: 80
- **Dependencies**: Waits for PostgreSQL to be healthy
- **Process Manager**: Supervisord manages both services
- **Entrypoint**: Runs database initialization on startup
- **Components**:
  - **Nginx**: Serves static React frontend on port 80
  - **FastAPI Backend**: Runs on localhost:8000 (internal)
  - Nginx proxies `/api/*` requests to the FastAPI backend

**Benefits**:
- Simplified deployment with fewer containers
- Reduced resource overhead
- Production-ready setup with Nginx handling static files
- Built-in health checks

## Development Workflow

### Running Tests

Run backend tests inside the container:

```bash
make docker-test-backend
# or
docker-compose exec app bash -c "cd /app/backend && uv run pytest"
```

### Accessing Services

Open a shell in the app container:

```bash
make docker-shell-backend
# or
docker-compose exec app /bin/bash
```

Access PostgreSQL directly:

```bash
make docker-shell-db
# or
docker-compose exec postgres psql -U snakearena -d snakearena
```

### Seeding Data

To seed the database with test data, run:

```bash
docker-compose exec app bash -c "cd /app/backend && uv run python seed_data.py"
```

### Rebuilding After Code Changes

The unified container includes both frontend and backend, so any code changes require a rebuild:

```bash
docker-compose build app
docker-compose up -d app
```

For dependency changes or clean rebuild:
```bash
docker-compose build app --no-cache
docker-compose up -d
```

## Configuration

### Environment Variables

Key environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `snakearena` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `snakearena_dev_password` |
| `POSTGRES_DB` | Database name | `snakearena` |
| `SECRET_KEY` | Backend JWT secret | `development_secret_key...` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost,...` |

### Port Mapping

To change exposed ports, edit `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "8080:80"  # Change 8080 to your desired port
```

## Troubleshooting

### Services Won't Start

Check service status:
```bash
docker-compose ps
```

View detailed logs:
```bash
docker-compose logs app
docker-compose logs postgres
```

### Database Connection Issues

Ensure PostgreSQL is healthy:
```bash
docker-compose ps postgres
```

Check app logs for connection errors:
```bash
docker-compose logs app | grep -i error
```

### Port Already in Use

If port 80 is already in use, change the frontend port mapping in `docker-compose.yml` or stop the conflicting service.

### Resetting Everything

To completely reset (WARNING: deletes all data):

```bash
make docker-clean
# or
docker-compose down -v --rmi all
```

Then rebuild:
```bash
make docker-build
make docker-up
```

## Production Considerations

When deploying to production:

1. **Change Secrets**: Update `SECRET_KEY` and `POSTGRES_PASSWORD`
2. **Use HTTPS**: Configure reverse proxy with SSL certificates
3. **Resource Limits**: Add memory and CPU limits to services
4. **Backup Strategy**: Implement PostgreSQL backup procedures
5. **Logging**: Configure centralized logging
6. **Monitoring**: Add health checks and monitoring tools

Example production docker-compose additions:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1G
    restart: always
```

## Useful Commands

All available Docker commands:

```bash
make docker-build         # Build all images
make docker-up           # Start services
make docker-down         # Stop services
make docker-restart      # Restart services
make docker-logs         # View logs
make docker-logs-f       # Follow logs
make docker-clean        # Remove everything
make docker-shell-backend # Backend shell
make docker-shell-db     # PostgreSQL shell
make docker-test-backend # Run backend tests
```

## Development vs Docker

You can still develop locally without Docker:

```bash
# Local development (SQLite)
make install
make dev

# Dockerized (PostgreSQL)
make docker-build
make docker-up
```

Both approaches are supported and can coexist!
