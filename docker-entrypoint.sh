#!/bin/sh
set -e

echo "Starting Musashi services..."

# Start nginx in background
nginx -g 'daemon off;' &

# Start FastAPI backend
cd /app/backend
exec uvicorn app.main:app --host 0.0.0.0 --port 8000