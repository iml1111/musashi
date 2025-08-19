<!-- Last updated: 2025-01-14 -->
# 🗡️ Musashi - AI Agent Workflow Design Tool

> **Open-Source Visual Workflow Designer for AI Agent Systems**

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.4-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/docker-ready-blue.svg" alt="Docker Ready">
  <img src="https://img.shields.io/badge/ghcr.io-available-blue.svg" alt="GHCR">
  <img src="https://img.shields.io/badge/platform-linux%2Famd64%20%7C%20linux%2Farm64-lightgrey" alt="Platforms">
</div>

<div align="center">
  <h3>🎯 Flow Sharp, Ship Fast.</h3>
  <p>Design complex AI agent workflows visually, without writing code.</p>
</div>

---

## ✨ Why Musashi?

Musashi is designed specifically for **AI workflow design without execution**, focusing on:

- 🎯 **Design-First Approach** - Pure workflow design tool without runtime overhead
- 🚀 **Lightweight & Fast** - Minimal dependencies, optimized Docker image (~150MB)
- 🔧 **Framework Agnostic** - Export workflows as JSON for any execution engine
- 🌐 **Open Source** - MIT licensed, community-driven development

## 🎨 Core Features

### Visual Workflow Designer
- **🖱️ Drag & Drop Interface** - Intuitive node-based editor powered by React Flow
- **📐 Auto Layout** - Automatic graph alignment using Dagre algorithm
- **🔌 Rich Node Types** - Agent, Function, MCP Server, User Input, Output nodes
- **🔗 Smart Connections** - Type-safe input/output matching with validation

### Team Collaboration
- **👥 Multi-User Support** - Real-time collaboration with conflict resolution
- **🔐 Role-Based Access** - Admin, Editor, Viewer permissions per workspace
- **📊 Workflow History** - Track changes with detailed update logs
- **🔄 Version Control** - Optimistic locking prevents conflicting edits

### Developer Experience
- **📦 JSON Export/Import** - Git-friendly workflow format
- **🔍 TypeScript Support** - Full type safety in frontend
- **📝 OpenAPI Docs** - Auto-generated API documentation
- **🐳 Docker First** - Production-ready containerized deployment

### Security & Compliance
- **🔒 JWT Authentication** - Secure token-based access control
- **✅ Container Signing** - Cosign-verified Docker images
- **🛡️ Security Scanning** - Automated Trivy vulnerability checks
- **📋 SBOM Generation** - Software bill of materials included

---

## 🖼️ Screenshots

<details>
<summary>View Workflow Editor</summary>

```
┌─────────────────────────────────────────────────────┐
│  Musashi Workflow Editor                      ⚙️ 🔍 │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │   User   │───▶│  Agent   │───▶│  Output  │     │
│  │  Input   │    │   GPT-4  │    │  Result  │     │
│  └──────────┘    └──────────┘    └──────────┘     │
│        │              │                │           │
│        └──────────────┼────────────────┘           │
│                       ▼                            │
│                 ┌──────────┐                       │
│                 │ Function │                       │
│                 │  Process │                       │
│                 └──────────┘                       │
└─────────────────────────────────────────────────────┘
```

</details>

---

## 🚀 Quick Start

### 1-Minute Installation - Docker Run (GHCR)

```bash
# Pull the latest image from GitHub Container Registry
docker pull ghcr.io/iml1111/musashi:latest

# Run with a single command (includes MongoDB)
docker run -d \
  --name musashi \
  --restart unless-stopped \
  -p 80:80 \
  -p 8080:8080 \
  -e MONGODB_URL="mongodb://host.docker.internal:27017" \
  -e DATABASE_NAME="musashi" \
  -e SECRET_KEY="$(openssl rand -hex 32)" \
  --add-host host.docker.internal:host-gateway \
  ghcr.io/iml1111/musashi:latest

# Access in browser
open http://localhost
```

> **Note**: 
> - The image path follows lowercase convention: `ghcr.io/iml1111/musashi`
> - For first-time publishing, set the package to **Public** in GitHub Packages for anonymous pull
> - The image includes OCI labels like `org.opencontainers.image.source` linking back to this repository

