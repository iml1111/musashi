<!-- Last updated: 2025-01-14 -->
# 🐳 Musashi Docker Compose Complete Guide

## 📋 Overview

Musashi Project is based on a **single container web app architecture** where Frontend(React) + Backend(FastAPI) + WebServer(Nginx) run in one optimized container.

### 🏗️ Architecture

```
┌─────────────────────────────────────┐
│           Musashi Container         │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │ Nginx   │ │FastAPI  │ │Frontend│ │
│  │ :80     │ │ :8000   │ │ Build  │ │
│  │ Proxy   │ │ API     │ │ Files  │ │
│  └─────────┘ └─────────┘ └────────┘ │
└─────────────────────────────────────┘
             │
             ▼
    ┌─────────────────┐
    │ MongoDB         │
    │ :27017         │
    └─────────────────┘
```

## 📁 Configuration Files

### 1. Core Compose Files
- **`docker-compose.yml`** - Production Environment (Default)
- **`docker-compose.dev.yml`** - Development Environment
- **`docker-compose.build.yml`** - Build Optimization/Testing
- **`docker-compose.override.yml`** - Local developer customization

### 2. Environment Settings
- **`.env.example`** - Environment Variables Template 
- **`.env`** - Actual environment variables (copy and modify as needed)

### 3. Initialization Scripts
- **`mongodb/init/01-init-user.js`** - MongoDB initialization settings
- **`scripts/docker-start.sh`** - Integrated start script

## 🚀 Quick Start

### Step 1: Environment Setup

```bash
# Create environment variables file
cp .env.example .env

# Set required values like SECRET_KEY (edit .env file with editor)
nano .env
```

**⚠️ Important**: In production, always change `SECRET_KEY` to a secure value!

### Step 2: Run Docker Compose

```bash
# Use integrated start script (recommended)
./run-musashi.sh

# Or run Docker Compose directly
docker-compose up -d
```

### Step 3: Verify Access

- 🌐 **Web Application**: http://localhost (port 80)
- 📊 **API Documentation**: http://localhost:8080/api/docs
- 🔍 **Health Check**: http://localhost:8080/api/v1/health

## 🛠️ Environment-specific Usage

### 🏭 Production Environment

```bash
# Default production execution
docker-compose up -d

# Or use start script
./run-musashi.sh prod
```

**Features:**
- Single container architecture
- Optimized image size
- Enhanced security (non-root user)
- Resource limits applied
- MongoDB authentication enabled

### 🧪 Development Environment

```bash
# Run development environment
docker-compose -f docker-compose.dev.yml up -d

# Or use start script  
./run-musashi.sh dev
```

**Features:**
- Source code hot reload
- Debug mode enabled
- Port exposure (Backend 8000, MongoDB 27017)
- Optional development tools (using profiles)

**Optional Service Execution:**
```bash
# Add Frontend Development Server
docker-compose -f docker-compose.dev.yml --profile frontend-dev up -d

# Add Redis Development Server
docker-compose -f docker-compose.dev.yml --profile redis up -d

# MongoDB Express Management Tool
docker-compose -f docker-compose.dev.yml --profile mongo-admin up -d
```

### 🏗️ Build Testing Environment

```bash
# Build cache optimization testing
docker-compose -f docker-compose.build.yml up -d

# Or use start script
./run-musashi.sh build
```

## ⚙️ Advanced Usage

### Start Script Options

```bash
# Force image rebuild
./run-musashi.sh prod --rebuild

# Clean existing data before start
./run-musashi.sh dev --clean

# Monitor logs after start
./run-musashi.sh dev --logs

# All options combined
./run-musashi.sh dev --clean --rebuild --logs
```

# # # 개별 Service Management

```bash
# 특정 Service만 재Start
docker-compose restart musashi
docker-compose restart mongo

# 특정 Service Check logs
docker-compose logs -f musashi
docker-compose logs -f mongo

# Service Status Confirm
docker-compose ps
```

# ## Database Management

```bash
# MongoDB Container 접속
docker-compose exec mongo mongosh

# MongoDB Data Backup
docker-compose exec mongo mongodump --db musashi --out /backups

# MongoDB Data 복원
docker-compose exec mongo mongorestore --db musashi /backups/musashi
```

# # 🔧 커스터마이징

# # # 로컬 Development자 Settings

`docker-compose.override.yml` File을 개인 Settings에 맞게 Modify:

```yaml
# Port Change (Conflict 방지)
services:
  musashi:
    ports:
      - "8081:8080" # 8080 대신 8081 사용
    
    # Development용 Volume 마운트
    volumes:
      - ./backend/app:/app/app:ro
      - ./logs:/var/log/nginx
```

# # # Environment Variables 커스터마이징

`.env` File에서 주요 Settings 조정:

