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
*"Flow Sharp, Ship Fast."*

First official release. An AI agent workflow design tool focused purely on design without execution capabilities.

### ✨ Added

#### Core Features
- **Visual Workflow Editor** 
  - React Flow-based drag-and-drop interface
  - Dagre automatic layout algorithm
  - Automatic node alignment and optimal placement
  - Real-time viewport adjustment

- **Node System**
  - **Agent Node**: AI agent configuration (Model, Temperature, Max Tokens)
  - **Function Node**: Custom function definition and parameter settings
  - **MCP Node**: Model Context Protocol server integration
  - **User Input Node**: User input collection
  - **Final Output Node**: Workflow final result output
  - **Connected Inputs**: Inter-node input connection management

- **Advanced Prompt Engineering**
  - System prompt template support
  - Variable binding (`{{variable}}` format)
  - Multi-line prompt editor
  - Prompt validation

- **Workflow Management**
  - Workflow create/update/delete
  - JSON format export/import
  - Version control system compatible
  - Workflow cloning functionality

#### Collaboration Features
- **Team Management**
  - Team-based workflow isolation
  - Team member invitation and management
  - Per-team resource allocation

- **RBAC (Role-Based Access Control)**
  - **Admin**: Full system management
  - **Editor**: Workflow create/edit
  - **Viewer**: Read-only access
  - Granular permission settings

- **Sharing & Export**
  - Public share link generation
  - Read-only share token
  - PDF/PNG export (planned)

#### User Experience
- **UI/UX Enhancements**
  - Dark mode support
  - Responsive design
  - Keyboard shortcuts
  - Undo/redo
  - Auto-save (5-second interval)

- **Workflow Visualization**
  - Minimap navigation
  - Zoom in/out controls
  - Grid snap alignment
  - Connection line animations

- **Node Sidebar**
  - Real-time node property editing
  - Input validation
  - Help tooltips
  - Collapsible/expandable sections

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

*For upgrade instructions, see [INSTALL.md](./INSTALL.md#version-upgrade)*  
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