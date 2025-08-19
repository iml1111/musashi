<!-- Last updated: 2025-01-14 -->
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Musashi is an AI Agent Workflow Design Tool that focuses on visual workflow creation without execution capabilities. The mission is "Flow Sharp, Ship Fast." - providing a lightweight, open-source tool for designing agentic workflows through node/edge-based flow charts.

**Key Principles:**
- Design-only focus (no execution/simulation)
- Visual drag-and-drop workflow creation using React Flow + Dagre
- Team collaboration with RBAC
- Version control friendly (JSON export for Git workflows)
- FigJam-like canvas experience with minimal UI

## Technology Stack

- **Backend**: Python 3.12 + FastAPI + Pydantic + Motor (async MongoDB)
- **Frontend**: React 18 + TypeScript + React Flow + Dagre + Tailwind CSS
- **Database**: MongoDB
- **Auth**: JWT + RBAC
- **DevOps**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## Common Development Commands

### Docker Single Container (Recommended)
```bash
# Docker Image Build
docker build -t musashi:latest -f Dockerfile.optimized .

# Single Container Execute (Frontend: port 80, Backend API: port 8080)
./run-musashi.sh

# Container Management
docker logs -f musashi        # Check logs
docker restart musashi        # 재Start
docker stop musashi          # Stop
docker rm musashi            # Remove

# Make Command (단Day Container)
make docker-build            # Docker Image Build
make docker-run              # Container Execute
make docker-stop             # Stop container
make docker-restart          # Restart container
make docker-logs             # Check logs
```

### Docker Compose Development (Legacy)
```bash
# Initial setup
make setup                    # Copy .env.example to .env

# Development (backend only + MongoDB)
make dev                      # Start dev environment with docker-compose.dev.yml

# Frontend development (run separately)
cd frontend && npm install    # Install dependencies
cd frontend && npm run dev    # Start Vite dev server on :3000

# Full production stack
make up                       # Start all containers in production mode
```

### Testing & Linting
```bash
# Frontend
make test-frontend           # Run React tests
make lint-frontend          # TypeScript type checking

# Backend  
make test-backend           # Run pytest
make lint-backend          # Run ruff linting

# Dependencies
make install-frontend       # npm install
make install-backend       # pip install -r requirements.txt
```

### Docker Operations
```bash
make build                  # Build all containers
make logs                  # View container logs
make down                  # Stop containers
make clean                 # Remove containers, networks, volumes
```

## Architecture

### Backend Structure
- `backend/app/api/v1/endpoints/` - REST API endpoints (workflows, auth, users)
- `backend/app/models/` - Pydantic models (Workflow, User, Node, Edge)
- `backend/app/services/` - Business logic (WorkflowService, AuthService, UserService)  
- `backend/app/core/` - Configuration, database connection, settings

### Frontend Structure
- `frontend/src/pages/` - Main pages (Dashboard, WorkflowEditor, Login)
- `frontend/src/components/` - Reusable components (organized by domain)
- `frontend/src/services/` - API client and data fetching
- `frontend/src/types/` - TypeScript type definitions

### Key Models
- **Workflow**: Contains nodes[], edges[], metadata, version
- **Node**: id, type, label, properties{}, position (auto-calculated by Dagre)
- **Edge**: id, source, target, label
- **User**: email, username, roles[]

### Database Collections
- `workflows` - Workflow documents with owner_id, version
- `users` - User accounts with hashed_password, roles[]

## Development Notes

- **No manual node positioning**: Dagre handles automatic layout, users cannot drag nodes
- **Focus on workflow logic**: UI emphasizes node properties and connections over visual styling  
- **Version control friendly**: Workflows export as clean JSON for Git commits
- **Team-based access**: RBAC system supports team collaboration
- **Read-only sharing**: Generate share_token for public workflow viewing

## 📋 Database Schema Documentation Rules

**CRITICAL REQUIREMENT**: When developing new features or modifying existing data models, the database schema documentation in README.md MUST be updated simultaneously.

### Schema Update Requirements

1. **Model Changes**: Any changes to Pydantic models in `/backend/app/models/` require README.md schema updates
2. **New Collections**: New MongoDB collections must be documented with complete schema examples
3. **Field Modifications**: Field additions, removals, or type changes must be reflected in documentation
4. **Index Changes**: Database index modifications must be updated in schema documentation
5. **Permission Changes**: RBAC or authentication changes must update the permissions matrix

