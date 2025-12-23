# Deploying Snake Arena Live to Render

This guide details how to deploy the Snake Arena Live unified container to [Render](https://render.com) using Infrastructure as Code (Blueprints).

## Prerequisites

1.  A [Render.com](https://render.com) account.
2.  This repository pushed to your GitHub/GitLab account.

## Quick Start (Blueprints)

1.  **Dashboard**: logic into your Render Dashboard.
2.  **New Blueprint**: Click the **New +** button and select **Blueprint**.
3.  **Connect Repo**: Connect your `snake-arena-live` repository.
4.  **Auto-Detection**: Render will detect the `render.yaml` file in the root directory.
5.  **Service Name**: Give your blueprint instance a name (e.g., `snake-arena-prod`).
6.  **Apply**: Click **Apply**.
    *   Render will create a **PostgreSQL Database** (`snake-arena-db`).
    *   Render will create a **Web Service** (`snake-arena-live`) and build your Docker image.
7.  **Wait**: The build may take a few minutes.
8.  **Success**: Once deployed, your URL will be available (e.g., `https://snake-arena-live.onrender.com`).

## Architecture Details

-   **Environment**: Docker (Single formatted container).
-   **Database**: Managed PostgreSQL provided by Render.
-   **Configuration**:
    -   `DATABASE_URL` is automatically injected by Render into the service.
    -   `entrypoint-unified.sh` waits for the DB to be ready before starting.
    -   Database migration/initialization happens automatically on startup via the entrypoint script.

## Troubleshooting

-   **Health Check Failures**: If the deployment fails due to health checks, check the logs. The app requires the database to be up. The entrypoint script handles this waiting period.
-   **Database Connection**: Ensure `DATABASE_URL` is correctly populated in the Environment tab of the service.
