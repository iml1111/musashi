# Changelog

All notable changes to Musashi will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚀 Coming Soon
- Performance optimization for large workflows
- Advanced MCP server integration
- Real-time collaboration features
- Workflow templates marketplace
- AI-powered workflow suggestions

---

## [1.0.0] - 2025-01-20

### 🎉 Initial Release

**Musashi** - AI Agent Workflow Design Tool  
*"Cut the code. Shape the flow."* - 코드를 줄이고, 플로우를 만드세요.

첫 번째 공식 릴리스입니다. 실행 기능 없이 순수한 디자인에 집중하는 AI 에이전트 워크플로우 디자인 도구입니다.

### ✨ Added

#### Core Features
- **Visual Workflow Editor** 
  - React Flow 기반 드래그 앤 드롭 인터페이스
  - Dagre 자동 레이아웃 알고리즘
  - 노드 자동 정렬 및 최적 배치
  - 실시간 뷰포트 조정

- **Node System**
  - **Agent Node**: AI 에이전트 구성 (Model, Temperature, Max Tokens)
  - **Function Node**: 커스텀 함수 정의 및 파라미터 설정
  - **MCP Node**: Model Context Protocol 서버 통합
  - **User Input Node**: 사용자 입력 수집
  - **Final Output Node**: 워크플로우 최종 결과 출력
  - **Connected Inputs**: 노드 간 입력 연결 관리

- **Advanced Prompt Engineering**
  - System prompt 템플릿 지원
  - 변수 바인딩 (`{{variable}}` 형식)
  - Multi-line prompt 편집기
  - Prompt 유효성 검증

- **Workflow Management**
  - 워크플로우 생성/수정/삭제
  - JSON 형식 내보내기/가져오기
  - 버전 관리 시스템 호환
  - 워크플로우 복제 기능

#### Collaboration Features
- **Team Management**
  - 팀 기반 워크플로우 격리
  - 팀 멤버 초대 및 관리
  - 팀별 리소스 할당

- **RBAC (Role-Based Access Control)**
  - **Admin**: 전체 시스템 관리
  - **Editor**: 워크플로우 생성/수정
  - **Viewer**: 읽기 전용 접근
  - 세분화된 권한 설정

- **Sharing & Export**
  - 공개 공유 링크 생성
  - 읽기 전용 share token
  - PDF/PNG 내보내기 (예정)

#### User Experience
- **UI/UX Enhancements**
  - 다크 모드 지원
  - 반응형 디자인
  - 키보드 단축키
  - 실행 취소/다시 실행
  - 자동 저장 (5초 간격)

- **Workflow Visualization**
  - 미니맵 네비게이션
  - 줌 인/아웃 컨트롤
  - 그리드 스냅 정렬
  - 연결선 애니메이션

- **Node Sidebar**
  - 노드 속성 실시간 편집
  - 입력 유효성 검증
  - 도움말 툴팁
  - 접기/펼치기 섹션

#### Technical Implementation
- **Frontend Stack**
  - React 18 with TypeScript
  - React Flow for workflow visualization
  - Dagre for automatic layout
  - Tailwind CSS for styling
  - Zustand for state management
  - Vite for build tooling

- **Backend Stack**
  - Python 3.12 with FastAPI
  - Motor for async MongoDB operations
  - Pydantic for data validation
  - JWT for authentication
  - Bcrypt for password hashing

- **Database**
  - MongoDB 7.0
  - Document-based workflow storage
  - Indexed queries for performance
  - GridFS for large workflows (future)

- **DevOps & CI/CD**
  - Docker multi-stage builds
  - Multi-architecture support (amd64/arm64)
  - GitHub Actions workflows
  - Automated testing pipeline
  - Semantic versioning

### 🔒 Security
- **Container Security**
  - Cosign keyless signing
  - SBOM generation (SPDX, CycloneDX)
  - Trivy vulnerability scanning
  - Non-root container execution
  - Read-only root filesystem

- **Application Security**
  - JWT token authentication
  - Bcrypt password hashing
  - CORS configuration
  - Rate limiting (planned)
  - SQL injection prevention

- **CI/CD Security**
  - Secret scanning
  - Dependency vulnerability checks
  - Container image scanning
  - SARIF report generation
  - Security advisories

### 📦 Infrastructure
- **Container Registry**
  - GitHub Container Registry (GHCR)
  - Multi-platform images
  - Automated tagging
  - Image signing

- **Health Monitoring**
  - `/health` endpoint
  - `/api/v1/health` for backend
  - Docker health checks
  - Prometheus metrics (planned)

- **Deployment Options**
  - Docker Compose
  - Kubernetes (Helm chart planned)
  - Single container mode
  - Development mode

### 🧪 Testing
- **Test Coverage**
  - Frontend: ~60% (target: 80%)
  - Backend: ~66% (target: 80%)
  - E2E: Major user flows

- **Test Types**
  - Unit tests (Vitest, pytest)
  - Integration tests
  - E2E tests (Playwright)
  - Security tests

### 📚 Documentation
- **User Documentation**
  - README.md with quickstart
  - INSTALL.md with detailed setup
  - User guide (in progress)
  - Video tutorials (planned)

- **Developer Documentation**
  - CONTRIBUTING.md with guidelines
  - SECURITY.md with policies
  - API documentation (OpenAPI)
  - Component storybook (planned)

- **AI Development**
  - CLAUDE.md for AI assistants
  - Component guidelines
  - Code conventions
  - Architecture decisions

### 🐛 Fixed
- MongoDB connection issues in Docker environment
- CORS configuration for cross-origin requests
- Frontend routing in production builds
- Node positioning after layout changes
- Authentication token expiration handling

### 🔄 Changed
- Upgraded React from 17 to 18
- Migrated from JavaScript to TypeScript
- Switched from Express to FastAPI
- Updated Docker base images to Alpine
- Improved build performance with Vite

### ⚠️ Known Issues
- Test coverage below target levels
- Some E2E tests flaky on CI
- Performance degradation with 100+ nodes
- Memory leak in long-running sessions (investigating)
- Safari compatibility issues with some features

### 👥 Contributors
- **Core Team**
  - @imiml - Project Lead & Architecture
  - Claude AI - Development Assistant

- **Special Thanks**
  - React Flow team for the excellent library
  - FastAPI community for the framework
  - All early testers and feedback providers

### 📈 Statistics
- **Lines of Code**: ~15,000
- **Components**: 47
- **API Endpoints**: 23
- **Docker Image Size**: ~150MB
- **Build Time**: ~2 minutes
- **Test Execution**: ~30 seconds

### 🔗 Links
- [GitHub Repository](https://github.com/imiml/musashi)
- [Docker Hub](https://hub.docker.com/r/musashi/musashi)
- [Documentation](https://docs.musashi.dev)
- [Issue Tracker](https://github.com/imiml/musashi/issues)

---

## [0.1.0] - 2025-01-11 (Pre-release)

### Added
- Initial project setup
- Basic workflow editor prototype
- MongoDB integration
- Docker configuration
- GitHub Actions setup

### Notes
- Internal testing version
- Not released to public

---

*For upgrade instructions, see [INSTALL.md](./INSTALL.md#버전-업그레이드)*  
*For security information, see [SECURITY.md](./SECURITY.md)*  
*For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)*

---

**Legend:**
- 🎉 Major feature
- ✨ New feature
- 🐛 Bug fix
- 🔄 Changed
- ⚠️ Known issue
- 🔒 Security
- 📦 Infrastructure
- 🧪 Testing
- 📚 Documentation
- 🚀 Performance
- 💔 Breaking change