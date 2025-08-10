# Multi-stage build: Frontend + Backend in one image
FROM node:18-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
COPY frontend/ ./
RUN npm ci && npm run build

# Backend stage with nginx for frontend
FROM python:3.12-slim

WORKDIR /app

# Install nginx for serving frontend
RUN apt-get update && apt-get install -y \
    nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app ./app

# Copy built frontend to nginx directory
COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html

# Configure nginx
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /api { \
        proxy_pass http://localhost:8000/api; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/sites-available/default

# Create startup script
RUN echo '#!/bin/bash\n\
# Start FastAPI backend in background\n\
uvicorn app.main:app --host 0.0.0.0 --port 8000 &\n\
\n\
# Start nginx in foreground\n\
nginx -g "daemon off;"\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
EXPOSE 80 8000

# Start the application
CMD ["/app/start.sh"]