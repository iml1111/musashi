# 🎉 Musashi v1.0.0 - Initial Production Release

**Release Date**: January 20, 2025  
**Tag**: `v1.0.0`  
**Container Image**: `ghcr.io/imiml/musashi:v1.0.0`

## 🚀 Highlights

We're excited to announce the first production release of **Musashi** - an AI Agent Workflow Design Tool that focuses on visual workflow creation without execution capabilities. Our mission is **"Cut the code. Shape the flow."** - providing a lightweight, open-source tool for designing agentic workflows through node/edge-based flow charts.

## 📦 Container Images

### Pull the Image
```bash
# Latest version
docker pull ghcr.io/imiml/musashi:latest

# Specific version
docker pull ghcr.io/imiml/musashi:v1.0.0

# Multi-architecture support
docker pull ghcr.io/imiml/musashi:v1.0.0 --platform linux/amd64
docker pull ghcr.io/imiml/musashi:v1.0.0 --platform linux/arm64
```

### Verify Container Signature
```bash
# Verify with Cosign (keyless signature)
cosign verify ghcr.io/imiml/musashi:v1.0.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/imiml/musashi/\.github/workflows/.*'
```

## 🔐 Security & Supply Chain

### SBOM (Software Bill of Materials)
Download and verify the SBOM for supply chain transparency:

```bash
# Download SBOM
cosign download sbom ghcr.io/imiml/musashi:v1.0.0 > musashi-v1.0.0-sbom.json

# View SBOM contents
cat musashi-v1.0.0-sbom.json | jq '.packages | length'
```

**SBOM Formats Available**:
- SPDX JSON: `musashi-v1.0.0-sbom.spdx.json`
- CycloneDX JSON: `musashi-v1.0.0-sbom.cyclonedx.json`

### Vulnerability Scanning
This release has been scanned with Trivy for vulnerabilities:
- ✅ No HIGH or CRITICAL vulnerabilities
- ✅ All dependencies up to date
- ✅ Container built with non-root user

## ✨ Key Features

### Visual Workflow Design
- **React Flow Integration**: Drag-and-drop interface for intuitive workflow creation
- **Dagre Auto-Layout**: Automatic node positioning and alignment
- **Real-time Preview**: Instant visual feedback for workflow changes

### Comprehensive Node System
- **Agent Node**: Configure AI agents with model selection, temperature, and token limits
- **Function Node**: Define custom functions with parameters
- **MCP Node**: Model Context Protocol server integration
- **User Input Node**: Collect user inputs with validation
- **Final Output Node**: Display workflow results

### Team Collaboration
- **RBAC System**: Role-based access control with Admin, Editor, and Viewer roles
- **Team Workspaces**: Isolated environments for different teams
- **Share Links**: Generate read-only links for workflow sharing

### Developer Experience
- **JSON Export/Import**: Git-friendly workflow format
- **Version Control**: Track changes and collaborate through Git
- **API Documentation**: Complete OpenAPI/Swagger documentation
- **TypeScript Support**: Full type safety in frontend development

## 🛠️ Technical Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, TypeScript, React Flow, Tailwind CSS, Vite |
| **Backend** | Python 3.12, FastAPI, Pydantic, Motor |
| **Database** | MongoDB 7.0 |
| **Authentication** | JWT with bcrypt password hashing |
| **Container** | Docker with multi-stage builds |
| **CI/CD** | GitHub Actions with automated testing |

## 🚀 Quick Start

### Using Docker Run
```bash
docker run -d \
  --name musashi \
  --restart unless-stopped \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="$(openssl rand -hex 32)" \
  --add-host host.docker.internal:host-gateway \
  ghcr.io/imiml/musashi:v1.0.0
```

### Using Docker Compose
```yaml
version: '3.8'
services:
  musashi:
    image: ghcr.io/imiml/musashi:v1.0.0
    ports:
      - "80:80"
      - "8080:8000"
    environment:
      - MONGODB_URL=mongodb://mongodb:27017
      - DATABASE_NAME=musashi
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:7.0
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 📊 Release Metrics

- **Lines of Code**: ~15,000
- **Components**: 47 React components
- **API Endpoints**: 23 RESTful endpoints
- **Test Coverage**: Frontend ~60%, Backend ~66%
- **Docker Image Size**: ~150MB
- **Build Time**: ~2 minutes
- **Supported Platforms**: linux/amd64, linux/arm64

## 🧪 Testing & Quality

- **Unit Tests**: Vitest (Frontend), pytest (Backend)
- **E2E Tests**: Playwright for critical user flows
- **Security Scanning**: Trivy with HIGH/CRITICAL fail policy
- **Code Quality**: ESLint, Prettier, Black, Ruff
- **Type Safety**: TypeScript strict mode, mypy

## 📚 Documentation

- **[README.md](./README.md)**: Quick start guide and overview
- **[INSTALL.md](./INSTALL.md)**: Detailed installation instructions
- **[SECURITY.md](./SECURITY.md)**: Security policies and vulnerability reporting
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Development guidelines
- **[CHANGELOG.md](./CHANGELOG.md)**: Complete change history
- **[API Docs](http://localhost:8080/docs)**: Interactive API documentation

## ⚠️ Known Issues

- Test coverage below target levels (working towards 80%)
- Performance degradation with 100+ nodes (optimization planned)
- Some E2E tests flaky on CI (being stabilized)
- Safari compatibility issues with certain features

## 🔄 Upgrade Instructions

If upgrading from a pre-release version:

1. **Backup your data**:
   ```bash
   docker exec musashi-mongodb mongodump --db musashi --out /backup
   ```

2. **Pull new version**:
   ```bash
   docker pull ghcr.io/imiml/musashi:v1.0.0
   ```

3. **Restart with new image**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Setting up development environment
- Conventional commit standards
- Pull request process
- Testing requirements

## 🙏 Acknowledgments

Special thanks to:
- React Flow team for the excellent visualization library
- FastAPI community for the robust backend framework
- All early testers and contributors who provided valuable feedback

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/imiml/musashi/issues)
- **GitHub Discussions**: [Ask questions and share ideas](https://github.com/imiml/musashi/discussions)
- **Security Issues**: See [SECURITY.md](./SECURITY.md) for responsible disclosure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Download Options**:
- 🐳 [Docker Image](https://ghcr.io/imiml/musashi:v1.0.0)
- 📦 [Source Code (tar.gz)](https://github.com/imiml/musashi/archive/refs/tags/v1.0.0.tar.gz)
- 📦 [Source Code (zip)](https://github.com/imiml/musashi/archive/refs/tags/v1.0.0.zip)
- 📄 [SBOM (SPDX)](https://github.com/imiml/musashi/releases/download/v1.0.0/musashi-v1.0.0-sbom.spdx.json)
- 📄 [SBOM (CycloneDX)](https://github.com/imiml/musashi/releases/download/v1.0.0/musashi-v1.0.0-sbom.cyclonedx.json)

---

*Built with ❤️ by the Musashi Team*