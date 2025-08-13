# Musashi Scripts

Collection of useful automation scripts

## 📦 merge-deps.sh

Dependencies Update PR들을 Auto으로 Approval하고 머지하는 Script입니다.

# ## Usage

```bash
./scripts/merge-deps.sh
```

# ## Feature

- Dependabot 또는 Renovate bot이 Created PR Auto 감지
- "dependencies" 또는 "deps" 라벨이 붙은 PR 감지
- 각 PR을 Auto으로 Approval(approve)
- 머지 가능한 PR을 Auto으로 머지
- Branch Auto Delete
- 컬러Pull한 Progress Situation 표Hour
- 상세한 Result Summary

# # # 필요 사항

- GitHub CLI (`gh`) 설치 및 Authentication
- Save소에 대한 쓰기 Permission
- `jq` JSON 프로세서 설치

# ## Examples Output

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

# ## Automation (GitHub Actions)

정기적으로 Execute하려면 GitHub Actions workflow를 Add하세요:

```yaml
name: Auto-merge Dependencies
on:
  schedule:
    - cron: '0 9 * * 1' # 매주 Month요Day 오전 9Hour
  workflow_dispatch: # Manual Execute도 가능

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

CI Environment을 로컬에서 재현하는 Script입니다.

# ## Usage

```bash
./scripts/ci-repro.sh
```

# ## Feature

- Python 3.12 Environment Validation
- Node.js 20 Environment Validation
- MongoDB Container Auto Start
- Backend/Frontend Testing Execute
- Docker Build Testing
- CI와 동Day한 Option으로 Execute
- Detailed log saving

---

더 많은 Script가 Add될 예정입니다.