```bash
# Port Settings
MUSASHI_PORT=8080
MONGO_PORT=127.0.0.1:27017

# Database Settings  
DATABASE_NAME=musashi
MONGODB_URL=mongodb://mongo:27017

# Security Settings
SECRET_KEY=your-super-secure-secret-key
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password

# Development/Production 구Minute
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=info
```

# # 📊 Monitoring 및 Log

### Check logs

```bash
# 전체 Service Log
docker-compose logs -f

# 특정 Service Log  
docker-compose logs -f musashi
docker-compose logs -f mongo

# Log File 직접 Access
docker-compose exec musashi tail -f /var/log/nginx/access.log
docker-compose exec musashi tail -f /app/logs/musashi.log
```

# # # 헬스체크 Monitoring

```bash
# 헬스체크 Status Confirm
docker-compose ps

# Manual 헬스체크
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/health
```

# ## Resource Monitoring

```bash
# Container Resource 사Capacity
docker stats

# 특정 Container 세부 Info
docker-compose exec musashi top
docker-compose exec mongo mongostat
```

# # 🚨 Problem Resolve

# # # Day반적인 Problem들

# ### 1. Port Conflict
```bash
# 에러: "port is already allocated"
# Resolve: .env에서 Port Change
MUSASHI_PORT=8081
```

# ### 2. Permission Problem
```bash
# 에러: "permission denied"
# Resolve: Docker Group Permission Confirm
sudo usermod -aG docker $USER
# Log아웃 후 다Hour Log인
```

# ### 3. Image Build Failed
```bash
# Resolve: Cache 없이 재Build
docker-compose build --no-cache
./run-musashi.sh --rebuild
```

# ### 4. Database Connect Failed
```bash
# Resolve: MongoDB Container Status Confirm
docker-compose logs mongo

# MongoDB Manual 헬스체크
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

# # # # 5. Memory 부족
```bash
# Resolve: Resource Limit 조정 (.env 또는 override.yml)
# 또는 미사용 Image/Container 정리
docker system prune -a
```

# ## Log Analysis

# # # # Nginx 에러 Log
```bash
docker-compose exec musashi tail -f /var/log/nginx/error.log
```

# # # # FastAPI 애플리케이션 Log
```bash
docker-compose exec musashi tail -f /app/logs/musashi.log
```

#### MongoDB Log
```bash
docker-compose exec mongo tail -f /var/log/mongodb/mongod.log
```

# # # Data 복구

# # # # MongoDB Data 손실Hour
```bash
# 1. Backup이 있는 경우
docker-compose exec mongo mongorestore --db musashi /path/to/backup

# 2. Backup이 없는 경우 - Second기 Data 재Create
docker-compose restart mongo
# MongoDB Second기화 Script가 Auto Execute됩니다
```

## 🔒 Security Guide

# # # Production Security 체크리스트

- [ ] `.env` File의 `SECRET_KEY` Change
- [ ] MongoDB Management자 계정 Settings (`MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`)
- [ ] 불필요한 Port 노출 Limit
- [ ] HTTPS Settings (리버스 프록Hour 사용)
- [ ] 정기적인 Security Update
- [ ] Log Monitoring Settings

# ## Network Security

```yaml
# Production용 Network 격리 Settings
networks:
  musashi-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
    internal: true  # 외부 인터넷 Block (필요Hour)
```

## 📈 Performance Optimization

# # # Resource 튜닝

```yaml
# docker-compose.override.yml에서 Resource 조정
services:
  musashi:
    deploy:
      resources:
        limits:
          memory: 1G        # Increased memory limit
          cpus: '2.0'       # Increased CPU limit
        reservations:
          memory: 512M      # Minimum Memory 보장
          cpus: '1.0'       # Minimum CPU 보장
```

# ## Volume Performance

```yaml
# SSD 스토리지 사용, Volume 드라이버 Optimization
volumes:
  mongo_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /fast-ssd-path/mongo-data
```

# # 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Musashi
on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        run: |
          cp .env.example .env
          echo "SECRET_KEY=${{ secrets.SECRET_KEY }}" >> .env
          ./run-musashi.sh prod --rebuild
```

# # 📚 Reference 자료

- [Docker Compose 공식 Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Guide](https://hub.docker.com/_/mongo)
- [Nginx Settings Guide](https://nginx.org/en/docs/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)

---

# # 🆘 Support

Problem가 발생하거나 질문이 있으Hour면:

1. 🐛 **Issue Create**: GitHub Issues에 Problem Situation 보고
2. 📖 **Documentation Confirm**: README.md 및 관련 Documentation Review
3. 🔍 **Log Analysis**: `docker-compose logs -f`로 에러 Check logs
4. 💬 **커뮤니티**: Development팀 또는 커뮤니티에서 Help Request

**행운을 빕니다! 🚀**