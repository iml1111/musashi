# Musashi - AI Agent Workflow Design Tool

> "Cut the code. Shape the flow." - 코드를 줄이고, 플로우를 만드세요.

Musashi는 시각적인 워크플로우 생성에 중점을 둔 AI 에이전트 워크플로우 디자인 도구입니다. 실행 기능 없이 디자인에만 집중하여 가볍고 직관적인 워크플로우 제작 환경을 제공합니다.

## 🚀 빠른 시작

### 필수 요구사항
- Docker
- MongoDB (외부 인스턴스)

### 1️⃣ 환경 설정

```bash
# .env 파일 생성
make setup
# 또는
cp .env.example .env

# .env 파일을 편집하여 MongoDB 연결 정보 설정
# MONGODB_URL=mongodb://your-mongodb-host:27017/musashi
```

### 2️⃣ 애플리케이션 빌드 및 실행

```bash
# Docker 이미지 빌드
make build

# 애플리케이션 실행
make run
```

### 3️⃣ 애플리케이션 접속

- **웹 애플리케이션**: http://localhost
- **기본 관리자 계정**: `admin` / `1234`
- **API 문서**: http://localhost/docs

## 📋 기본 기능

### 🔐 인증 시스템
- JWT 기반 인증
- 역할 기반 접근 제어 (Admin/User)
- 관리자 전용 사용자 관리 패널

### 🌊 워크플로우 관리
- 시각적 워크플로우 생성 및 편집
- 노드 기반 플로우 차트 인터페이스
- JSON 형태로 워크플로우 내보내기
- 팀 기반 협업 지원

### 👥 사용자 관리
- 관리자의 사용자 계정 생성/수정/삭제
- 사용자 역할 및 상태 관리
- 프로필 관리 기능

## 🔧 고급 설정

### MongoDB 연결 설정

애플리케이션은 외부 MongoDB 인스턴스가 필요합니다. 연결 설정 방법:

#### 방법 1: .env 파일 사용 (권장)
```bash
# .env 파일 편집
MONGODB_URL=mongodb://username:password@your-mongodb-host:27017/musashi
DATABASE_NAME=musashi
SECRET_KEY=your-secure-secret-key
```

#### 방법 2: Docker 실행 시 환경변수 지정
```bash
docker run -d \
  --name musashi-app \
  -p 80:80 \
  -e MONGODB_URL="mongodb://username:password@your-mongodb-host:27017/musashi" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="your-secret-key" \
  musashi
```

### 인증된 MongoDB 연결
```bash
# 사용자명/비밀번호가 있는 MongoDB
export MONGODB_URL="mongodb://username:password@hostname:27017/database"

# MongoDB Atlas (클라우드)
export MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/database"

# 복제 세트 연결
export MONGODB_URL="mongodb://host1:27017,host2:27017,host3:27017/database?replicaSet=myReplicaSet"
```

### 보안 설정

#### JWT 시크릿 키 변경 (필수)
```bash
export SECRET_KEY="your-very-secure-random-secret-key-here"
```

#### CORS 설정
```bash
export BACKEND_CORS_ORIGINS="http://localhost:3000,https://yourdomain.com"
```

## 🛠️ 개발 환경 설정

### 로컬 개발 (Docker 없이)

#### 백엔드 개발
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 프론트엔드 개발
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

### 환경변수 파일 사용
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=musashi
SECRET_KEY=your-secret-key-here
```

## 🐳 Docker 설정 옵션

### 포트 설정
```bash
docker run -p 9000:8000 musashi:latest  # 포트 9000으로 접속
```

### 볼륨 마운트 (로그 저장)
```bash
docker run -v ./logs:/app/logs musashi:latest
```

### 네트워크 설정
```bash
# 기존 네트워크에 연결
docker run --network your-network musashi:latest

# MongoDB와 같은 네트워크 사용
docker run --network container:musashi-mongodb musashi:latest
```

## 📊 MongoDB 설정 가이드

### 개발 환경
```javascript
// MongoDB 연결 (인증 없음)
mongodb://localhost:27017

// Docker 컨테이너에서 호스트 MongoDB 연결
mongodb://host.docker.internal:27017
```

### 프로덕션 환경
```javascript
// 기본 인증
mongodb://username:password@hostname:27017/database

// SSL/TLS 연결
mongodb://username:password@hostname:27017/database?ssl=true

// MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/database
```

### MongoDB 인덱스 생성 (선택사항)
```javascript
// MongoDB shell에서 실행
use musashi

// 사용자 컬렉션 인덱스
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true, sparse: true })

// 워크플로우 컬렉션 인덱스
db.workflows.createIndex({ "owner_id": 1 })
db.workflows.createIndex({ "team_id": 1 })
db.workflows.createIndex({ "created_at": -1 })
```

## 🔍 문제 해결

### 일반적인 문제

#### 1. MongoDB 연결 오류
```bash
# MongoDB가 실행 중인지 확인
docker ps | grep mongo

# 연결 테스트
docker exec -it musashi-mongodb mongosh
```

#### 2. 포트 충돌
```bash
# 다른 포트 사용
docker run -p 9000:8000 musashi:latest
```

#### 3. 권한 문제
```bash
# 컨테이너 로그 확인
docker logs musashi-app

# 컨테이너 내부 접속
docker exec -it musashi-app /bin/bash
```

### 로그 확인
```bash
# 애플리케이션 로그
docker logs musashi-app

# MongoDB 로그
docker logs musashi-mongodb

# 실시간 로그 추적
docker logs -f musashi-app
```

## 🚀 배포 가이드

### Docker Hub에서 이미지 받기 (향후 제공)
```bash
# 이미지 다운로드
docker pull musashi/musashi:latest

