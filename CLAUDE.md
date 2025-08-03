# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Musashi is an AI Agent Workflow Design Tool that focuses on visual workflow creation without execution capabilities. The mission is "Cut the code. Shape the flow." - providing a lightweight, open-source tool for designing agentic workflows through node/edge-based flow charts.

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

### Local Development
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
- **Workflow**: Contains nodes[], edges[], metadata, version, team_id
- **Node**: id, type, label, properties{}, position (auto-calculated by Dagre)
- **Edge**: id, source, target, label
- **User**: email, username, roles[] with team-based RBAC

### Database Collections
- `workflows` - Workflow documents with owner_id, team_id, version
- `users` - User accounts with hashed_password, roles[]

## Development Notes

- **No manual node positioning**: Dagre handles automatic layout, users cannot drag nodes
- **Focus on workflow logic**: UI emphasizes node properties and connections over visual styling  
- **Version control friendly**: Workflows export as clean JSON for Git commits
- **Team-based access**: RBAC system supports team collaboration
- **Read-only sharing**: Generate share_token for public workflow viewing

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

- Frontend: `:3000` (Vite dev server)
- Backend: `:8000` (FastAPI)
- MongoDB: `:27017`
- MCP Services: `:3001`
- Production Frontend: `:80` (nginx)