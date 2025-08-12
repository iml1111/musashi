# 🗡️ Musashi - AI Agent Workflow Design Tool

> **실행 없이 디자인에 집중하는 AI 에이전트 워크플로우 비주얼 디자이너**

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/docker-ready-blue.svg" alt="Docker Ready">
  <img src="https://img.shields.io/badge/platform-linux%2Famd64%20%7C%20linux%2Farm64-lightgrey" alt="Platforms">
</div>

<div align="center">
  <h3>Cut the code. Shape the flow.</h3>
  <p>코드를 줄이고, 플로우를 만드세요.</p>
</div>

---

## ✨ 주요 기능

### 🎨 비주얼 워크플로우 디자인
- **드래그 앤 드롭 인터페이스** - React Flow 기반 직관적인 노드 편집
- **자동 레이아웃** - Dagre 알고리즘으로 자동 정렬
- **다양한 노드 타입** - Agent, Function, MCP, User Input, Output 노드 지원
- **스마트 연결** - 노드 간 입력/출력 자동 연결 관리

### 👥 팀 협업
- **실시간 공유** - 워크플로우 즉시 공유 및 협업
- **RBAC 권한 관리** - Admin, Editor, Viewer 역할 기반 접근 제어
- **팀 워크스페이스** - 팀별 독립된 워크플로우 환경

### 🔄 버전 관리
- **Git 친화적** - JSON 형식으로 버전 관리 시스템 통합
- **버전 히스토리** - 모든 변경사항 추적
- **내보내기/가져오기** - 워크플로우 백업 및 마이그레이션

### 🛡️ 보안
- **JWT 인증** - 안전한 토큰 기반 사용자 인증
- **컨테이너 서명** - Cosign으로 서명된 이미지
- **취약점 스캔** - Trivy로 자동 보안 검사

---

## 🖼️ 스크린샷

<details>
<summary>워크플로우 에디터 보기</summary>

```
┌─────────────────────────────────────────────────────┐
│  Musashi Workflow Editor                      ⚙️ 🔍 │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │   User   │───▶│  Agent   │───▶│  Output  │     │
│  │  Input   │    │   GPT-4  │    │  Result  │     │
│  └──────────┘    └──────────┘    └──────────┘     │
│        │              │                │           │
│        └──────────────┼────────────────┘           │
│                       ▼                            │
│                 ┌──────────┐                       │
│                 │ Function │                       │
│                 │  Process │                       │
│                 └──────────┘                       │
└─────────────────────────────────────────────────────┘
```

</details>

---

## 🚀 빠른 시작

### 1분 설치 - Docker Run

```bash
# 단일 명령으로 실행 (MongoDB 포함)
docker run -d \
  --name musashi \
  --restart unless-stopped \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="$(openssl rand -hex 32)" \
  --add-host host.docker.internal:host-gateway \
  ghcr.io/imiml/musashi:latest

# 브라우저에서 접속
open http://localhost
```

### Docker Compose (권장)

```bash
# 1. docker-compose.yml 다운로드
curl -O https://raw.githubusercontent.com/imiml/musashi/main/docker-compose.yml

# 2. 환경 변수 설정
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env

# 3. 실행
docker-compose up -d

# 4. 접속
open http://localhost
```

---

## 🔧 환경 변수

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `MONGODB_URL` | MongoDB 연결 URL | `mongodb://localhost:27017` | ✅ |
| `DATABASE_NAME` | 데이터베이스 이름 | `musashi` | ✅ |
| `SECRET_KEY` | JWT 서명용 비밀키 (32자 이상) | - | ✅ |
| `BACKEND_CORS_ORIGINS` | CORS 허용 오리진 | `http://localhost` | ❌ |
| `ENVIRONMENT` | 실행 환경 (development/production) | `production` | ❌ |
| `DEBUG` | 디버그 모드 | `false` | ❌ |
| `LOG_LEVEL` | 로그 레벨 (debug/info/warning/error) | `info` | ❌ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 토큰 만료 시간(분) | `11520` | ❌ |

### 환경 변수 예시

```bash
# .env 파일
MONGODB_URL=mongodb://mongodb:27017
DATABASE_NAME=musashi
SECRET_KEY=your-secret-key-minimum-32-characters
BACKEND_CORS_ORIGINS=http://localhost,https://yourdomain.com
ENVIRONMENT=production
LOG_LEVEL=info
```

---

## 🌐 포트 및 헬스체크

### 포트 구성

| 포트 | 서비스 | 설명 |
|------|--------|------|
| `80` | Frontend | React 애플리케이션 (nginx) |
| `8080` | Backend API | FastAPI REST API |
| `27017` | MongoDB | 데이터베이스 (외부) |

### 헬스체크 엔드포인트

```bash
# Frontend 헬스체크
curl http://localhost/health
# 응답: {"status": "ok"}

# Backend API 헬스체크
curl http://localhost/api/v1/health
# 응답: {"status": "healthy", "api": "v1", "timestamp": "2024-01-20T10:00:00Z"}

# Docker 헬스체크 상태
docker inspect musashi --format='{{.State.Health.Status}}'
# 응답: healthy
```

