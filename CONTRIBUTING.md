# 🤝 Musashi 기여 가이드

Musashi 프로젝트에 기여해 주셔서 감사합니다! 우리는 커뮤니티의 모든 기여를 환영하며, 여러분의 도움에 감사드립니다.

## 📋 목차

- [행동 강령](#행동-강령)
- [개발 환경 설정](#개발-환경-설정)
- [코드 기여 방법](#코드-기여-방법)
- [Conventional Commits](#conventional-commits)
- [테스트 및 린트](#테스트-및-린트)
- [Pull Request 프로세스](#pull-request-프로세스)
- [개발 가이드라인](#개발-가이드라인)
- [문서화](#문서화)
- [도움 받기](#도움-받기)

## 행동 강령

이 프로젝트에 참여함으로써 다음 행동 강령에 동의하는 것으로 간주됩니다:

- 🤝 **존중과 포용**: 모든 참여자를 존중하고 포용적인 환경 조성
- 👋 **신규 기여자 환영**: 새로운 참여자를 따뜻하게 맞이하고 도움 제공
- 💬 **건설적인 비판**: 개인 공격이 아닌 코드와 아이디어에 집중
- ✨ **피드백 수용**: 비판과 제안을 겸허히 받아들이기

## 개발 환경 설정

### 🔧 사전 요구사항

```bash
# 필수 도구 확인
node --version  # v20.0.0 이상
python --version  # 3.12 이상
docker --version  # 20.10.0 이상
git --version  # 2.0.0 이상
mongodb --version  # 7.0 이상 (로컬 개발 시)
```

### 🏗️ 빠른 시작 (Docker 권장)

```bash
# 전체 개발 환경 한 번에 설정
git clone https://github.com/imiml/musashi.git
cd musashi
make dev  # Docker로 전체 스택 실행

# 브라우저에서 확인
open http://localhost:3000  # Frontend
open http://localhost:8000/docs  # Backend API Docs
```

### 📦 프로젝트 설정

#### 1. 저장소 Fork 및 Clone

```bash
# 1. GitHub에서 Fork 버튼 클릭

# 2. Fork한 저장소 Clone
git clone https://github.com/YOUR_USERNAME/musashi.git
cd musashi

# 3. Upstream 저장소 추가
git remote add upstream https://github.com/imiml/musashi.git
git fetch upstream

# 4. 메인 브랜치 동기화
git checkout main
git merge upstream/main
```

#### 2. 브랜치 전략

##### 브랜치 이름 규칙

```bash
# 기능 개발
git checkout -b feat/workflow-export
git checkout -b feat/123-add-node-copy  # 이슈 번호 포함

# 버그 수정
git checkout -b fix/auth-token-expiry
git checkout -b fix/456-cors-error

# 문서 작업
git checkout -b docs/api-guide
git checkout -b docs/789-update-readme

# 긴급 수정 (hotfix)
git checkout -b hotfix/security-patch

# 리팩토링
git checkout -b refactor/api-structure

# 성능 개선
git checkout -b perf/query-optimization
```

##### 브랜치 보호 규칙

- `main`: 프로덕션 배포 브랜치 (직접 푸시 금지)
- `develop`: 개발 통합 브랜치 (PR만 허용)
- 기능 브랜치는 `develop`에서 분기
- 핫픽스는 `main`에서 분기 후 `main`과 `develop` 모두에 머지

### 🛠️ 개발 환경 구성

#### Backend 설정 (Python/FastAPI)

```bash
cd backend

# 가상 환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
pip install -r requirements-dev.txt  # 개발 도구

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 필요한 값 설정

# 개발 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend 설정 (React/TypeScript)

```bash
cd frontend

# 의존성 설치
npm install
npm install --save-dev @types/node  # TypeScript 정의

# 환경 변수 설정
cp .env.example .env.local
# VITE_API_URL 등 설정

# 개발 서버 실행
npm run dev  # http://localhost:3000
```

#### Docker 환경

```bash
# 전체 스택 실행 (개발 모드)
docker-compose -f docker-compose.dev.yml up

# 또는 Make 명령어 사용
make dev
```

### 🔨 개발 도구 설정

#### Pre-commit Hooks 설치

```bash
# pre-commit 설치
pip install pre-commit

# Git hooks 설정
pre-commit install
pre-commit install --hook-type commit-msg

# 수동 실행 (모든 파일 검사)
pre-commit run --all-files
```

`.pre-commit-config.yaml` 예시:
```yaml
repos:
  # Python 포맷터
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3.12

  # Python 린터
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.5
    hooks:
      - id: ruff
        args: [--fix]

  # JavaScript/TypeScript 포맷터
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.3
    hooks:
      - id: prettier
        files: \.(js|jsx|ts|tsx|css|md|json)$

  # Commit 메시지 검증
  - repo: https://github.com/commitizen-tools/commitizen
    rev: v3.12.0
    hooks:
      - id: commitizen
        stages: [commit-msg]
```

#### VS Code 설정 (권장)

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.ruffEnabled": true,
  "python.formatting.provider": "black",
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 코드 기여 방법

### 📝 이슈 생성

기여를 시작하기 전에:

1. **기존 이슈 확인**: 중복 방지를 위해 기존 이슈 검색
2. **이슈 템플릿 사용**: 적절한 템플릿 선택
3. **명확한 설명**: 재현 단계, 예상/실제 동작 설명
4. **환경 정보**: OS, 브라우저, Node/Python 버전 등

### 💡 기능 제안

1. **Discussion 먼저**: GitHub Discussions에서 논의 시작
2. **문제 정의**: 해결하려는 문제 명확히 설명
3. **사용 사례**: 구체적인 예시와 시나리오 제공
4. **구현 복잡도**: 예상 작업량과 영향 범위 고려

## Conventional Commits

### 📐 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 🏷️ Type (필수)

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat(workflow): 노드 복제 기능 추가` |
| `fix` | 버그 수정 | `fix(auth): JWT 토큰 만료 문제 해결` |
| `docs` | 문서 수정 | `docs(readme): 설치 가이드 업데이트` |
| `style` | 코드 포맷팅 (기능 변경 X) | `style(frontend): prettier 적용` |
| `refactor` | 코드 리팩토링 | `refactor(api): 라우터 구조 개선` |
| `perf` | 성능 개선 | `perf(db): 쿼리 최적화` |
| `test` | 테스트 추가/수정 | `test(workflow): 단위 테스트 추가` |
| `build` | 빌드 시스템/의존성 | `build(docker): 이미지 크기 최적화` |
| `ci` | CI/CD 설정 | `ci(github): release workflow 추가` |
| `chore` | 기타 작업 | `chore(deps): 패키지 업데이트` |
| `revert` | 커밋 되돌리기 | `revert: feat(workflow) 노드 복제 기능` |

### 📍 Scope (선택)

프로젝트의 영향 범위:
- `frontend`: React 애플리케이션
- `backend`: FastAPI 서버
- `workflow`: 워크플로우 기능
- `auth`: 인증/인가
- `db`: 데이터베이스
- `docker`: Docker 설정
- `docs`: 문서

### ✍️ Subject (필수)

- 50자 이내
- 현재 시제 사용
- 명령문으로 작성
- 마침표 없음
- 한글 가능

### 📄 Body (선택)

- 72자에서 줄바꿈
- "무엇을" 보다 "왜" 설명
- 이전 동작과 비교 설명

### 🔗 Footer (선택)

- **Breaking Changes**: `BREAKING CHANGE: 설명`
- **이슈 참조**: `Fixes #123`, `Closes #456`
- **관련 PR**: `Related to #789`

### 📌 커밋 예시

```bash
# 좋은 예시 ✅
feat(workflow): 워크플로우 내보내기 기능 추가

사용자가 워크플로우를 JSON 형식으로 내보낼 수 있도록 구현.
Git 버전 관리와의 통합을 위해 필요한 기능.

- JSON 형식으로 워크플로우 직렬화
- 다운로드 버튼 UI 추가
- 내보내기 시 검증 로직 포함

Closes #123

# 나쁜 예시 ❌
update code  # 너무 모호함
Fixed bug  # 어떤 버그인지 불명확
WIP  # 작업 중인 커밋은 푸시하지 말 것
```

### 🔧 Commitizen 사용 (권장)

```bash
# Commitizen 설치
npm install -g commitizen
npm install -g cz-conventional-changelog

# .czrc 파일 생성
echo '{"path": "cz-conventional-changelog"}' > ~/.czrc

# 대화형 커밋
git add .
git cz  # 또는 cz
```

## 테스트 및 린트

### 🧪 테스트 실행

#### Backend 테스트

```bash
cd backend

# 모든 테스트 실행
pytest

# 커버리지 포함
pytest --cov=app --cov-report=html --cov-report=term

# 특정 테스트만
pytest tests/test_auth.py::TestAuth::test_login

# 병렬 실행 (빠름)
pytest -n auto

# 실패한 테스트만 재실행
pytest --lf
```

테스트 작성 예시:
```python
# tests/test_workflow.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_workflow():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/workflows",
            json={"name": "Test Workflow", "nodes": []}
        )
        assert response.status_code == 201
        assert response.json()["name"] == "Test Workflow"
```

#### Frontend 테스트

```bash
cd frontend

# 단위 테스트
npm test

# 커버리지 리포트
npm run test:coverage

# Watch 모드
npm run test:watch

# E2E 테스트 (Playwright)
npm run test:e2e

# 특정 테스트만
npm test -- --testNamePattern="WorkflowEditor"
```

테스트 작성 예시:
```typescript
// src/components/WorkflowEditor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowEditor } from './WorkflowEditor';

describe('WorkflowEditor', () => {
  it('should add a new node when button is clicked', () => {
    render(<WorkflowEditor />);
    
    const addButton = screen.getByText('Add Node');
    fireEvent.click(addButton);
    
    expect(screen.getByText('New Node')).toBeInTheDocument();
  });
});
```

### 🎨 린트 및 포맷팅

#### Python (Backend)

```bash
cd backend

# Ruff 린터 실행
ruff check .

# 자동 수정
ruff check --fix .

# Black 포맷터
black .

# 타입 체크 (mypy)
mypy app/

# 모든 검사 한 번에
make lint  # Makefile이 있는 경우
```

`.ruff.toml` 설정:
```toml
[tool.ruff]
line-length = 88
target-version = "py312"
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
ignore = ["E501"]  # Line too long

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]  # Unused imports
```

#### TypeScript (Frontend)

```bash
cd frontend

# ESLint 실행
npm run lint

# 자동 수정
npm run lint:fix

# Prettier 포맷팅
npm run format

# TypeScript 타입 체크
npm run typecheck

# 모든 검사
npm run check  # package.json에 정의된 경우
```

`.eslintrc.json` 설정:
```json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### ✅ 테스트 커버리지 요구사항

| 영역 | 최소 커버리지 | 목표 커버리지 |
|------|--------------|--------------|
| Backend (Python) | 80% | 90% |
| Frontend (React) | 70% | 85% |
| E2E Tests | 주요 시나리오 | 모든 사용자 경로 |

## Pull Request 프로세스

### 📋 PR 체크리스트

PR을 제출하기 전에:

- [ ] upstream/main과 동기화
- [ ] 모든 테스트 통과 (단위 테스트 + E2E)
- [ ] 린트 에러 없음 (`make lint` 통과)
- [ ] 타입 체크 통과 (`npm run typecheck`, `mypy`)
- [ ] 문서 업데이트 (API 변경 시 필수)
- [ ] 데이터베이스 스키마 변경 시 README.md 업데이트
- [ ] CHANGELOG.md 업데이트 (주요 변경사항)
- [ ] 커밋 메시지 Conventional Commits 준수
- [ ] UI 변경사항 스크린샷 첨부 (Before/After)
- [ ] Breaking Change 여부 명시
- [ ] 성능 영향 검토 (필요시 벤치마크 결과)

### 📝 PR 템플릿

`.github/pull_request_template.md`:
```markdown
## 📋 설명
<!-- 변경사항에 대한 간단한 설명 -->

## 🎯 변경 유형
<!-- 해당하는 항목에 체크 -->
- [ ] 🐛 버그 수정 (Bug fix)
- [ ] ✨ 새 기능 (New feature)
- [ ] 💥 Breaking change
- [ ] 📝 문서 업데이트 (Documentation)
- [ ] ♻️ 리팩토링 (Refactoring)
- [ ] ⚡ 성능 개선 (Performance)
- [ ] 🎨 UI/UX 개선

## 🔗 관련 이슈
<!-- Closes #123 형식으로 이슈 연결 -->
Closes #

## 📸 스크린샷 (UI 변경사항)
<!-- UI 변경이 있다면 전/후 스크린샷 -->
| Before | After |
|--------|-------|
| 이전 스크린샷 | 변경 후 스크린샷 |

## ✅ 테스트
<!-- 수행한 테스트 설명 -->
- [ ] 단위 테스트 추가/수정
- [ ] 통합 테스트 통과
- [ ] E2E 테스트 통과
- [ ] 수동 테스트 시나리오:
  ```
  1. 로그인
  2. 워크플로우 생성
  3. 노드 추가 확인
  ```

## 📊 성능 영향
<!-- 성능에 영향이 있다면 설명 -->
- [ ] 성능 영향 없음
- [ ] 성능 개선: [벤치마크 결과]
- [ ] 성능 저하 가능성: [완화 방안]

## 📝 체크리스트
- [ ] 코드가 프로젝트 스타일 가이드를 따름
- [ ] 셀프 리뷰 완료
- [ ] 주석 추가 (복잡한 로직)
- [ ] 문서 업데이트 (README, API Docs)
- [ ] DB 스키마 문서 업데이트 (변경 시)
- [ ] 환경 변수 문서화 (추가 시)
- [ ] Breaking change 없음 (있다면 BREAKING CHANGE 섹션 추가)

## 💔 BREAKING CHANGE
<!-- Breaking change가 있다면 마이그레이션 가이드 제공 -->

## 🔄 마이그레이션 가이드
<!-- Breaking change 시 필수 -->

## 💬 리뷰어를 위한 노트
<!-- 리뷰어가 특별히 주의 깊게 봐야 할 부분 -->
```

### 🔄 PR 워크플로우

```bash
# 1. 최신 변경사항 가져오기
git fetch upstream
git checkout main
git merge upstream/main

# 2. 기능 브랜치 rebase
git checkout feat/your-feature
git rebase main

# 3. 충돌 해결 (있는 경우)
git status
# 충돌 파일 수정
git add .
git rebase --continue

# 4. 푸시
git push origin feat/your-feature

# 5. GitHub에서 PR 생성
```

### 👀 코드 리뷰 가이드

#### 리뷰어를 위한 가이드

- **긍정적인 피드백 먼저**: 좋은 점을 먼저 언급
- **구체적인 제안**: 모호한 표현 대신 구체적인 개선안 제시
- **질문 형식 활용**: "~하는 것은 어떨까요?"
- **중요도 표시**: 
  - 🔴 **필수**: 반드시 수정 필요
  - 🟡 **제안**: 개선하면 좋음
  - 🟢 **참고**: 선택사항

#### 작성자를 위한 가이드

- **리뷰 댓글에 답변**: 모든 댓글에 응답
- **수정사항 명시**: 어떻게 수정했는지 설명
- **의견 차이 논의**: 건설적으로 토론
- **감사 표현**: 리뷰어의 시간과 노력에 감사

## 개발 가이드라인

### 🎨 Frontend 가이드라인

#### React 베스트 프랙티스

```typescript
// ✅ 좋은 예: 함수형 컴포넌트 + Hooks
const WorkflowEditor: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  
  const handleAddNode = useCallback(() => {
    setNodes(prev => [...prev, createNode()]);
  }, []);
  
  return (
    <div className="workflow-editor">
      {/* ... */}
    </div>
  );
};

// ❌ 나쁜 예: 클래스 컴포넌트 (레거시)
class WorkflowEditor extends React.Component {
  // 새 코드에서는 사용하지 않음
}
```

#### 컴포넌트 구조

```
src/
├── components/
│   ├── common/        # 재사용 가능한 공통 컴포넌트
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── workflow/      # 워크플로우 관련 컴포넌트
│   │   ├── WorkflowEditor.tsx
│   │   └── NodePanel.tsx
│   └── layout/        # 레이아웃 컴포넌트
│       ├── Header.tsx
│       └── Sidebar.tsx
├── hooks/            # 커스텀 훅
├── services/         # API 통신
├── store/           # 상태 관리 (Zustand)
├── types/           # TypeScript 타입 정의
└── utils/           # 유틸리티 함수
```

### 🔧 Backend 가이드라인

#### FastAPI 베스트 프랙티스

```python
# ✅ 좋은 예: 의존성 주입, 타입 힌트
from fastapi import APIRouter, Depends, HTTPException
from typing import List

router = APIRouter(prefix="/api/v1/workflows", tags=["workflows"])

@router.get("/", response_model=List[WorkflowResponse])
async def get_workflows(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    워크플로우 목록 조회
    
    - **skip**: 건너뛸 항목 수
    - **limit**: 반환할 최대 항목 수
    """
    workflows = await WorkflowService(db).get_workflows(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return workflows
```

#### 프로젝트 구조

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   └── workflows.py
│   │       └── router.py
│   ├── core/
│   │   ├── config.py      # 설정
│   │   ├── security.py    # 보안
│   │   └── database.py    # DB 연결
│   ├── models/
│   │   ├── user.py        # Pydantic 모델
│   │   └── workflow.py
│   ├── services/
│   │   ├── auth.py        # 비즈니스 로직
│   │   └── workflow.py
│   └── main.py           # 앱 엔트리포인트
├── tests/
├── alembic/              # DB 마이그레이션
└── requirements.txt
```

## 문서화

### 📚 코드 문서화

#### Python Docstring

```python
def calculate_workflow_complexity(workflow: Workflow) -> float:
    """
    워크플로우의 복잡도를 계산합니다.
    
    복잡도는 노드 수, 엣지 수, 분기 수를 기반으로 계산됩니다.
    
    Args:
        workflow: 분석할 워크플로우 객체
        
    Returns:
        float: 0.0 ~ 1.0 사이의 복잡도 점수
        
    Raises:
        ValueError: 워크플로우가 비어있는 경우
        
    Example:
        >>> workflow = Workflow(nodes=[...], edges=[...])
        >>> complexity = calculate_workflow_complexity(workflow)
        >>> print(f"Complexity: {complexity:.2f}")
    """
    if not workflow.nodes:
        raise ValueError("워크플로우에 노드가 없습니다")
        
    # 복잡도 계산 로직
    return complexity
```

#### TypeScript JSDoc

```typescript
/**
 * 워크플로우 노드를 생성합니다.
 * 
 * @param {string} type - 노드 타입 (input, process, output)
 * @param {Partial<Node>} properties - 추가 속성
 * @returns {Node} 생성된 노드 객체
 * 
 * @example
 * const node = createNode('process', { label: 'Process Data' });
 */
export function createNode(
  type: NodeType,
  properties?: Partial<Node>
): Node {
  return {
    id: generateId(),
    type,
    position: { x: 0, y: 0 },
    data: {},
    ...properties
  };
}
```

### 📖 README 업데이트

데이터베이스 스키마나 API 변경 시 반드시 README.md 업데이트:

```markdown
## 📊 Database Schema

### workflows Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "nodes": [
    {
      "id": "string",
      "type": "string",
      "position": { "x": "number", "y": "number" },
      "data": "object"
    }
  ],
  "edges": [...],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```
```

## 도움 받기

### 💬 커뮤니케이션 채널

- **GitHub Discussions**: 질문과 토론
- **GitHub Issues**: 버그 리포트와 기능 요청
- **Discord**: [Musashi Community](https://discord.gg/musashi)
- **Email**: maintainers@musashi.dev

### 🎓 학습 리소스

- [프로젝트 문서](https://docs.musashi.dev)
- [API 문서](http://localhost:8000/docs)
- [컴포넌트 스토리북](http://localhost:6006)
- [비디오 튜토리얼](https://youtube.com/musashi)

### 🏆 기여자 인정

기여자는 다음에서 인정받습니다:
- CHANGELOG.md의 기여자 섹션
- README.md의 Contributors 섹션
- GitHub Contributors 페이지
- 주요 기여자는 Core Team으로 초대

## 라이선스

기여함으로써 귀하의 기여가 프로젝트와 동일한 라이선스(MIT)로 라이선스됨에 동의합니다.

---

**감사합니다!** 여러분의 기여가 Musashi를 더 나은 프로젝트로 만듭니다. 🚀