<!-- Last updated: 2025-01-14 -->
# 🗡️ Musashi - AI Agent Workflow Design Tool

> **Visual AI Agent Workflow Designer Focused on Design Without Execution**

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.4-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/docker-ready-blue.svg" alt="Docker Ready">
  <img src="https://img.shields.io/badge/ghcr.io-available-blue.svg" alt="GHCR">
  <img src="https://img.shields.io/badge/platform-linux%2Famd64%20%7C%20linux%2Farm64-lightgrey" alt="Platforms">
</div>

<div align="center">
  <h3>Flow Sharp, Ship Fast.</h3>
  <p>Reduce code complexity, create powerful workflows.</p>
</div>

---

## ✨ Key Features

### 🎨 Visual Workflow Design
- **Drag & Drop Interface** - Intuitive node editing based on React Flow
- **Auto Layout** - Automatic alignment with Dagre algorithm
- **Various Node Types** - Support for Agent, Function, MCP, User Input, Output nodes
- **Smart Connections** - Automatic input/output connection management between nodes

### 👥 Team Collaboration
- **Real-time Sharing** - Instant workflow sharing and collaboration
- **RBAC Permission Management** - Role-based access control with Admin, Editor, Viewer roles
- **Team Workspaces** - Independent workflow environments for each team

### 🔄 Version Control
- **Git-Friendly** - Version control system integration with JSON format
- **Version History** - Track all changes
- **Export/Import** - Workflow backup and migration

### 🛡️ Security
- **JWT Authentication** - Secure token-based user authentication
- **Container Signing** - Images signed with Cosign
- **Vulnerability Scanning** - Automatic security checks with Trivy

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
docker pull ghcr.io/iml1111/musashi:v1.0.1
# Or use latest tag
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
curl -O https://raw.githubusercontent.com/imiml/musashi/main/docker-compose.yml

# 2. Set environment variables
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env

# 3. Run
docker-compose up -d

# 4. Access
open http://localhost
```


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
docker pull ghcr.io/iml1111/musashi:v2.0.0

# Verify image signature (optional)
cosign verify ghcr.io/iml1111/musashi:v2.0.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp 'https://github\.com/iml1111/musashi/\.github/workflows/.*'

# Run new version
docker run -d \
  --name musashi-new \
  -p 80:80 \
  -p 8080:8080 \
  --env-file .env \
  ghcr.io/iml1111/musashi:v2.0.0

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
  ghcr.io/iml1111/musashi:v1.0.2

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
<td align="center"><b>Frontend</b></td>
<td align="center"><b>Backend</b></td>
<td align="center"><b>Database</b></td>
<td align="center"><b>DevOps</b></td>
</tr>
<tr>
<td>

- React 18
- TypeScript
- React Flow
- Tailwind CSS
- Vite

</td>
<td>

- Python 3.12
- FastAPI
- Pydantic
- Motor
- JWT

</td>
<td>

- MongoDB 7.0
- Document Store
- GridFS (planned)

</td>
<td>

- Docker
- GitHub Actions
- Cosign
- Trivy

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