### Mandatory Update Process

When making database-related changes:

1. **Before Implementation**:
   - Identify which collections/models will be affected
   - Plan the schema changes in README.md

2. **During Implementation**:  
   - Update Pydantic models in `/backend/app/models/`
   - Update corresponding README.md schema documentation

3. **After Implementation**:
   - Verify schema documentation matches actual model definitions
   - Test that examples in README.md are accurate and functional

### Schema Documentation Standards

- **Complete Examples**: Provide full JSON document examples with all fields
- **Field Descriptions**: Comment every field with purpose and validation rules
- **Type Information**: Specify data types, required/optional status, and default values
- **Index Documentation**: List all database indexes with their purpose
- **Relationship Mapping**: Document references between collections
- **Permission Matrix**: Keep RBAC permissions table current

**Failure to update schema documentation with model changes constitutes incomplete feature implementation.**

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `MONGODB_URL` - MongoDB connection string
- `SECRET_KEY` - JWT signing key (change in production)
- `BACKEND_CORS_ORIGINS` - Frontend URL for CORS

## MCP (Model Context Protocol) Integration

Musashi includes three specialized MCP servers for enhanced AI workflow capabilities:

### Available MCP Servers

**1. Playwright MCP Server** (`:3001`)
- **Purpose**: Web automation and testing for workflow validation
- **Tools**: `navigate`, `click`, `type`, `screenshot`, `wait_for_selector`, `get_page_content`, `evaluate`
- **Use cases**: End-to-end testing of AI agent workflows, web scraping, UI automation

**2. Context7 MCP Server**
- **Purpose**: Advanced context management with semantic chunking and prioritization
- **Tools**: `add_context`, `remove_context`, `search_context`, `get_priority_context`, `optimize_context`
- **Features**: Priority-based context windows, TTL expiration, token optimization
- **Use cases**: Managing complex workflow context, semantic search, memory optimization

**3. Sequential Thinking MCP Server**
- **Purpose**: Step-by-step reasoning and problem analysis
- **Tools**: `start_thinking_chain`, `add_thinking_step`, `analyze_problem`, `complete_thinking_chain`
- **Features**: Auto-reasoning with Claude, confidence scoring, structured problem decomposition
- **Use cases**: Complex workflow analysis, debugging reasoning chains, systematic problem solving

### MCP Development Commands

```bash
# Install MCP servers locally
make install-mcp             # Install all MCP servers and dependencies

# Development
make mcp-dev                 # Start MCP container in development mode
make test-mcp               # Test all MCP servers

# Docker integration
make dev                    # Includes MCP server in development stack
make up                     # Production stack with MCP servers
```

### MCP Configuration

- **Config file**: `mcp/config/mcp.json`
- **Environment variables**: Set `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` in `.env`
- **Context7 settings**: `CONTEXT7_MAX_TOKENS` (default: 100,000)
- **Sequential Thinking**: `THINKING_MODEL` (default: claude-3-sonnet-20240229)

### Integration with Workflow Design

MCP servers enhance Musashi's workflow design capabilities by providing:
- **Validation**: Test workflows with real web interactions (Playwright)
- **Memory**: Maintain workflow context across design sessions (Context7)  
- **Analysis**: Break down complex workflow logic step-by-step (Sequential Thinking)

## 🚨 MANDATORY COMPONENT USAGE RULES FOR CLAUDE CODE

**CRITICAL**: Claude Code MUST follow these rules when writing ANY code in this project. NO EXCEPTIONS.

### 🎯 ABSOLUTE REQUIREMENTS

**1. ALWAYS USE EXISTING COMPONENTS FIRST**
- Before writing ANY UI code, MUST check existing components in `/src/components/common/`
- NEVER create custom solutions if existing components can solve the problem
- ALWAYS import from: `import { ComponentName } from '../components/common';`

