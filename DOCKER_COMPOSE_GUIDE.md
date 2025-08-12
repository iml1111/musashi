# 🐳 Musashi Docker Compose 완벽 가이드

## 📋 개요

Musashi 프로젝트는 **단일 컨테이너 웹앱 아키텍처**를 기반으로 하여 프론트엔드(React) + 백엔드(FastAPI) + 웹서버(Nginx)가 하나의 최적화된 컨테이너에서 실행됩니다.

### 🏗️ 아키텍처

```
┌─────────────────────────────────────┐
│           Musashi Container         │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │ Nginx   │ │FastAPI  │ │Frontend│ │
│  │ :8080   │ │ :8000   │ │ Build  │ │
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

## 📁 구성 파일

### 1. 핵심 Compose 파일
- **`docker-compose.yml`** - 프로덕션 환경 (기본)
- **`docker-compose.dev.yml`** - 개발 환경
- **`docker-compose.build.yml`** - 빌드 최적화/테스트
- **`docker-compose.override.yml`** - 로컬 개발자 커스터마이징

### 2. 환경 설정
- **`.env.example`** - 환경 변수 템플릿 
- **`.env`** - 실제 환경 변수 (복사 후 수정 필요)

### 3. 초기화 스크립트
- **`mongodb/init/01-init-user.js`** - MongoDB 초기 설정
- **`scripts/docker-start.sh`** - 통합 시작 스크립트

## 🚀 빠른 시작

### 1단계: 환경 설정

```bash
# 환경 변수 파일 생성
cp .env.example .env

# SECRET_KEY 등 필수 값 설정 (에디터로 .env 파일 편집)
nano .env
```

**⚠️ 중요**: 프로덕션에서는 반드시 `SECRET_KEY`를 안전한 값으로 변경하세요!

### 2단계: Docker Compose 실행

```bash
# 통합 시작 스크립트 사용 (권장)
./scripts/docker-start.sh

# 또는 직접 Docker Compose 실행
docker-compose up -d
```

### 3단계: 접속 확인

- 🌐 **웹 애플리케이션**: http://localhost:8080
- 📊 **API 문서**: http://localhost:8080/docs
- 🔍 **헬스체크**: http://localhost:8080/health

## 🛠️ 환경별 사용법

### 🏭 프로덕션 환경

```bash
# 기본 프로덕션 실행
docker-compose up -d

# 또는 시작 스크립트 사용
./scripts/docker-start.sh prod
```

**특징:**
- 단일 컨테이너 아키텍처
- 최적화된 이미지 크기
- 보안 강화 (non-root 사용자)
- 리소스 제한 적용
- MongoDB 인증 활성화

### 🧪 개발 환경

```bash
# 개발 환경 실행
docker-compose -f docker-compose.dev.yml up -d

# 또는 시작 스크립트 사용  
./scripts/docker-start.sh dev
```

**특징:**
- 소스 코드 핫 리로드
- 디버그 모드 활성화
- 포트 노출 (백엔드 8000, MongoDB 27017)
- 선택적 개발 도구들 (profiles 사용)

**선택적 서비스 실행:**
```bash
# 프론트엔드 개발 서버 추가
docker-compose -f docker-compose.dev.yml --profile frontend-dev up -d

# Redis 개발 서버 추가
docker-compose -f docker-compose.dev.yml --profile redis up -d

# MongoDB Express 관리 도구
docker-compose -f docker-compose.dev.yml --profile mongo-admin up -d
```

### 🏗️ 빌드 테스트 환경

```bash
# 빌드 캐시 최적화 테스트
docker-compose -f docker-compose.build.yml up -d

# 또는 시작 스크립트 사용
./scripts/docker-start.sh build
```

## ⚙️ 고급 사용법

### 시작 스크립트 옵션

```bash
# 이미지 강제 재빌드
./scripts/docker-start.sh prod --rebuild

# 기존 데이터 정리 후 시작
./scripts/docker-start.sh dev --clean

# 시작 후 로그 모니터링
./scripts/docker-start.sh dev --logs

# 모든 옵션 조합
./scripts/docker-start.sh dev --clean --rebuild --logs
```

### 개별 서비스 관리

```bash
# 특정 서비스만 재시작
docker-compose restart musashi
docker-compose restart mongo

# 특정 서비스 로그 확인
docker-compose logs -f musashi
docker-compose logs -f mongo

# 서비스 상태 확인
docker-compose ps
```

### 데이터베이스 관리

```bash
# MongoDB 컨테이너 접속
docker-compose exec mongo mongosh

# MongoDB 데이터 백업
docker-compose exec mongo mongodump --db musashi --out /backups

# MongoDB 데이터 복원
docker-compose exec mongo mongorestore --db musashi /backups/musashi
```

## 🔧 커스터마이징

### 로컬 개발자 설정

`docker-compose.override.yml` 파일을 개인 설정에 맞게 수정:

```yaml
# 포트 변경 (충돌 방지)
services:
  musashi:
    ports:
      - "8081:8080"  # 8080 대신 8081 사용
    
    # 개발용 볼륨 마운트
    volumes:
      - ./backend/app:/app/app:ro
      - ./logs:/var/log/nginx
