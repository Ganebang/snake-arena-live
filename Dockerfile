# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Prepare Python backend
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS backend-base

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Copy backend dependency files
COPY backend/pyproject.toml backend/uv.lock ./

# Install backend dependencies
RUN uv sync --frozen --no-install-project

# Copy backend source
COPY backend/ ./

# Install the project itself
RUN uv sync --frozen

# Stage 3: Final unified image
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy uv binary from backend stage
COPY --from=backend-base /usr/local/bin/uv /usr/local/bin/uv

# Copy Python backend with virtual environment
COPY --from=backend-base /app/backend /app/backend

# Copy built frontend from frontend stage
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-unified.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Copy supervisord configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY entrypoint-unified.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80 for nginx
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/api/v1/health || exit 1

# Run entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
