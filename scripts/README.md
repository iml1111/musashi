# Musashi Scripts

유용한 자동화 스크립트 모음

## 📦 merge-deps.sh

의존성 업데이트 PR들을 자동으로 승인하고 머지하는 스크립트입니다.

### 사용법

```bash
./scripts/merge-deps.sh
```

### 기능

- Dependabot 또는 Renovate bot이 생성한 PR 자동 감지
- "dependencies" 또는 "deps" 라벨이 붙은 PR 감지
- 각 PR을 자동으로 승인(approve)
- 머지 가능한 PR을 자동으로 머지
- 브랜치 자동 삭제
- 컬러풀한 진행 상황 표시
- 상세한 결과 요약

### 필요 사항

- GitHub CLI (`gh`) 설치 및 인증
- 저장소에 대한 쓰기 권한
- `jq` JSON 프로세서 설치

### 예시 출력

```
🔄 Dependency PR Auto-Merger for iml1111/musashi
=========================================
📋 Finding dependency PRs...
Found 3 dependency PR(s) to process:
  PR #42: Bump axios from 1.4.0 to 1.5.0
  PR #43: Update react to 18.3.0
  PR #44: chore(deps): update typescript

Processing PR #42: Bump axios from 1.4.0 to 1.5.0
  Approving... ✓
  Merging... ✓

=========================================
📊 Summary:
  Successfully merged: 3
  Failed to merge: 0

✅ Done!
```

### 자동화 (GitHub Actions)

정기적으로 실행하려면 GitHub Actions workflow를 추가하세요:

```yaml
name: Auto-merge Dependencies
on:
  schedule:
    - cron: '0 9 * * 1' # 매주 월요일 오전 9시
  workflow_dispatch: # 수동 실행도 가능

jobs:
  merge-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Auto-merge dependency PRs
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: ./scripts/merge-deps.sh
```

## 🔧 ci-repro.sh

CI 환경을 로컬에서 재현하는 스크립트입니다.

### 사용법

```bash
./scripts/ci-repro.sh
```

### 기능

- Python 3.12 환경 검증
- Node.js 20 환경 검증
- MongoDB 컨테이너 자동 시작
- Backend/Frontend 테스트 실행
- Docker 빌드 테스트
- CI와 동일한 옵션으로 실행
- 상세한 로그 저장

---

더 많은 스크립트가 추가될 예정입니다.