**2. FORBIDDEN PATTERNS - NEVER USE**
```tsx
// 🚫 NEVER USE HTML TAGS DIRECTLY
<h1>, <h2>, <h3>, <h4>, <h5>, <h6>  // Use Typography variant="h1|h2|h3|h4"
<p>, <span>                        // Use Typography variant="body|small"
<button>                          // Use Button component
<input>, <textarea>               // Use Input component
<div> for content grouping        // Use Card component

// 🚫 NEVER USE INLINE STYLES OR HARDCODED VALUES
style={{color: '#ff0000'}}        // Use theme.theme.colorPrimary
style={{fontSize: '16px'}}        // Use Typography component
className="text-red-500"          // Use Typography color="primary"
className="bg-blue-100"           // Use Card component or theme colors
```

**3. MANDATORY COMPONENTS TO USE**

```typescript
// ALWAYS import these when creating UI:
import { 
  Typography,    // For ALL text (h1-h6, p, span)
  Button,        // For ALL clickable actions  
  Card,          // For content containers/grouping
  Input,         // For ALL form inputs
  Badge,         // For status/labels
  Carousel,      // For image sliders/content rotation
  Navbar,        // For navigation bars
  Footer,        // For page footers
  Hero           // For hero sections
} from '../components/common';

import { theme } from '../utils/theme';  // For colors/spacing
```

**4. REQUIRED USAGE PATTERNS**

```tsx
// ✅ CORRECT - ALWAYS DO THIS
<Typography variant="h1">Page Title</Typography>
<Typography variant="h2" className="mb-4">Section Title</Typography>
<Typography variant="body" color="light">Description text</Typography>
<Button variant="primary" onClick={handleClick}>Action</Button>
<Card variant="elevated" hover>Content here</Card>
<Input label="Email" placeholder="Enter email" error={emailError} />
<Badge variant="success">Status</Badge>

// ✅ CORRECT - Theme system usage
import { theme } from '../utils/theme';
style={{ 
  color: theme.theme.colorPrimary,
  backgroundColor: theme.palette.gray[100],
  padding: theme.spacing[16]
}}
```

### 🔒 ENFORCEMENT RULES

**Claude Code MUST:**
1. **Check components first**: Before ANY UI implementation, review available components
2. **Use component props**: Never bypass component APIs with custom styling  
3. **Follow theme system**: Only use colors/spacing from theme.ts
4. **Maintain consistency**: All similar UI elements MUST use the same component
5. **No HTML tags**: Zero tolerance for direct HTML tag usage in UI

**Violation = Code Rejection**: Any code that violates these rules should be rejected and rewritten using proper components.

### 📋 MANDATORY PRE-CODING CHECKLIST

Before writing ANY React component code, Claude Code MUST verify:

- [ ] **Text display needed?** → Use Typography component (variant: h1-h4, body, small)
- [ ] **User action needed?** → Use Button component (variant: primary, secondary, tertiary)  
- [ ] **User input needed?** → Use Input component (with label, error handling)
- [ ] **Content grouping needed?** → Use Card component (variant: default, outlined, elevated)
- [ ] **Status/label needed?** → Use Badge component (variant: success, warning, danger, etc.)
- [ ] **Image carousel needed?** → Use Carousel component 
- [ ] **Navigation needed?** → Use Navbar component
- [ ] **Page footer needed?** → Use Footer component
- [ ] **Hero section needed?** → Use Hero component
- [ ] **Colors/spacing needed?** → Use theme.ts values only

### 🎯 AVAILABLE COMPONENTS QUICK REFERENCE

| Need | Component | Usage |
|------|-----------|-------|
| Title/Heading | `Typography` | `<Typography variant="h1">Title</Typography>` |
| Body Text | `Typography` | `<Typography variant="body">Text</Typography>` |
| Button/Action | `Button` | `<Button variant="primary">Click</Button>` |
| Text Input | `Input` | `<Input label="Name" placeholder="Enter name" />` |
| Content Box | `Card` | `<Card variant="elevated">Content</Card>` |
| Status Label | `Badge` | `<Badge variant="success">Done</Badge>` |
| Image Slider | `Carousel` | `<Carousel items={items} autoPlay />` |
| Navigation | `Navbar` | `<Navbar variant="default" />` |
| Page Footer | `Footer` | `<Footer variant="detailed" />` |
| Hero Section | `Hero` | `<Hero title="Welcome" variant="centered" />` |

### 🚨 CRITICAL SUCCESS CRITERIA

