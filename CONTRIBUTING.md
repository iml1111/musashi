# 🤝 Musashi Contributing Guide

Thank you for contributing to the Musashi project! We welcome all contributions from the community and appreciate your help.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Environment Setup](#development-environment-setup)
- [How to Contribute Code](#how-to-contribute-code)
- [Conventional Commits](#conventional-commits)
- [Testing and Linting](#testing-and-linting)
- [Pull Request Process](#pull-request-process)
- [Development Guidelines](#development-guidelines)
- [Documentation](#documentation)
- [Getting Help](#getting-help)

## Code of Conduct

By participating in this project, you are considered to agree to the following code of conduct:

- 🤝 **Respect and Inclusion**: Respect all participants and create an inclusive environment
- 👋 **Welcome New Contributors**: Warmly welcome new participants and provide help
- 💬 **Constructive Criticism**: Focus on code and ideas, not personal attacks
- ✨ **Accept Feedback**: Humbly accept criticism and suggestions

## Development Environment Setup

### 🔧 Prerequisites

```bash
# Check required tools
node --version  # v20.0.0 or higher
python --version  # 3.12 or higher
docker --version  # 20.10.0 or higher
git --version  # 2.0.0 or higher
mongodb --version  # 7.0 or higher (for local development)
```

### 🏗️ Quick Start (Docker Recommended)

```bash
# Set up entire development environment at once
git clone https://github.com/iml1111/musashi.git
cd musashi
make dev  # Run backend + MongoDB with Docker

# Frontend development (run separately)
cd frontend && npm install && npm run dev

# Check in browser
open http://localhost:3000  # Frontend (Vite dev server)
open http://localhost:8000/docs  # Backend API Docs
```

### 📦 Project Setup

#### 1. Fork and Clone Repository

```bash
# 1. Click Fork button on GitHub

# 2. Clone forked repository
git clone https://github.com/YOUR_USERNAME/musashi.git
cd musashi

# 3. Add upstream repository
git remote add upstream https://github.com/iml1111/musashi.git
git fetch upstream

# 4. Sync main branch
git checkout main
git merge upstream/main
```

#### 2. Branch Strategy

##### Branch Naming Rules

```bash
# Feature development
git checkout -b feat/workflow-export
git checkout -b feat/123-add-node-copy  # Include issue number

# Bug fixes
git checkout -b fix/auth-token-expiry
git checkout -b fix/456-cors-error

# Documentation work
git checkout -b docs/api-guide
git checkout -b docs/789-update-readme

# Emergency fixes (hotfix)
git checkout -b hotfix/security-patch

# Refactoring
git checkout -b refactor/api-structure

# Performance improvements
git checkout -b perf/query-optimization
```

##### Branch Protection Rules

- `main`: Production deployment branch (direct push forbidden)
- `develop`: Development integration branch (PR only)
- Feature branches branch from `develop`
- Hotfixes branch from `main` and merge to both `main` and `develop`

### 🛠️ Development Environment Configuration

#### Backend Setup (Python/FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development tools

# Set environment variables
cp .env.example .env
# Edit .env file to set required values

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup (React/TypeScript)

```bash
cd frontend

# Install dependencies
npm install
npm install --save-dev @types/node  # TypeScript definitions

# Set environment variables
cp .env.example .env.local
# Set VITE_API_URL etc.

# Run development server
npm run dev  # http://localhost:3000
```

#### Docker Environment

```bash
# Run entire stack (development mode)
docker-compose -f docker-compose.dev.yml up

# Or use Make command
make dev
```

### 🔨 Development Tools Setup

#### Install Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Set up Git hooks
pre-commit install
pre-commit install --hook-type commit-msg

# Manual run (check all files)
pre-commit run --all-files
```

`.pre-commit-config.yaml` example:
```yaml
repos:
  # Python formatter
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3.12

  # Python linter
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.5
    hooks:
      - id: ruff
        args: [--fix]

  # JavaScript/TypeScript formatter
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.3
    hooks:
      - id: prettier
        files: \.(js|jsx|ts|tsx|css|md|json)$

  # Commit message validation
  - repo: https://github.com/commitizen-tools/commitizen
    rev: v3.12.0
    hooks:
      - id: commitizen
        stages: [commit-msg]
```

#### VS Code Settings (Recommended)

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

## How to Contribute Code

### 📝 Create Issues

Before starting to contribute:

1. **Check existing issues**: Search existing issues to avoid duplicates
2. **Use issue templates**: Select appropriate template
3. **Clear description**: Describe reproduction steps, expected/actual behavior
4. **Environment info**: OS, browser, Node/Python versions, etc.

### 💡 Feature Suggestions

1. **Discussion first**: Start discussion in GitHub Discussions
2. **Define problem**: Clearly explain the problem to solve
3. **Use cases**: Provide specific examples and scenarios
4. **Implementation complexity**: Consider expected workload and impact scope

## Conventional Commits

### 📐 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 🏷️ Type (Required)

| Type | Description | Example |
|------|------|------|
| `feat` | Add new feature | `feat(workflow): add node duplication feature` |
| `fix` | Bug fix | `fix(auth): resolve JWT token expiration issue` |
| `docs` | Documentation update | `docs(readme): update installation guide` |
| `style` | Code formatting (no functional changes) | `style(frontend): apply prettier` |
| `refactor` | Code refactoring | `refactor(api): improve router structure` |
| `perf` | Performance improvement | `perf(db): optimize queries` |
| `test` | Add/update tests | `test(workflow): add unit tests` |
| `build` | Build system/dependencies | `build(docker): optimize image size` |
| `ci` | CI/CD configuration | `ci(github): add release workflow` |
| `chore` | Other tasks | `chore(deps): update packages` |
| `revert` | Revert commit | `revert: feat(workflow) node duplication feature` |

### 📍 Scope (Optional)

Project impact scope:
- `frontend`: React application
- `backend`: FastAPI server
- `workflow`: Workflow functionality
- `auth`: Authentication/authorization
- `db`: Database
- `docker`: Docker configuration
- `docs`: Documentation

### ✍️ Subject (Required)

- Within 50 characters
- Use present tense
- Write in imperative mood
- No period
- Korean acceptable

### 📄 Body (Optional)

- Line break at 72 characters
- Explain "why" rather than "what"
- Compare with previous behavior

### 🔗 Footer (Optional)

- **Breaking Changes**: `BREAKING CHANGE: description`
- **Issue References**: `Fixes #123`, `Closes #456`
- **Related PR**: `Related to #789`

### 📌 Commit Examples

```bash
# Good example ✅
feat(workflow): add workflow export feature

Implemented functionality for users to export workflows in JSON format.
Required feature for integration with Git version control.

- Serialize workflows to JSON format
- Add download button UI
- Include validation logic on export

Closes #123

# Bad example ❌
update code  # Too vague
Fixed bug  # Unclear which bug
WIP  # Don't push work-in-progress commits
```

### 🔧 Using Commitizen (Recommended)

```bash
# Install Commitizen
npm install -g commitizen
npm install -g cz-conventional-changelog

# Create .czrc file
echo '{"path": "cz-conventional-changelog"}' > ~/.czrc

# Interactive commit
git add .
git cz  # or cz
```

## Testing and Linting

### 🧪 Running Tests

#### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Include coverage
pytest --cov=app --cov-report=html --cov-report=term

# Specific tests only
pytest tests/test_auth.py::TestAuth::test_login

# Parallel execution (faster)
pytest -n auto

# Re-run failed tests only
pytest --lf
```

Test Writing Example:
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

#### Frontend Tests

```bash
cd frontend

# Unit tests
npm test

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch

# E2E tests (Playwright)
npm run test:e2e

# Specific tests only
npm test -- --testNamePattern="WorkflowEditor"
```

Test Writing Example:
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

### 🎨 Linting and Formatting

#### Python (Backend)

```bash
cd backend

# Run Ruff linter
ruff check .

# Auto fix
ruff check --fix .

# Black formatter
black .

# Type check (mypy)
mypy app/

# All checks at once
make lint  # If Makefile exists
```

`.ruff.toml` configuration:
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

# Run ESLint
npm run lint

# Auto fix
npm run lint:fix

# Prettier formatting
npm run format

# TypeScript type check
npm run typecheck

# All checks
npm run check  # If defined in package.json
```

`.eslintrc.json` configuration:
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

### ✅ Test Coverage Requirements

| Area | Minimum Coverage | Target Coverage |
|------|-----------------|-----------------|
| Backend (Python) | 80% | 90% |
| Frontend (React) | 70% | 85% |
| E2E Tests | Major scenarios | All user paths |

## Pull Request Process

### 📋 PR Checklist

Before submitting a PR:

- [ ] Sync with upstream/main
- [ ] All tests pass (unit tests + E2E)
- [ ] No lint errors (`make lint` passes)
- [ ] Type check passes (`npm run typecheck`, `mypy`)
- [ ] Documentation updated (required for API changes)
- [ ] README.md updated for database schema changes
- [ ] CHANGELOG.md updated (major changes)
- [ ] Commit messages follow Conventional Commits
- [ ] UI changes include screenshots (Before/After)
- [ ] Breaking changes specified
- [ ] Performance impact reviewed (benchmark results if needed)

### 📝 PR Template

`.github/pull_request_template.md`:
```markdown
## 📋 Description
<!-- Brief description of the changes -->

## 🎯 Change Type
<!-- Check applicable items -->
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring
- [ ] ⚡ Performance improvement
- [ ] 🎨 UI/UX improvement

## 🔗 Related Issues
<!-- Link issues with Closes #123 format -->
Closes #

## 📸 Screenshots (UI changes)
<!-- Before/After screenshots if UI changes exist -->
| Before | After |
|--------|-------|
| Previous screenshot | Changed screenshot |

## ✅ Testing
<!-- Describe tests performed -->
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing scenarios:
  ```
  1. Login
  2. Create workflow
  3. Verify node addition
  ```

## 📊 Performance Impact
<!-- Describe performance impact if any -->
- [ ] No performance impact
- [ ] Performance improvement: [benchmark results]
- [ ] Potential performance degradation: [mitigation plan]

## 📝 Checklist
- [ ] Code follows project style guide
- [ ] Self-review completed
- [ ] Comments added (complex logic)
- [ ] Documentation updated (README, API Docs)
- [ ] DB schema documentation updated (if changed)
- [ ] Environment variables documented (if added)
- [ ] No breaking changes (add BREAKING CHANGE section if present)

## 💔 BREAKING CHANGE
<!-- Provide migration guide if breaking changes exist -->

## 🔄 Migration Guide
<!-- Required for breaking changes -->

## 💬 Notes for Reviewers
<!-- Areas that reviewers should pay special attention to -->
```

### 🔄 PR Workflow

```bash
# 1. Fetch latest changes
git fetch upstream
git checkout main
git merge upstream/main

# 2. Rebase feature branch
git checkout feat/your-feature
git rebase main

# 3. Resolve conflicts (if any)
git status
# Fix conflict files
git add .
git rebase --continue

# 4. Push
git push origin feat/your-feature

# 5. Create PR on GitHub
```

### 👀 Code Review Guide

#### Guide for Reviewers

- **Positive feedback first**: Mention good points first
- **Specific suggestions**: Provide concrete improvement suggestions instead of vague expressions
- **Use question format**: "How about ~?"
- **Indicate importance**: 
  - 🔴 **Required**: Must be fixed
  - 🟡 **Suggestion**: Good to improve
  - 🟢 **Reference**: Optional

#### Guide for Authors

- **Reply to review comments**: Respond to all comments
- **Specify changes made**: Explain how you fixed issues
- **Discuss disagreements**: Have constructive discussions
- **Express gratitude**: Thank reviewers for their time and effort

## Development Guidelines

### 🎨 Frontend Guidelines

#### React Best Practices

```typescript
// ✅ Good example: Functional components + Hooks
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

// ❌ Bad example: Class components (legacy)
class WorkflowEditor extends React.Component {
  // Don't use in new code
}
```

#### Component Structure

```
src/
├── components/
│   ├── common/        # Reusable common components
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── workflow/      # Workflow-related components
│   │   ├── WorkflowEditor.tsx
│   │   └── NodePanel.tsx
│   └── layout/        # Layout components
│       ├── Header.tsx
│       └── Sidebar.tsx
├── hooks/            # Custom hooks
├── services/         # API communication
├── store/           # State management (Zustand)
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### 🔧 Backend Guidelines

#### FastAPI Best Practices

```python
# ✅ Good example: Dependency injection, type hints
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
    Retrieve workflow list
    
    - **skip**: Number of items to skip
    - **limit**: Maximum number of items to return
    """
    workflows = await WorkflowService(db).get_workflows(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return workflows
```

#### Project Structure

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
│   │   ├── config.py      # Configuration
│   │   ├── security.py    # Security
│   │   └── database.py    # DB connection
│   ├── models/
│   │   ├── user.py        # Pydantic models
│   │   └── workflow.py
│   ├── services/
│   │   ├── auth.py        # Business logic
│   │   └── workflow.py
│   └── main.py           # App entry point
├── tests/
├── alembic/              # DB migrations
└── requirements.txt
```

## Documentation

### 📚 Code Documentation

#### Python Docstring

```python
def calculate_workflow_complexity(workflow: Workflow) -> float:
    """
    Calculate workflow complexity.
    
    Complexity is calculated based on number of nodes, edges, and branches.
    
    Args:
        workflow: Workflow object to analyze
        
    Returns:
        float: Complexity score between 0.0 and 1.0
        
    Raises:
        ValueError: When workflow is empty
        
    Example:
        >>> workflow = Workflow(nodes=[...], edges=[...])
        >>> complexity = calculate_workflow_complexity(workflow)
        >>> print(f"Complexity: {complexity:.2f}")
    """
    if not workflow.nodes:
        raise ValueError("No nodes in workflow")
        
    # Complexity calculation logic
    return complexity
```

#### TypeScript JSDoc

```typescript
/**
 * Create workflow node.
 * 
 * @param {string} type - Node type (input, process, output)
 * @param {Partial<Node>} properties - Additional properties
 * @returns {Node} Created node object
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

### 📖 README Updates

Always update README.md when database schema or API changes:

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

## Getting Help

### 💬 Communication Channels

- **GitHub Discussions**: Questions and discussions
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: [Musashi Community](https://discord.gg/musashi)
- **Email**: maintainers@musashi.dev

### 🎓 Learning Resources

- [Project Documentation](https://docs.musashi.dev)
- [API Documentation](http://localhost:8000/docs)
- [Component Storybook](http://localhost:6006)
- [Video Tutorials](https://youtube.com/musashi)

### 🏆 Contributor Recognition

Contributors are recognized in:
- Contributors section in CHANGELOG.md
- Contributors section in README.md
- GitHub Contributors page
- Major contributors are invited to Core Team

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

**Thank you!** Your contributions make Musashi a better project. 🚀