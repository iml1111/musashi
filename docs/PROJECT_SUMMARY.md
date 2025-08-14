# Musashi Project Summary

**Last Updated**: 2025-01-14  
**Version**: 1.0.1  
**Repository**: https://github.com/imiml/musashi

## Problem

Teams need a visual way to design AI agent workflows without the complexity of execution engines. Existing tools are either too complex (full orchestration platforms) or too simple (basic flowchart tools).

## Solution

Musashi provides a lightweight, visual workflow designer specifically for AI agent workflows. It focuses purely on design and collaboration, exporting clean JSON for version control and integration with execution platforms.

## Key Features

- **Visual Workflow Design**: Drag-and-drop interface with React Flow and automatic layout via Dagre
- **Team Collaboration**: Real-time sharing with RBAC (Admin, Editor, Viewer roles)
- **Version Control Friendly**: JSON export format compatible with Git workflows
- **Node Types**: Agent, Function, MCP, User Input, Output nodes with smart connections
- **Single Container Architecture**: Optimized deployment with Frontend + Backend + Nginx in one container
- **Security**: JWT authentication, bcrypt password hashing, container signing with Cosign

## Stack/Architecture

### Technology Stack
- **Frontend**: React 18.2, TypeScript 5.2, React Flow 11.11, Tailwind CSS 3.3, Vite 7.1
- **Backend**: Python 3.12, FastAPI 0.104+, Motor (async MongoDB), Pydantic 2.5+
- **Database**: MongoDB 7.0 (document store)
- **DevOps**: Docker, GitHub Actions, multi-platform support (amd64/arm64)

### Architecture
- Single container web application (Dockerfile.optimized)
- Nginx reverse proxy serving frontend on port 80
- FastAPI backend accessible on port 8080
- External MongoDB connection

## Build & Run

### Quick Start (Production)
```bash
# Using pre-built image from GHCR
docker pull ghcr.io/imiml/musashi:latest
./run-musashi.sh

# Or with docker-compose
docker-compose up -d
```

### Development
```bash
# Frontend development
cd frontend && npm install && npm run dev  # Port 3000

# Backend development  
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000  # Port 8000

# Build from source
docker build -t musashi:latest -f Dockerfile.optimized .
```

## Ports/Health

### Production Ports
- **80**: Frontend (nginx serving React)
- **8080**: Backend API (FastAPI direct access)
- **27017**: MongoDB (external)

### Health Endpoints
- Frontend: `http://localhost/health`
- Backend: `http://localhost:8080/api/v1/health`
- Combined check: `curl -f http://localhost:8080/health && curl -f http://localhost:8080/api/v1/health`

## CI/CD

### GitHub Actions Workflows
- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Backend testing with pytest and ruff linting
  - Frontend testing with vitest and TypeScript checking
  - Docker build validation
  - Multi-platform image building (amd64/arm64)

- **Release Pipeline** (`.github/workflows/release.yml`):
  - Automated versioning
  - Container signing with Cosign
  - Security scanning with Trivy
  - Push to GitHub Container Registry (ghcr.io)

### Test Commands
```bash
make test-frontend   # Vitest + coverage
make test-backend    # Pytest
make lint-frontend   # TypeScript checking
make lint-backend    # Ruff linting
```

## Config Keys

### Required Environment Variables
- `MONGODB_URL`: MongoDB connection string (default: `mongodb://localhost:27017`)
- `DATABASE_NAME`: Database name (default: `musashi`)
- `SECRET_KEY`: JWT signing key (32+ characters, must be changed in production)

### Optional Configuration
- `BACKEND_CORS_ORIGINS`: Allowed CORS origins
- `ENVIRONMENT`: `production` or `development`
- `DEBUG`: Debug mode (default: `false`)
- `LOG_LEVEL`: Logging level (debug/info/warning/error)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT expiration (default: 11520)

## Known Risks

1. **Default Admin Password**: Initial admin account uses `changeme123!` - must be changed immediately
2. **MongoDB Security**: Production deployments should enable authentication
3. **Secret Key**: Default development key must be replaced with secure value in production
4. **CORS Configuration**: Must be properly configured for production domains
5. **Container Vulnerabilities**: Regular image updates needed for security patches

## Next Steps

### Immediate
1. Change default admin password after first deployment
2. Configure production SECRET_KEY
3. Enable MongoDB authentication in production
4. Set up SSL/TLS with reverse proxy

### Roadmap
1. Add workflow templates library
2. Implement workflow versioning UI
3. Add export to various execution platforms
4. Enhance collaboration features with real-time sync
5. Add workflow validation and linting
6. Implement workflow simulation mode

---

**Mission**: Flow Sharp, Ship Fast - Making AI workflow design accessible and version-control friendly.