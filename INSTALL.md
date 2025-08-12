# 📦 Musashi 설치 가이드

이 문서는 Musashi를 프로덕션 환경에 설치하고 운영하는 방법을 상세히 설명합니다.

## 📋 목차

- [시스템 요구사항](#시스템-요구사항)
- [빠른 시작 (Quick Start)](#빠른-시작-quick-start)
- [GitHub Container Registry 사용법](#github-container-registry-사용법)
- [Docker Compose 설치](#docker-compose-설치)
- [환경 변수 설정](#환경-변수-설정)
- [버전 업그레이드](#버전-업그레이드)
- [프로덕션 배포](#프로덕션-배포)
- [문제 해결](#문제-해결)

## 시스템 요구사항

### 최소 요구사항
- **CPU**: 2 코어
- **메모리**: 4GB RAM
- **저장소**: 10GB 여유 공간
- **OS**: Linux (Ubuntu 20.04+, CentOS 8+), macOS 12+, Windows 10+ (WSL2)
- **Docker**: 20.10.0 이상
- **Docker Compose**: 2.0.0 이상 (선택사항)

### 권장 사양
- **CPU**: 4 코어 이상
- **메모리**: 8GB RAM 이상
- **저장소**: 20GB SSD
- **네트워크**: 1Gbps

### 지원 플랫폼
- `linux/amd64` (Intel/AMD 64비트)
- `linux/arm64` (Apple Silicon M1/M2, ARM 서버)

## 빠른 시작 (Quick Start)

### 1분 설치 (권장)

```bash
# 1. 최신 이미지 다운로드
docker pull ghcr.io/imiml/musashi:latest

# 2. 단일 명령으로 실행
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

# 3. 브라우저에서 접속
echo "Musashi가 실행되었습니다: http://localhost"
echo "API 문서: http://localhost:8080/api/docs"
```

## GitHub Container Registry 사용법

### 1. 인증 설정 (선택사항 - Public 이미지는 인증 불필요)

```bash
# GitHub Personal Access Token으로 로그인
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 또는 Docker Hub 계정으로 로그인
docker login ghcr.io
```

### 2. 이미지 Pull

```bash
# 최신 안정 버전
docker pull ghcr.io/imiml/musashi:latest

# 특정 버전
docker pull ghcr.io/imiml/musashi:v1.0.0

# 개발 버전
docker pull ghcr.io/imiml/musashi:develop

# Pull 확인
docker images | grep musashi
```

### 3. 이미지 검증

```bash
# Cosign으로 서명 검증 (보안 권장)
cosign verify ghcr.io/imiml/musashi:latest \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/imiml/musashi/\.github/workflows/.*'

# 이미지 정보 확인
docker inspect ghcr.io/imiml/musashi:latest | jq '.[0].Config.Labels'

# SBOM 다운로드
cosign download sbom ghcr.io/imiml/musashi:latest > musashi-sbom.json
```

### 4. 컨테이너 실행

```bash
# 기본 실행
docker run -d \
  --name musashi \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL="mongodb://mongodb:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="your-secret-key" \
  ghcr.io/imiml/musashi:latest

# 호스트 MongoDB 사용
docker run -d \
  --name musashi \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  --add-host host.docker.internal:host-gateway \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="your-secret-key" \
  ghcr.io/imiml/musashi:latest

# 상태 확인
docker ps --filter name=musashi
docker logs musashi --tail 50
```

## Docker Compose 설치

### 1. docker-compose.yml 파일 생성

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
      # 필수 환경 변수
      - MONGODB_URL=${MONGODB_URL:-mongodb://mongodb:27017}
      - DATABASE_NAME=${DATABASE_NAME:-musashi}
      - SECRET_KEY=${SECRET_KEY}
      
      # 선택 환경 변수
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
      # 로그 볼륨 (선택사항)
      - ./logs:/app/logs
  
  mongodb:
    image: mongo:7-jammy
    container_name: musashi-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=musashi
      # 프로덕션에서는 인증 설정 권장
      # - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      # - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongo_data:/data/db
      - mongo_config:/data/configdb
      # 초기화 스크립트 (선택사항)
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

  # 선택사항: 리버스 프록시 (SSL/TLS)
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

### 2. .env 파일 생성

```bash
# .env.example을 복사하여 .env 생성
cat > .env << 'EOF'
# ===================================
# Musashi 환경 변수 설정
# ===================================

# [필수] MongoDB 연결 설정
MONGODB_URL=mongodb://mongodb:27017
DATABASE_NAME=musashi

# [필수] JWT 비밀키 (프로덕션에서는 강력한 키 사용)
# 생성 방법: openssl rand -hex 32
SECRET_KEY=your-secret-key-change-in-production-minimum-32-characters

# [선택] CORS 설정 (콤마로 구분)
BACKEND_CORS_ORIGINS=http://localhost,http://localhost:80,https://yourdomain.com

# [선택] 실행 환경
ENVIRONMENT=production  # development, staging, production

# [선택] 디버그 모드 (프로덕션에서는 false)
DEBUG=false

# [선택] 로그 레벨
LOG_LEVEL=info  # debug, info, warning, error, critical

# [선택] JWT 토큰 만료 시간 (분)
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8일

# [선택] 워커 프로세스 설정
WORKERS_PER_CORE=1
MAX_WORKERS=4

# [선택] MongoDB 인증 (프로덕션 권장)
# MONGO_USERNAME=admin
# MONGO_PASSWORD=secure_password

# [선택] 관리자 계정 초기 설정
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123!
ADMIN_EMAIL=admin@example.com

# [선택] 이메일 설정 (비밀번호 재설정용)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM=noreply@example.com

# [선택] 외부 서비스 API 키
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# [선택] 모니터링
# SENTRY_DSN=https://...@sentry.io/...
# PROMETHEUS_ENABLED=true

EOF
```

### 3. Docker Compose 실행

```bash
# 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f musashi

# 상태 확인
docker-compose ps

# 헬스체크
curl http://localhost/api/v1/health

# 중지
docker-compose stop

# 완전 제거
docker-compose down

# 볼륨까지 제거
docker-compose down -v
```

## 환경 변수 설정

### 필수 환경 변수

| 변수명 | 설명 | 예시 | 검증 |
|--------|------|------|------|
| `MONGODB_URL` | MongoDB 연결 URL | `mongodb://localhost:27017` | MongoDB 형식 |
| `DATABASE_NAME` | 데이터베이스 이름 | `musashi` | 영문자, 숫자, _ |
| `SECRET_KEY` | JWT 서명 키 | 32자 이상 랜덤 문자열 | 최소 32자 |

### 선택 환경 변수

| 변수명 | 설명 | 기본값 | 권장값 |
|--------|------|--------|--------|
| `BACKEND_CORS_ORIGINS` | CORS 허용 오리진 | `http://localhost` | 실제 도메인 |
| `ENVIRONMENT` | 실행 환경 | `production` | production |
| `DEBUG` | 디버그 모드 | `false` | false (프로덕션) |
| `LOG_LEVEL` | 로그 레벨 | `info` | info |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 토큰 만료(분) | `11520` | 1440 (1일) |
| `WORKERS_PER_CORE` | 코어당 워커 | `1` | 2 |
| `MAX_WORKERS` | 최대 워커 수 | `4` | CPU 코어 수 |

### 환경별 설정 예시

#### 개발 환경
```bash
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=debug
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8000
SECRET_KEY=dev-secret-key-for-testing-only
```

#### 스테이징 환경
```bash
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=info
BACKEND_CORS_ORIGINS=https://staging.musashi.com
SECRET_KEY=$(openssl rand -hex 32)
```

#### 프로덕션 환경
```bash
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=warning
BACKEND_CORS_ORIGINS=https://musashi.com,https://www.musashi.com
SECRET_KEY=$(openssl rand -hex 64)
WORKERS_PER_CORE=2
MAX_WORKERS=8
```

### 비밀키 생성 방법

```bash
# OpenSSL 사용 (권장)
openssl rand -hex 32

# Python 사용
python -c "import secrets; print(secrets.token_hex(32))"

# /dev/urandom 사용 (Linux/macOS)
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1

# UUID 사용 (간편하지만 덜 안전)
uuidgen | sha256sum | cut -d' ' -f1
```

## 버전 업그레이드

### 1. 업그레이드 전 준비

```bash
# 현재 버전 확인
docker inspect musashi --format='{{.Config.Image}}'
docker exec musashi cat /app/version.txt 2>/dev/null || echo "버전 정보 없음"

# 변경사항 확인
curl -s https://api.github.com/repos/imiml/musashi/releases/latest | jq '.body'

# 백업 생성
./scripts/backup.sh || docker exec musashi-mongodb mongodump --db musashi --out /backup
docker cp musashi-mongodb:/backup ./backup-$(date +%Y%m%d-%H%M%S)
```

### 2. 무중단 업그레이드 (Blue-Green)

```bash
# 새 버전 이미지 Pull
NEW_VERSION="v2.0.0"
docker pull ghcr.io/imiml/musashi:${NEW_VERSION}

# 서명 검증
cosign verify ghcr.io/imiml/musashi:${NEW_VERSION} \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/imiml/musashi/\.github/workflows/.*'

# 새 컨테이너 생성 (다른 포트)
docker run -d \
  --name musashi-new \
  -p 8081:80 \
  -p 8082:8000 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="${SECRET_KEY}" \
  --add-host host.docker.internal:host-gateway \
  ghcr.io/imiml/musashi:${NEW_VERSION}

# 헬스체크
timeout 60 bash -c 'until curl -f http://localhost:8081/api/v1/health; do sleep 2; done'

# 트래픽 전환 (nginx/haproxy 설정 변경 또는 포트 스왑)
docker stop musashi
docker rename musashi musashi-old
docker rename musashi-new musashi

# 포트 재매핑
docker run -d \
  --name musashi \
  -p 80:80 \
  -p 8080:8000 \
  --volumes-from musashi-old \
  ghcr.io/imiml/musashi:${NEW_VERSION}

# 구 버전 제거
docker rm musashi-old
```

### 3. Docker Compose 업그레이드

```bash
# 이미지 업데이트
docker-compose pull

# 재시작 (자동 업그레이드)
docker-compose up -d

# 또는 명시적 버전 지정
sed -i 's/:latest/:v2.0.0/g' docker-compose.yml
docker-compose up -d

# 확인
docker-compose ps
docker-compose logs musashi --tail=50
```

### 4. 롤백 절차

```bash
# 문제 발생 시 이전 버전으로 롤백
PREVIOUS_VERSION="v1.0.0"

# 현재 버전 중지
docker stop musashi && docker rm musashi

# 이전 버전으로 복구
docker run -d \
  --name musashi \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="${SECRET_KEY}" \
  --add-host host.docker.internal:host-gateway \
  ghcr.io/imiml/musashi:${PREVIOUS_VERSION}

# 데이터 복원 (필요시)
docker cp ./backup-20240120 musashi-mongodb:/restore
docker exec musashi-mongodb mongorestore --db musashi --drop /restore/musashi
```

### 5. 버전별 마이그레이션 가이드

#### v1.x → v2.x
```bash
# 자동 마이그레이션 (앱 시작 시 자동 실행)
# 추가 작업 불필요
```

#### v0.x → v1.x
```bash
# 수동 마이그레이션 필요
docker exec musashi python /app/migrations/v0_to_v1.py

# 또는 마이그레이션 스크립트 실행
curl -s https://raw.githubusercontent.com/imiml/musashi/main/migrations/v0_to_v1.sh | bash
```

## 프로덕션 배포

### 1. 보안 강화

```bash
# 1. 강력한 비밀키 생성
export SECRET_KEY=$(openssl rand -hex 64)

# 2. MongoDB 인증 설정
docker exec musashi-mongodb mongosh --eval "
  use admin;
  db.createUser({
    user: 'musashi_user',
    pwd: '$(openssl rand -base64 32)',
    roles: [{role: 'readWrite', db: 'musashi'}]
  });
"

# 3. 네트워크 격리
docker network create --driver bridge --internal musashi-internal
docker network connect musashi-internal musashi
docker network connect musashi-internal musashi-mongodb

# 4. 읽기 전용 루트 파일시스템
docker run -d \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /app/logs \
  musashi:latest
```

### 2. 성능 최적화

```bash
# CPU/메모리 제한
docker run -d \
  --cpus="2.0" \
  --memory="4g" \
  --memory-swap="4g" \
  musashi:latest

# 로그 드라이버 설정
docker run -d \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  musashi:latest
```

### 3. 모니터링 설정

```bash
# Prometheus 메트릭 활성화
docker run -d \
  -e PROMETHEUS_ENABLED=true \
  -p 9090:9090 \
  musashi:latest

# 헬스체크 모니터링
watch -n 5 'curl -s http://localhost/api/v1/health | jq .'

# 로그 수집 (Elasticsearch)
docker run -d \
  --log-driver=syslog \
  --log-opt syslog-address=tcp://elasticsearch:514 \
  musashi:latest
```

### 4. 백업 자동화

```bash
# 백업 스크립트 생성
cat > backup-musashi.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/musashi"
DATE=$(date +%Y%m%d-%H%M%S)

# MongoDB 백업
docker exec musashi-mongodb mongodump \
  --db musashi \
  --out /backup/${DATE}

# 압축
tar -czf ${BACKUP_DIR}/musashi-${DATE}.tar.gz \
  -C /backup ${DATE}

# 오래된 백업 삭제 (30일 이상)
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete

# S3 업로드 (선택사항)
# aws s3 cp ${BACKUP_DIR}/musashi-${DATE}.tar.gz s3://backup-bucket/musashi/
EOF

chmod +x backup-musashi.sh

# Cron 작업 추가
echo "0 2 * * * /path/to/backup-musashi.sh" | crontab -
```

## 문제 해결

### 일반적인 문제

#### MongoDB 연결 실패
```bash
# 연결 테스트
docker exec musashi python -c "
from pymongo import MongoClient
client = MongoClient('mongodb://host.docker.internal:27017')
print(client.server_info())
"

# 해결 방법
# 1. MongoDB 실행 확인
docker ps | grep mongo

# 2. 네트워크 확인
docker network ls
docker network inspect bridge

# 3. 호스트 설정 확인 (macOS/Windows)
docker run --rm alpine nslookup host.docker.internal
```

#### 포트 충돌
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep -E ':(80|8080|27017)'
lsof -i :80  # macOS

# 다른 포트 사용
docker run -d \
  -p 8080:80 \
  -p 8081:8000 \
  musashi:latest
```

#### 메모리 부족
```bash
# Docker 리소스 확인
docker system df
docker system prune -a

# 메모리 사용량 확인
docker stats musashi

# 스왑 메모리 추가 (Linux)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 로그 확인

```bash
# 컨테이너 로그
docker logs musashi --tail 100 -f

# 특정 시간 이후 로그
docker logs musashi --since 2h

# 로그 파일 직접 확인
docker exec musashi tail -f /app/logs/app.log

# 에러만 필터링
docker logs musashi 2>&1 | grep -E 'ERROR|CRITICAL'
```

### 디버깅

```bash
# 컨테이너 내부 접속
docker exec -it musashi /bin/bash

# Python 쉘 실행
docker exec -it musashi python

# 환경 변수 확인
docker exec musashi env | sort

# 프로세스 확인
docker exec musashi ps aux

# 네트워크 확인
docker exec musashi netstat -tulpn
```

## 지원 및 문의

- **문서**: https://docs.musashi.dev
- **GitHub Issues**: https://github.com/imiml/musashi/issues
- **Discord**: https://discord.gg/musashi
- **이메일**: support@musashi.dev

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조