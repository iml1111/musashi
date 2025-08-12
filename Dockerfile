# Multi-stage build for optimized image size and multi-arch support
ARG PYTHON_VERSION=3.12
ARG NODE_VERSION=20

# Stage 1: Frontend Builder
FROM node:${NODE_VERSION}-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + Runtime
FROM python:${PYTHON_VERSION}-slim

# Create non-root user for security
RUN groupadd -r musashi && useradd -r -g musashi musashi

WORKDIR /app

# Install nginx and curl for healthcheck
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip && \
    find /usr/local -name "*.pyc" -delete && \
    find /usr/local -name "__pycache__" -type d -delete

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

# Set proper permissions for nginx
RUN mkdir -p /var/lib/nginx /var/log/nginx /var/cache/nginx /var/run && \
    chown -R musashi:musashi /var/lib/nginx /var/log/nginx /var/cache/nginx /var/run && \
    chown -R musashi:musashi /app && \
    chown -R musashi:musashi /usr/share/nginx/html && \
    chmod 755 /app/start.sh

# Switch to non-root user
USER musashi

# Expose ports
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/api/v1/health || exit 1

# Start the application
CMD ["/app/start.sh"]