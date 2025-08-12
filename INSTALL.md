# 📦 Musashi Installation Guide

This document provides detailed instructions for installing and operating Musashi in a production environment.

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [GitHub Container Registry Usage](#github-container-registry-usage)
- [Docker Compose Installation](#docker-compose-installation)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Version Upgrade](#version-upgrade)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **Memory**: 4GB RAM
- **Storage**: 10GB free space
- **OS**: Linux (Ubuntu 20.04+, CentOS 8+), macOS 12+, Windows 10+ (WSL2)
- **Docker**: 20.10.0 or higher
- **Docker Compose**: 2.0.0 or higher (optional)

### Recommended Specifications
- **CPU**: 4 cores or more
- **Memory**: 8GB RAM or more
- **Storage**: 20GB SSD
- **Network**: 1Gbps

### Supported Platforms
- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (Apple Silicon M1/M2, ARM servers)

## Quick Start

### 1-Minute Installation (Recommended)

```bash
# 1. Pull the latest image
docker pull ghcr.io/imiml/musashi:latest

# 2. Run with a single command
docker run -d \
  --name musashi \
  --restart unless-stopped \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="$(openssl rand -hex 32)" \
  --add-host host.docker.internal:host-gateway \
  --health-cmd='curl -f http://localhost/api/v1/health || exit 1' \
  --health-interval=30s \
  ghcr.io/imiml/musashi:latest

# 3. Access in browser
echo "Musashi is running: http://localhost"
echo "API Documentation: http://localhost:8080/api/docs"
```

## GitHub Container Registry Usage

### 1. Authentication Setup (Optional - Public images don't require authentication)

```bash
# Login with GitHub Personal Access Token
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Or login with Docker Hub account
docker login ghcr.io
```

### 2. Pull Image

```bash
# Latest stable version
docker pull ghcr.io/imiml/musashi:latest

# Specific version
docker pull ghcr.io/imiml/musashi:v1.0.0

# Development version
docker pull ghcr.io/imiml/musashi:develop

# Verify pull
docker images | grep musashi
```

### 3. Image Verification

```bash
# Verify signature with Cosign (security recommended)
cosign verify ghcr.io/imiml/musashi:latest \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/imiml/musashi/\.github/workflows/.*'

# Check image information
docker inspect ghcr.io/imiml/musashi:latest | jq '.[0].Config.Labels'

# Download SBOM
cosign download sbom ghcr.io/imiml/musashi:latest > musashi-sbom.json
```

### 4. Run Container

```bash
# Basic run
docker run -d \
  --name musashi \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL="mongodb://mongodb:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="your-secret-key" \
  ghcr.io/imiml/musashi:latest

# Using host MongoDB
docker run -d \
  --name musashi \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  --add-host host.docker.internal:host-gateway \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="your-secret-key" \
  ghcr.io/imiml/musashi:latest

# Check status
docker ps --filter name=musashi
docker logs musashi --tail 50
```

## Docker Compose Installation

### 1. Create docker-compose.yml File

```yaml
# docker-compose.yml
version: '3.8'

services:
  musashi:
    image: ghcr.io/imiml/musashi:latest
    container_name: musashi
    ports:
      - "80:80"        # Frontend (nginx)
      - "8080:8000"    # Backend API (FastAPI)
    environment:
      # Required environment variables
      - MONGODB_URL=${MONGODB_URL:-mongodb://mongodb:27017}
      - DATABASE_NAME=${DATABASE_NAME:-musashi}
      - SECRET_KEY=${SECRET_KEY}
      
      # Optional environment variables
      - BACKEND_CORS_ORIGINS=${BACKEND_CORS_ORIGINS:-http://localhost,http://localhost:80}
      - ENVIRONMENT=${ENVIRONMENT:-production}
      - DEBUG=${DEBUG:-false}
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - ACCESS_TOKEN_EXPIRE_MINUTES=${ACCESS_TOKEN_EXPIRE_MINUTES:-11520}
      - WORKERS_PER_CORE=${WORKERS_PER_CORE:-1}
      - MAX_WORKERS=${MAX_WORKERS:-4}
    
    depends_on:
      mongodb:
        condition: service_healthy
    
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/api/v1/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    
    restart: unless-stopped
    
    networks:
      - musashi-network
    
    volumes:
      # Log volume (optional)
      - ./logs:/app/logs
  
  mongodb:
    image: mongo:7-jammy
    container_name: musashi-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=musashi
      # Authentication recommended for production
      # - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      # - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongo_data:/data/db
      - mongo_config:/data/configdb
      # Initialization script (optional)
      # - ./init-mongo.js:/docker-entrypoint-initdb.d/init.js:ro
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped
    networks:
      - musashi-network

  # Optional: Reverse proxy (SSL/TLS)
  # nginx:
  #   image: nginx:alpine
  #   container_name: musashi-proxy
  #   ports:
  #     - "443:443"
  #   volumes:
  #     - ./nginx.conf:/etc/nginx/nginx.conf:ro
  #     - ./ssl:/etc/nginx/ssl:ro
  #   depends_on:
  #     - musashi
  #   networks:
  #     - musashi-network

networks:
  musashi-network:
    driver: bridge

volumes:
  mongo_data:
    driver: local
  mongo_config:
    driver: local
```

### 2. Create .env File

```bash
# Copy .env.example to create .env
cat > .env << 'EOF'
# ===================================
# Musashi Environment Variables
# ===================================

# [Required] MongoDB connection settings
MONGODB_URL=mongodb://mongodb:27017
DATABASE_NAME=musashi

# [Required] JWT secret key (use strong key in production)
# Generation method: openssl rand -hex 32
SECRET_KEY=your-secret-key-change-in-production-minimum-32-characters

# [Optional] CORS settings (comma-separated)
BACKEND_CORS_ORIGINS=http://localhost,http://localhost:80,https://yourdomain.com

# [Optional] Runtime environment
ENVIRONMENT=production  # development, staging, production

# [Optional] Debug mode (false in production)
DEBUG=false

# [Optional] Log level
LOG_LEVEL=info  # debug, info, warning, error, critical

# [Optional] JWT token expiration time (minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 days

# [Optional] Worker process settings
WORKERS_PER_CORE=1
MAX_WORKERS=4

# [Optional] MongoDB authentication (recommended for production)
# MONGO_USERNAME=admin
# MONGO_PASSWORD=secure_password

# [Optional] Initial admin account setup
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123!
ADMIN_EMAIL=admin@example.com

# [Optional] Email settings (for password reset)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM=noreply@example.com

# [Optional] External service API keys
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# [Optional] Monitoring
# SENTRY_DSN=https://...@sentry.io/...
# PROMETHEUS_ENABLED=true

EOF
```

### 3. Run Docker Compose

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f musashi

# Check status
docker-compose ps

# Health check
curl http://localhost/api/v1/health

# Stop
docker-compose stop

# Complete removal
docker-compose down

# Remove with volumes
docker-compose down -v
```

## Environment Variables Configuration

### Required Environment Variables

| Variable | Description | Example | Validation |
|----------|-------------|---------|------------|
| `MONGODB_URL` | MongoDB connection URL | `mongodb://localhost:27017` | MongoDB format |
| `DATABASE_NAME` | Database name | `musashi` | Letters, numbers, _ |
| `SECRET_KEY` | JWT signing key | 32+ character random string | Minimum 32 characters |

### Optional Environment Variables

| Variable | Description | Default | Recommended |
|----------|-------------|---------|-------------|
| `BACKEND_CORS_ORIGINS` | CORS allowed origins | `http://localhost` | Actual domain |
| `ENVIRONMENT` | Runtime environment | `production` | production |
| `DEBUG` | Debug mode | `false` | false (production) |
| `LOG_LEVEL` | Log level | `info` | info |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration (minutes) | `11520` | 1440 (1 day) |
| `WORKERS_PER_CORE` | Workers per core | `1` | 2 |
| `MAX_WORKERS` | Maximum workers | `4` | CPU core count |

### Environment-Specific Configuration Examples

#### Development Environment
```bash
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=debug
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8000
SECRET_KEY=dev-secret-key-for-testing-only
```

#### Staging Environment
```bash
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=info
BACKEND_CORS_ORIGINS=https://staging.musashi.com
SECRET_KEY=$(openssl rand -hex 32)
```

#### Production Environment
```bash
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=warning
BACKEND_CORS_ORIGINS=https://musashi.com,https://www.musashi.com
SECRET_KEY=$(openssl rand -hex 64)
WORKERS_PER_CORE=2
MAX_WORKERS=8
```

### Secret Key Generation Methods

```bash
# Using OpenSSL (recommended)
openssl rand -hex 32

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"

# Using /dev/urandom (Linux/macOS)
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1

# Using UUID (convenient but less secure)
uuidgen | sha256sum | cut -d' ' -f1
```

## Version Upgrade

### 1. Pre-Upgrade Preparation

```bash
# Check current version
docker inspect musashi --format='{{.Config.Image}}'
docker exec musashi cat /app/version.txt 2>/dev/null || echo "No version info"

# Check changelog
curl -s https://api.github.com/repos/imiml/musashi/releases/latest | jq '.body'

# Create backup
./scripts/backup.sh || docker exec musashi-mongodb mongodump --db musashi --out /backup
docker cp musashi-mongodb:/backup ./backup-$(date +%Y%m%d-%H%M%S)
```

### 2. Zero-Downtime Upgrade (Blue-Green)

```bash
# Pull new version image
NEW_VERSION="v2.0.0"
docker pull ghcr.io/imiml/musashi:${NEW_VERSION}

# Verify signature
cosign verify ghcr.io/imiml/musashi:${NEW_VERSION} \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/imiml/musashi/\.github/workflows/.*'

# Create new container (different port)
docker run -d \
  --name musashi-new \
  -p 8081:80 \
  -p 8082:8000 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="${SECRET_KEY}" \
  --add-host host.docker.internal:host-gateway \
  ghcr.io/imiml/musashi:${NEW_VERSION}

# Health check
timeout 60 bash -c 'until curl -f http://localhost:8081/api/v1/health; do sleep 2; done'

# Switch traffic (nginx/haproxy config change or port swap)
docker stop musashi
docker rename musashi musashi-old
docker rename musashi-new musashi

# Remap ports
docker run -d \
  --name musashi \
  -p 80:80 \
  -p 8080:8000 \
  --volumes-from musashi-old \
  ghcr.io/imiml/musashi:${NEW_VERSION}

# Remove old version
docker rm musashi-old
```

### 3. Docker Compose Upgrade

```bash
# Update images
docker-compose pull

# Restart (auto upgrade)
docker-compose up -d

# Or specify version explicitly
sed -i 's/:latest/:v2.0.0/g' docker-compose.yml
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs musashi --tail=50
```

### 4. Rollback Procedure

```bash
# Rollback to previous version if issues occur
PREVIOUS_VERSION="v1.0.0"

# Stop current version
docker stop musashi && docker rm musashi

# Restore previous version
docker run -d \
  --name musashi \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="${SECRET_KEY}" \
  --add-host host.docker.internal:host-gateway \
  ghcr.io/imiml/musashi:${PREVIOUS_VERSION}

# Restore data (if needed)
docker cp ./backup-20240120 musashi-mongodb:/restore
docker exec musashi-mongodb mongorestore --db musashi --drop /restore/musashi
```

### 5. Version Migration Guide

#### v1.x → v2.x
```bash
# Automatic migration (runs automatically on app start)
# No additional action required
```

#### v0.x → v1.x
```bash
# Manual migration required
docker exec musashi python /app/migrations/v0_to_v1.py

# Or run migration script
curl -s https://raw.githubusercontent.com/imiml/musashi/main/migrations/v0_to_v1.sh | bash
```

## Production Deployment

### 1. Security Hardening

```bash
# 1. Generate strong secret key
export SECRET_KEY=$(openssl rand -hex 64)

# 2. Setup MongoDB authentication
docker exec musashi-mongodb mongosh --eval "
  use admin;
  db.createUser({
    user: 'musashi_user',
    pwd: '$(openssl rand -base64 32)',
    roles: [{role: 'readWrite', db: 'musashi'}]
  });
"

# 3. Network isolation
docker network create --driver bridge --internal musashi-internal
docker network connect musashi-internal musashi
docker network connect musashi-internal musashi-mongodb

# 4. Read-only root filesystem
docker run -d \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /app/logs \
  musashi:latest
```

### 2. Performance Optimization

```bash
# CPU/Memory limits
docker run -d \
  --cpus="2.0" \
  --memory="4g" \
  --memory-swap="4g" \
  musashi:latest

# Log driver configuration
docker run -d \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  musashi:latest
```

### 3. Monitoring Setup

```bash
# Enable Prometheus metrics
docker run -d \
  -e PROMETHEUS_ENABLED=true \
  -p 9090:9090 \
  musashi:latest

# Health check monitoring
watch -n 5 'curl -s http://localhost/api/v1/health | jq .'

# Log collection (Elasticsearch)
docker run -d \
  --log-driver=syslog \
  --log-opt syslog-address=tcp://elasticsearch:514 \
  musashi:latest
```

### 4. Backup Automation

```bash
# Create backup script
cat > backup-musashi.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/musashi"
DATE=$(date +%Y%m%d-%H%M%S)

# MongoDB backup
docker exec musashi-mongodb mongodump \
  --db musashi \
  --out /backup/${DATE}

# Compress
tar -czf ${BACKUP_DIR}/musashi-${DATE}.tar.gz \
  -C /backup ${DATE}

# Delete old backups (older than 30 days)
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete

# S3 upload (optional)
# aws s3 cp ${BACKUP_DIR}/musashi-${DATE}.tar.gz s3://backup-bucket/musashi/
EOF

chmod +x backup-musashi.sh

# Add cron job
echo "0 2 * * * /path/to/backup-musashi.sh" | crontab -
```

## Troubleshooting

### Common Issues

#### MongoDB Connection Failure
```bash
# Test connection
docker exec musashi python -c "
from pymongo import MongoClient
client = MongoClient('mongodb://host.docker.internal:27017')
print(client.server_info())
"

# Solutions
# 1. Check MongoDB is running
docker ps | grep mongo

# 2. Check network
docker network ls
docker network inspect bridge

# 3. Check host settings (macOS/Windows)
docker run --rm alpine nslookup host.docker.internal
```

#### Port Conflicts
```bash
# Check ports in use
netstat -tulpn | grep -E ':(80|8080|27017)'
lsof -i :80  # macOS

# Use different ports
docker run -d \
  -p 8080:80 \
  -p 8081:8000 \
  musashi:latest
```

#### Memory Issues
```bash
# Check Docker resources
docker system df
docker system prune -a

# Check memory usage
docker stats musashi

# Add swap memory (Linux)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Checking Logs

```bash
# Container logs
docker logs musashi --tail 100 -f

# Logs since specific time
docker logs musashi --since 2h

# Check log files directly
docker exec musashi tail -f /app/logs/app.log

# Filter errors only
docker logs musashi 2>&1 | grep -E 'ERROR|CRITICAL'
```

### Debugging

```bash
# Access container shell
docker exec -it musashi /bin/bash

# Run Python shell
docker exec -it musashi python

# Check environment variables
docker exec musashi env | sort

# Check processes
docker exec musashi ps aux

# Check network
docker exec musashi netstat -tulpn
```

## Support and Contact

- **Documentation**: https://docs.musashi.dev
- **GitHub Issues**: https://github.com/imiml/musashi/issues
- **Discord**: https://discord.gg/musashi
- **Email**: support@musashi.dev

## License

MIT License - See [LICENSE](LICENSE) file for details