### Docker 헬스체크 설정

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/api/v1/health"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 40s
```

---

## 🔄 업그레이드 가이드

### 1. 백업

```bash
# MongoDB 백업
docker exec musashi-mongodb mongodump \
  --db musashi \
  --out /backup/musashi-$(date +%Y%m%d)

# 백업 파일 복사
docker cp musashi-mongodb:/backup ./backup-$(date +%Y%m%d)
```

### 2. 새 버전으로 업그레이드

```bash
# 기존 컨테이너 중지
docker stop musashi

# 새 이미지 Pull
docker pull ghcr.io/imiml/musashi:v2.0.0

# 이미지 서명 검증 (선택사항)
cosign verify ghcr.io/imiml/musashi:v2.0.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/imiml/musashi/\.github/workflows/.*'

# 새 버전 실행
docker run -d \
  --name musashi-new \
  -p 80:80 \
  -p 8080:8000 \
  --env-file .env \
  ghcr.io/imiml/musashi:v2.0.0

# 확인 후 기존 컨테이너 제거
docker rm musashi
docker rename musashi-new musashi
```

### 3. 롤백 (필요시)

```bash
# 이전 버전으로 복구
docker stop musashi
docker run -d \
  --name musashi \
  --env-file .env \
  ghcr.io/imiml/musashi:v1.0.0

# 데이터 복원
docker cp ./backup-20240120 musashi-mongodb:/restore
docker exec musashi-mongodb mongorestore --db musashi /restore/musashi
```

---

## ❓ FAQ

### Q: MongoDB 연결 오류가 발생합니다

```bash
# MongoDB 연결 테스트
docker exec musashi python -c "
from pymongo import MongoClient
client = MongoClient('mongodb://host.docker.internal:27017')
print(client.server_info()['version'])
"

# 해결방법
# 1. MongoDB가 실행 중인지 확인
docker ps | grep mongo

# 2. 네트워크 설정 확인 (macOS/Windows)
--add-host host.docker.internal:host-gateway
```

### Q: 기본 관리자 계정은 무엇인가요?

첫 실행 시 자동으로 생성됩니다:
- Username: `admin`
- Password: `changeme123!` (즉시 변경 권장)

### Q: 포트를 변경하고 싶습니다

```bash
# 다른 포트로 매핑
docker run -d \
  --name musashi \
  -p 8080:80 \      # Frontend를 8080으로
  -p 9000:8000 \    # API를 9000으로
  --env-file .env \
  ghcr.io/imiml/musashi:latest
```

### Q: SSL/TLS를 설정하려면?

리버스 프록시 사용을 권장합니다:

```nginx
server {
    listen 443 ssl;
    server_name musashi.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Q: 백업과 복원은 어떻게 하나요?

```bash
# 백업
docker exec musashi-mongodb mongodump --db musashi --out /backup
docker cp musashi-mongodb:/backup ./backup

# 복원
docker cp ./backup musashi-mongodb:/restore
docker exec musashi-mongodb mongorestore --db musashi /restore/musashi
```

### Q: 멀티 플랫폼 지원은?

AMD64와 ARM64 아키텍처를 모두 지원합니다:
- `linux/amd64`: Intel/AMD 프로세서
- `linux/arm64`: Apple Silicon (M1/M2), ARM 서버

### Q: 로그는 어떻게 확인하나요?

```bash
# 실시간 로그
docker logs -f musashi

# 최근 100줄
docker logs --tail 100 musashi

# 특정 시간 이후
docker logs --since 2h musashi
```

---

## 📚 추가 문서

- 📖 [설치 가이드](./INSTALL.md) - 상세한 설치 및 설정 방법
- 🔐 [보안 정책](./SECURITY.md) - 보안 취약점 제보 및 정책
- 🤝 [기여 가이드](./CONTRIBUTING.md) - 프로젝트 기여 방법
- 📝 [변경 이력](./CHANGELOG.md) - 버전별 변경사항
- 📋 [API 문서](http://localhost:8080/api/docs) - OpenAPI/Swagger 문서

---

## 🏗️ 기술 스택

<table>
<tr>
<td align="center"><b>Frontend</b></td>
<td align="center"><b>Backend</b></td>
<td align="center"><b>Database</b></td>
<td align="center"><b>DevOps</b></td>
</tr>
<tr>
<td>

- React 18
- TypeScript
- React Flow
- Tailwind CSS
- Vite

</td>
<td>

- Python 3.12
- FastAPI
- Pydantic
- Motor
- JWT

</td>
<td>

- MongoDB 7.0
- Document Store
- GridFS (planned)

</td>
<td>

- Docker
- GitHub Actions
- Cosign
- Trivy

</td>
</tr>
</table>

---

## 🤝 기여하기

Musashi는 오픈소스 프로젝트입니다. 기여를 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조하세요.

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 🔗 링크

- [GitHub Repository](https://github.com/imiml/musashi)
- [Docker Hub](https://hub.docker.com/r/musashi/musashi)
- [Issue Tracker](https://github.com/imiml/musashi/issues)
- [Discussions](https://github.com/imiml/musashi/discussions)

---

## 💬 지원

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **GitHub Discussions**: 질문 및 토론
- **Email**: support@musashi.dev

---

<div align="center">
  <sub>Built with ❤️ by the Musashi Team</sub>
  <br>
  <sub>© 2024-2025 Musashi Team. All rights reserved.</sub>
</div>