# Musashi Project Summary

**Last Updated**: 2025-08-19  
**Version**: 1.0.5  
**Repository**: https://github.com/iml1111/musashi

## 🎯 Problem

Teams need a visual way to design AI agent workflows without the complexity of execution engines. Existing tools are either:
- **Too Complex**: Full orchestration platforms with heavy runtime requirements
- **Too Simple**: Basic flowchart tools lacking AI-specific features
- **Too Expensive**: Enterprise solutions with vendor lock-in

## 💡 Solution

Musashi provides a **lightweight, open-source visual workflow designer** specifically for AI agent systems. It focuses purely on design and collaboration, exporting clean JSON for version control and integration with any execution platform.

### Core Philosophy
- **Design-First**: No execution runtime, pure workflow design
- **Framework Agnostic**: Export to any execution engine
- **Git-Friendly**: JSON format for version control
- **Team-Oriented**: Built for collaboration from the ground up

## ✨ Key Features

### Visual Workflow Design
- **🖱️ Drag-and-Drop Interface**: Powered by React Flow 11.11
- **📐 Auto Layout**: Dagre algorithm for automatic graph alignment
- **🔌 Rich Node Types**: 
  - Agent Nodes (GPT-4, Claude, Gemini, etc.)
  - Function Nodes (Custom logic)
  - MCP Server Nodes (Tool integration)
  - User Input/Output Nodes
- **🔗 Smart Connections**: Type-safe input/output validation

### Team Collaboration
- **👥 Multi-User Support**: Real-time collaboration with conflict resolution
- **🔐 RBAC**: Admin, Editor, Viewer roles per workspace
- **📊 Workflow History**: Track changes with detailed update logs (last 50)
- **🔄 Optimistic Locking**: Prevents conflicting edits
- **🔗 Share Links**: Read-only workflow sharing via tokens

### Developer Experience
- **📦 JSON Export/Import**: Clean, readable workflow format
- **🔍 TypeScript**: Full type safety in frontend
- **📝 OpenAPI Docs**: Auto-generated API documentation
- **🐳 Docker First**: Single container deployment (~150MB)
- **🧪 Comprehensive Testing**: Vitest, Pytest, Playwright

### Security & Compliance
- **🔒 JWT Authentication**: Secure token-based access
- **🔑 Default Admin**: Auto-created on first run (admin/1234)
- **✅ Container Signing**: Cosign-verified images
- **🛡️ Security Scanning**: Automated Trivy checks
- **📋 SBOM**: Software bill of materials included

## 🏗️ Stack/Architecture

### Technology Stack

#### Frontend (React + TypeScript)
- **React 18** + **TypeScript 5.2**
- **React Flow 11.11.4** - Visual workflow editor
- **Dagre 0.8.5** - Auto layout algorithm
- **Tailwind CSS 3.3** - Styling
- **Vite 7.1.2** - Build tool
- **Zustand 4.4** - State management
- **Vitest** - Testing framework

#### Backend (Python + FastAPI)
- **Python 3.12** + **FastAPI 0.104+**
- **Pydantic 2.5+** - Data validation
- **Motor 3.3+** - Async MongoDB driver
- **python-jose** - JWT authentication
- **passlib[bcrypt]** - Password hashing
- **pytest** + **pytest-asyncio** - Testing

#### Infrastructure
- **MongoDB 7.0+** - Document store for workflows
- **Docker** + **Alpine Linux** - Containerization
- **Nginx 1.24** - Reverse proxy + static serving
- **GitHub Actions** - CI/CD pipeline
- **GHCR** - Container registry

### Architecture Highlights
- **Single Container Design**: Frontend + Backend + Nginx (~150MB)
- **Multi-Platform Support**: linux/amd64, linux/arm64
- **Health Checks**: Built-in monitoring endpoints
- **Auto-scaling Ready**: Stateless design with external MongoDB

## 🚀 Build & Run

For detailed installation instructions, see [README.md](../README.md#-quick-start) or [INSTALL.md](../INSTALL.md).

### Development Setup
```bash
# Clone and setup
git clone https://github.com/iml1111/musashi.git
cd musashi
make dev  # Backend + MongoDB

# Frontend development
cd frontend && npm install && npm run dev
```

### Build from Source
```bash
# Optimized production build
docker build -t musashi:latest -f Dockerfile.optimized .
```

## 🔌 Service Architecture

### Port Configuration
- **8080**: Single entry point (Nginx serving frontend + API proxy)
- **27017**: MongoDB (external database)

Health monitoring is available at `/api/v1/health`. See [README.md](../README.md#-ports-and-health-checks) for details.

## 🔄 CI/CD

### GitHub Actions Workflows

#### CI Pipeline (`.github/workflows/ci.yml`)
- ✅ Backend: pytest + ruff linting
- ✅ Frontend: vitest + TypeScript checking  
- ✅ Docker: Multi-platform build validation
- ✅ Coverage: Report generation and thresholds

#### Release Pipeline (`.github/workflows/release.yml`)
- 🏷️ Automated versioning with tags
- ✍️ Container signing with Cosign
- 🛡️ Security scanning with Trivy
- 📦 Push to GitHub Container Registry
- 📋 SBOM generation (SPDX + CycloneDX)

### Testing Commands
```bash
make test-frontend   # Vitest + coverage
make test-backend    # Pytest + async tests
make lint-frontend   # TypeScript checking
make lint-backend    # Ruff linting
make test           # All tests
```

## ⚙️ Configuration

See [README.md](../README.md#-environment-variables) for core configuration.
For complete environment variable reference, see [INSTALL.md](../INSTALL.md#environment-variables-configuration).

## 📊 Project Metrics

- **Docker Image Size**: ~150MB (optimized Alpine)
- **Startup Time**: <5 seconds
- **Memory Usage**: ~200MB (typical)
- **Test Coverage**: Frontend ~40%, Backend ~70%
- **Dependencies**: 30 npm packages, 15 Python packages
- **Lines of Code**: ~8,000 (excluding generated)

## 🗺️ Roadmap

### Near Term (v1.1)
- [ ] Workflow templates marketplace
- [ ] Enhanced MCP server integration
- [ ] Performance optimizations for large workflows
- [ ] Advanced search and filtering

### Long Term (v2.0)
- [ ] Real-time collaborative editing
- [ ] AI-powered workflow suggestions
- [ ] Workflow versioning and branching
- [ ] Plugin system for custom nodes
- [ ] Mobile responsive design

## 🤝 Contributing

Musashi is open source and welcomes contributions!

- **Issues**: https://github.com/iml1111/musashi/issues
- **Discussions**: https://github.com/iml1111/musashi/discussions
- **Contributing Guide**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **License**: MIT

## 📞 Contact

- **Repository**: https://github.com/iml1111/musashi
- **Container Registry**: https://ghcr.io/iml1111/musashi
- **Documentation**: http://localhost:8080/docs (when running)