**Every React component file MUST:**
1. Import required components from `../components/common`
2. Use Typography for ALL text elements
3. Use Button for ALL interactive elements  
4. Use Card for ALL content containers
5. Use theme.ts for ALL colors and spacing
6. Have ZERO direct HTML tags (h1-h6, p, button, input, span)
7. Have ZERO inline styles with hardcoded values
8. Have ZERO Tailwind color classes (text-red-500, bg-blue-100, etc.)

**Reference Documentation:**
- `/COMPONENT_GUIDELINES.md` - Complete implementation guide
- `/frontend/component-checklist.md` - Pre-development checklist  
- `/frontend/src/utils/component-validator.ts` - Development validation tools

## SuperClaude Integration

Musashi is enhanced with SuperClaude Framework v3.0 for advanced development workflows:

### Available Slash Commands

**Core Commands** (available globally):
- `/analyze` - Comprehensive code analysis and recommendations
- `/architect` - System architecture design and planning  
- `/debug` - Enhanced debugging assistance
- `/document` - Generate comprehensive documentation
- `/explain` - Clear explanations of complex concepts
- `/optimize` - Performance and efficiency optimization
- `/plan` - Project and task planning
- `/refactor` - Code refactoring assistance
- `/review` - Code review and quality assessment
- `/secure` - Security analysis and hardening
- `/test` - Test generation and testing strategies
- `/teach` - Educational content and tutorials

**Musashi-Specific Commands**:
- `/workflow` - Create and manage AI agent workflows
- `/node` - Manage workflow nodes and components
- `/flow` - Analyze and optimize workflow flows
- `/agent` - Design AI agent behaviors and capabilities
- `/mcp` - Direct MCP server integration
- `/template` - Workflow templates and patterns
- `/team` - Collaboration and team management
- `/deploy` - Workflow deployment preparation

### Configuration Files

- **Global Config**: `~/.claude/settings.json` - Main SuperClaude configuration
- **Project Config**: `.claude/musashi_settings.json` - Musashi-specific settings
- **Commands**: `.claude/musashi_commands.md` - Project command definitions
- **Profile**: `~/.claude/superclaude/profiles/musashi_profile.md` - Development profile

### Usage Examples

```bash
# Analyze workflow architecture
/architect workflow-engine

# Create new workflow with template
/workflow create customer-support
/template apply customer-service

# MCP integration
/mcp playwright test workflow-ui
/mcp context7 add "User session context"
/mcp thinking analyze "Workflow optimization opportunities"

# Code quality
/review backend/app/services/workflow.py
/test frontend/src/components/WorkflowEditor.tsx
/secure backend/app/api/v1/endpoints/
```

## Port Configuration

# # # 단Day Container 모드 (권장)
- Frontend: `:80` (nginx serving React)
- Backend API: `:8080` (FastAPI direct access)
- MongoDB: `:27017` (existing container)

### Development mode (Docker Compose)
- Frontend: `:3000` (Vite dev server)
- Backend: `:8000` (FastAPI)
- MongoDB: `:27017`
- MCP Services: `:3001`

## 🔄 Docker Container Reload Rule

**MANDATORY**: After ANY code updates, Docker containers MUST be reloaded to ensure changes are reflected.

### Container Reload Commands

```bash
# After backend changes
docker-compose restart backend      # Restart backend container only
# OR
make restart-backend               # If Makefile command exists

# After frontend changes  
docker-compose restart frontend     # Restart frontend container only
# OR
make restart-frontend              # If Makefile command exists

# After both frontend and backend changes
docker-compose restart             # Restart all containers
# OR
make restart                       # If Makefile command exists

# For development mode
make dev-restart                   # Restart development containers
# OR
docker-compose -f docker-compose.dev.yml restart
```

### When to Reload

**ALWAYS reload containers after:**
- Python file changes (`.py` files in `/backend/`)
- JavaScript/TypeScript changes (`.js`, `.jsx`, `.ts`, `.tsx` files in `/frontend/`)
- Configuration file changes (`.env`, `docker-compose.yml`, etc.)
- Package dependency updates (`requirements.txt`, `package.json`)
- Static asset changes (CSS, images, etc.)

### Reload Verification

After reloading:
1. Check container status: `docker-compose ps` or `docker ps`
2. Verify logs for errors: `docker-compose logs -f [service-name]`
3. Test the changes in browser/API client

**⚠️ FAILURE TO RELOAD = CHANGES NOT REFLECTED**

This is a CRITICAL rule that ensures all code updates are properly deployed and tested.