```

### 환경 변수 커스터마이징

`.env` 파일에서 주요 설정 조정:

```bash
# 포트 설정
MUSASHI_PORT=8080
MONGO_PORT=127.0.0.1:27017

# 데이터베이스 설정  
DATABASE_NAME=musashi
MONGODB_URL=mongodb://mongo:27017

# 보안 설정
SECRET_KEY=your-super-secure-secret-key
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password

# 개발/프로덕션 구분
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=info
```

## 📊 모니터링 및 로그

### 로그 확인

```bash
# 전체 서비스 로그
docker-compose logs -f

# 특정 서비스 로그  
docker-compose logs -f musashi
docker-compose logs -f mongo

# 로그 파일 직접 접근
docker-compose exec musashi tail -f /var/log/nginx/access.log
docker-compose exec musashi tail -f /app/logs/musashi.log
```

### 헬스체크 모니터링

```bash
# 헬스체크 상태 확인
docker-compose ps

# 수동 헬스체크
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/health
```

### 리소스 모니터링

```bash
# 컨테이너 리소스 사용량
docker stats

# 특정 컨테이너 세부 정보
docker-compose exec musashi top
docker-compose exec mongo mongostat
```

## 🚨 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌
```bash
# 에러: "port is already allocated"
# 해결: .env에서 포트 변경
MUSASHI_PORT=8081
```

#### 2. 권한 문제
```bash
# 에러: "permission denied"
# 해결: Docker 그룹 권한 확인
sudo usermod -aG docker $USER
# 로그아웃 후 다시 로그인
```

#### 3. 이미지 빌드 실패
```bash
# 해결: 캐시 없이 재빌드
docker-compose build --no-cache
./scripts/docker-start.sh --rebuild
```

#### 4. 데이터베이스 연결 실패
```bash
# 해결: MongoDB 컨테이너 상태 확인
docker-compose logs mongo

# MongoDB 수동 헬스체크
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

#### 5. 메모리 부족
```bash
# 해결: 리소스 제한 조정 (.env 또는 override.yml)
# 또는 미사용 이미지/컨테이너 정리
docker system prune -a
```

### 로그 분석

#### Nginx 에러 로그
```bash
docker-compose exec musashi tail -f /var/log/nginx/error.log
```

#### FastAPI 애플리케이션 로그
```bash
docker-compose exec musashi tail -f /app/logs/musashi.log
```

#### MongoDB 로그
```bash
docker-compose exec mongo tail -f /var/log/mongodb/mongod.log
```

### 데이터 복구

#### MongoDB 데이터 손실시
```bash
# 1. 백업이 있는 경우
docker-compose exec mongo mongorestore --db musashi /path/to/backup

# 2. 백업이 없는 경우 - 초기 데이터 재생성
docker-compose restart mongo
# MongoDB 초기화 스크립트가 자동 실행됩니다
```

## 🔒 보안 가이드

### 프로덕션 보안 체크리스트

- [ ] `.env` 파일의 `SECRET_KEY` 변경
- [ ] MongoDB 관리자 계정 설정 (`MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`)
- [ ] 불필요한 포트 노출 제한
- [ ] HTTPS 설정 (리버스 프록시 사용)
- [ ] 정기적인 보안 업데이트
- [ ] 로그 모니터링 설정

### 네트워크 보안

```yaml
# 프로덕션용 네트워크 격리 설정
networks:
  musashi-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
    internal: true  # 외부 인터넷 차단 (필요시)
```

## 📈 성능 최적화

### 리소스 튜닝

```yaml
# docker-compose.override.yml에서 리소스 조정
services:
  musashi:
    deploy:
      resources:
        limits:
          memory: 1G        # 메모리 제한 증가
          cpus: '2.0'       # CPU 제한 증가
        reservations:
          memory: 512M      # 최소 메모리 보장
          cpus: '1.0'       # 최소 CPU 보장
```

### 볼륨 성능

```yaml
# SSD 스토리지 사용, 볼륨 드라이버 최적화
volumes:
  mongo_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /fast-ssd-path/mongo-data
```

## 🔄 CI/CD 통합

### GitHub Actions 예제

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
          ./scripts/docker-start.sh prod --rebuild
```

## 📚 참고 자료

- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [MongoDB Docker 가이드](https://hub.docker.com/_/mongo)
- [Nginx 설정 가이드](https://nginx.org/en/docs/)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)
- [React 프로덕션 빌드](https://create-react-app.dev/docs/production-build/)

---

## 🆘 지원

문제가 발생하거나 질문이 있으시면:

1. 🐛 **이슈 생성**: GitHub Issues에 문제 상황 보고
2. 📖 **문서 확인**: README.md 및 관련 문서 검토
3. 🔍 **로그 분석**: `docker-compose logs -f`로 에러 로그 확인
4. 💬 **커뮤니티**: 개발팀 또는 커뮤니티에서 도움 요청

**행운을 빕니다! 🚀**