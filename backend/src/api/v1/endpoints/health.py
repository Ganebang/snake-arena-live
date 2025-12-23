"""
Health check endpoints for monitoring service status.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.db.database import SessionLocal

router = APIRouter()


def get_db():
    """Database dependency for health checks."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/health")
async def health_check():
    """
    Basic health check endpoint (liveness probe).

    Returns 200 OK if the service is running.
    Used by load balancers and orchestrators to check if the service is alive.
    """
    return {
        "status": "healthy",
        "service": "snake-arena-api"
    }


@router.get("/health/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness check endpoint.

    Returns 200 OK if the service is ready to handle requests.
    Checks database connectivity.
    Used by orchestrators to know when to start routing traffic.
    """
    try:
        # Check database connection
        db.execute(text("SELECT 1"))

        return {
            "status": "ready",
            "service": "snake-arena-api",
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service not ready: Database connection failed - {str(e)}"
        ) from e