### Docker Compose (Recommended)

```bash
# 1. Download docker-compose.yml
curl -O https://raw.githubusercontent.com/iml1111/musashi/main/docker-compose.yml

# 2. Set environment variables
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env

# 3. Run
docker-compose up -d

# 4. Access
open http://localhost
```

### 🔐 Default Admin Credentials

When Musashi starts for the first time, it automatically creates an admin account:

| Field | Value | Note |
|-------|-------|------|
| **Username** | `admin` | Default administrator account |
| **Password** | `1234` | ⚠️ **Change immediately after first login** |

> **Security Notice**: 
> - The admin account is created automatically on first startup
> - For production deployments, **immediately change the default password**
> - Create individual user accounts for team members
> - Never expose the default credentials in production environments

---

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|--------|------|--------|------|
| `MONGODB_URL` | MongoDB connection URL (Currently only MongoDB is supported, RDBMS integration planned) | `mongodb://localhost:27017` | ✅ |
| `DATABASE_NAME` | Database name | `musashi` | ✅ |
| `SECRET_KEY` | JWT signing secret key (32+ characters) | - | ✅ |
| `BACKEND_CORS_ORIGINS` | CORS allowed origins | `http://localhost` | ❌ |
| `ENVIRONMENT` | Runtime environment (development/production) | `production` | ❌ |
| `DEBUG` | Debug mode | `false` | ❌ |
| `LOG_LEVEL` | Log level (debug/info/warning/error) | `info` | ❌ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time (minutes) | `11520` | ❌ |

### Environment Variables Example

```bash
# .env file
MONGODB_URL=mongodb://mongodb:27017
DATABASE_NAME=musashi
SECRET_KEY=your-secret-key-minimum-32-characters
BACKEND_CORS_ORIGINS=http://localhost,https://yourdomain.com
ENVIRONMENT=production
LOG_LEVEL=info
```

---

## 🌐 Ports and Health Checks

### Port Configuration

| Port | Service | Description |
|------|---------|-------------|
| `80` | Frontend | React application (nginx) - Production |
| `8080` | Backend API | FastAPI REST API - Direct access |
| `27017` | MongoDB | Database (external) - RDBMS support planned |

### Health Check Endpoints

```bash
# Frontend health check
curl http://localhost/health
# Response: {"status": "ok"}

# Backend API health check
curl http://localhost:8080/api/v1/health
# Response: {"status": "healthy", "api": "v1", "timestamp": "2024-01-20T10:00:00Z"}

# Docker health check status
docker inspect musashi --format='{{.State.Health.Status}}'
# Response: healthy
```

### Docker Health Check Configuration

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/api/v1/health"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 40s
```

---

## 🔄 Upgrade Guide

### 1. Backup

```bash
# MongoDB backup
docker exec musashi-mongodb mongodump \
  --db musashi \
  --out /backup/musashi-$(date +%Y%m%d)

# Copy backup files
docker cp musashi-mongodb:/backup ./backup-$(date +%Y%m%d)
```

### 2. Upgrade to New Version

```bash
# Stop existing container
docker stop musashi

# Pull new image
docker pull ghcr.io/iml1111/musashi:latest

# Verify image signature (optional)
cosign verify ghcr.io/iml1111/musashi:latest \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/iml1111/musashi/\.github/workflows/.*'

# Run new version
docker run -d \
  --name musashi-new \
  -p 80:80 \
  -p 8080:8080 \
  --env-file .env \
  ghcr.io/iml1111/musashi:latest

# Remove old container after verification
docker rm musashi
docker rename musashi-new musashi
```

### 3. Rollback (If Needed)

```bash
# Restore to previous version
docker stop musashi
docker run -d \
  --name musashi \
  --env-file .env \
  ghcr.io/iml1111/musashi:latest