# 실행
docker run -d \
  --name musashi-app \
  -p 8000:8000 \
  -e MONGODB_URL="mongodb://your-mongodb-host:27017" \
  musashi/musashi:latest
```

### 프로덕션 배포 체크리스트
- [ ] MongoDB 보안 설정 (인증, 방화벽)
- [ ] JWT 시크릿 키 변경
- [ ] HTTPS 설정 (리버스 프록시)
- [ ] 백업 전략 수립
- [ ] 모니터링 설정
- [ ] 로그 관리 설정

## 🏗️ 아키텍처

### 기술 스택
- **백엔드**: Python 3.12, FastAPI, Pydantic, Motor (async MongoDB)
- **프론트엔드**: React 18, TypeScript, React Flow, Dagre, Tailwind CSS
- **데이터베이스**: MongoDB
- **인증**: JWT + RBAC
- **컨테이너**: Docker

### 📊 데이터베이스 스키마

#### Users 컬렉션 (`users`)
사용자 계정 및 인증 정보를 저장합니다.

```javascript
{
  "_id": ObjectId("..."),           // MongoDB 고유 ID
  "username": "admin",              // 사용자명 (고유값, 필수)
  "email": "admin@example.com",     // 이메일 (선택, EmailStr 검증)
  "full_name": "관리자",             // 전체 이름 (선택)
  "is_active": true,                // 활성 상태 (기본값: true)
  "role": "admin",                  // 사용자 역할 ("admin" | "user")
  "hashed_password": "...",         // bcrypt 해시된 비밀번호
  "created_at": ISODate("..."),     // 생성일시 (UTC)
  "updated_at": ISODate("...")      // 수정일시 (UTC)
}
```

**인덱스**:
- `username` (unique)
- `email` (unique, sparse)

**역할 (Role)**:
- `admin`: 모든 사용자 관리 권한
- `user`: 일반 사용자 권한

#### Workflows 컬렉션 (`workflows`)
AI 에이전트 워크플로우 데이터를 저장합니다.

```javascript
{
  "_id": ObjectId("..."),           // MongoDB 고유 ID
  "name": "Customer Support Flow",  // 워크플로우 이름 (필수)
  "description": "고객 지원 자동화", // 워크플로우 설명 (선택)
  "owner_id": "user_object_id",     // 소유자 사용자 ID (필수)
  "team_id": "team_object_id",      // 팀 ID (선택, 팀 협업용)
  "version": 1,                     // 버전 번호 (기본값: 1)
  "is_public": false,               // 공개 여부 (기본값: false)
  "share_token": "abc123...",       // 공유 토큰 (읽기 전용 공유용)
  "nodes": [                        // 워크플로우 노드 배열
    {
      "id": "node-1",               // 노드 고유 ID
      "type": "ai-agent",           // 노드 타입
      "label": "GPT-4 Technical",   // 노드 표시명
      "properties": {               // 노드별 설정값
        "model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 1000
      },
      "position_x": 100.0,          // X 좌표 (선택, Dagre 자동 배치)
      "position_y": 200.0           // Y 좌표 (선택, Dagre 자동 배치)
    }
  ],
  "edges": [                        // 워크플로우 연결선 배열
    {
      "id": "edge-1",               // 연결선 고유 ID
      "source": "node-1",           // 시작 노드 ID
      "target": "node-2",           // 끝 노드 ID
      "label": "성공 시"            // 연결선 라벨 (선택)
    }
  ],
  "metadata": {                     // 추가 메타데이터
    "tags": ["customer", "support"],
    "category": "business",
    "difficulty": "medium"
  },
  "created_at": ISODate("..."),     // 생성일시 (UTC)
  "updated_at": ISODate("...")      // 수정일시 (UTC)
}
```

**인덱스**:
- `owner_id`
- `team_id`
- `created_at` (desc)

**노드 타입 예시**:
- `ai-agent`: AI 에이전트 (GPT, Claude 등)
- `decision`: 조건 분기
- `input`: 사용자 입력
- `output`: 결과 출력
- `api-call`: 외부 API 호출
- `transform`: 데이터 변환

### 🔐 보안 및 인증

#### JWT 토큰 구조
```javascript
{
  "sub": "user_object_id",          // 사용자 ID (subject)
  "role": "admin",                  // 사용자 역할
  "exp": 1234567890,                // 만료시간 (8일)
  "iat": 1234567890,                // 발급시간
  "iss": "musashi"                  // 발급자
}
```

#### 권한 매트릭스
| 기능 | Admin | User |
|------|-------|------|
| 자신의 워크플로우 CRUD | ✅ | ✅ |
| 다른 사용자 워크플로우 조회 | ✅ | ❌ |
| 사용자 관리 (생성/수정/삭제) | ✅ | ❌ |
| 시스템 설정 변경 | ✅ | ❌ |
| 공개 워크플로우 조회 | ✅ | ✅ |

### 디렉토리 구조
```
musashi/
├── backend/           # FastAPI 백엔드
│   ├── app/
│   │   ├── api/      # API 엔드포인트
│   │   ├── models/   # Pydantic 모델
│   │   ├── services/ # 비즈니스 로직
│   │   └── core/     # 설정 및 데이터베이스
│   └── requirements.txt
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── Dockerfile         # 단일 컨테이너 빌드
├── run-docker.sh      # 앱 실행 스크립트
├── run-mongodb.sh     # MongoDB 실행 스크립트
└── README.md
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🆘 지원

- **이슈 신고**: [GitHub Issues](https://github.com/your-username/musashi/issues)
- **문서**: 이 README.md 파일
- **API 문서**: http://localhost:8000/docs (애플리케이션 실행 후)

---

**Musashi - "Cut the code. Shape the flow."** 🥋