# Restore data
docker cp ./backup-20240120 musashi-mongodb:/restore
docker exec musashi-mongodb mongorestore --db musashi /restore/musashi
```

---

## ❓ FAQ

### Q: MongoDB connection error occurs

```bash
# Test MongoDB connection
docker exec musashi python -c "
from pymongo import MongoClient
client = MongoClient('mongodb://host.docker.internal:27017')
print(client.server_info()['version'])
"

# Solutions
# 1. Check if MongoDB is running
docker ps | grep mongo

# 2. Check network settings (macOS/Windows)
--add-host host.docker.internal:host-gateway
```

### Q: What is the default admin account?

Automatically created on first run:
- Username: `admin`
- Password: `changeme123!` (immediate change recommended)

### Q: I want to change the ports

```bash
# Map to different ports
docker run -d \
  --name musashi \
  -p 8080:80 \      # Frontend to 8080
  -p 9000:8000 \    # API to 9000
  --env-file .env \
  ghcr.io/iml1111/musashi:latest
```

### Q: How to set up SSL/TLS?

We recommend using a reverse proxy:

```nginx
server {
    listen 443 ssl;
    server_name musashi.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Q: How to backup and restore?

```bash
# Backup
docker exec musashi-mongodb mongodump --db musashi --out /backup
docker cp musashi-mongodb:/backup ./backup

# Restore
docker cp ./backup musashi-mongodb:/restore
docker exec musashi-mongodb mongorestore --db musashi /restore/musashi
```

### Q: Multi-platform support?

Supports both AMD64 and ARM64 architectures:
- `linux/amd64`: Intel/AMD processors
- `linux/arm64`: Apple Silicon (M1/M2), ARM servers

### Q: How to check logs?

```bash
# Real-time logs
docker logs -f musashi

# Last 100 lines
docker logs --tail 100 musashi

# Since specific time
docker logs --since 2h musashi
```

---

## 📚 Additional Documentation

- 📖 [Installation Guide](./INSTALL.md) - Detailed installation and setup instructions
- 🔐 [Security Policy](./SECURITY.md) - Security vulnerability reporting and policies
- 🤝 [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project
- 📝 [Changelog](./CHANGELOG.md) - Version history and changes
- 📋 [API Documentation](http://localhost:8080/api/docs) - OpenAPI/Swagger documentation

---

## 🏗️ Technology Stack

<table>
<tr>
<td align="center"><b>🎨 Frontend</b></td>
<td align="center"><b>⚙️ Backend</b></td>
<td align="center"><b>💾 Database</b></td>
<td align="center"><b>🚀 DevOps</b></td>
</tr>
<tr>
<td>

- **React 18** + TypeScript 5.2
- **React Flow** 11.11 (Workflow Editor)
- **Dagre** 0.8.5 (Auto Layout)
- **Tailwind CSS** 3.3
- **Vite** 7.1 (Build Tool)
- **Zustand** (State Management)
- **Vitest** (Testing)

</td>
<td>

- **Python 3.12**
- **FastAPI** 0.104+
- **Pydantic** 2.5+ (Validation)
- **Motor** 3.3+ (Async MongoDB)
- **python-jose** (JWT Auth)
- **passlib** (Password Hashing)
- **pytest** (Testing)

</td>
<td>

- **MongoDB** 7.0+
- Document Store
- Async Operations
- Index Optimization
- GridFS (planned)

</td>
<td>

- **Docker** + Alpine Linux
- **GitHub Actions** CI/CD
- **Cosign** (Image Signing)
- **Trivy** (Security Scan)
- **GHCR** (Registry)
- **Nginx** (Reverse Proxy)

</td>
</tr>
</table>

---

## 🤝 Contributing

Musashi is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 📄 License

This project is distributed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

---

## 🔗 Links

- [GitHub Repository](https://github.com/iml1111/musashi)
- [Container Image (GHCR)](https://github.com/iml1111/musashi/pkgs/container/musashi)
- [Issue Tracker](https://github.com/iml1111/musashi/issues)

---


<div align="center">
  <sub>Built with ❤️ by the Musashi Team</sub>
  <br>
  <sub>© 2024-2025 Musashi Team. All rights reserved.</sub>
</div>