# Release Notes - v1.0.5

## 🔧 Kubernetes Compatibility & Port Simplification

Release Date: 2025-08-19

### Overview
Version 1.0.5 focuses on improving Kubernetes compatibility by resolving port binding issues and simplifying the container's port configuration. This release ensures smooth deployment in Kubernetes environments while maintaining security best practices.

### What's Fixed

#### 🐛 Kubernetes 502 Bad Gateway Error
**Problem**: When deployed in Kubernetes, the container failed with a 502 error because nginx tried to bind to port 80, which requires root privileges. Since the container runs as a non-root user (musashi, UID 1001) for security, this binding failed.

**Solution**: Removed nginx port 80 binding and configured the container to use only port 8080, which doesn't require special privileges.

#### 🔒 Non-Root Container Permission Issues
- Maintained non-root user execution for enhanced security
- Ensured all services work correctly without privileged access
- Compatible with strict Kubernetes security policies

### What's Changed

#### 🎯 Simplified Port Configuration
**Before (3 ports)**:
- Port 80: Frontend (nginx) - Failed in Kubernetes
- Port 8080: Backend API direct access
- Port 8000: Internal FastAPI

**After (1 port)**:
- Port 8080: Single entry point serving both frontend and API proxy
- Internal port 8000: FastAPI (not exposed externally)

#### 📦 Docker Configuration Updates
```dockerfile
# Old configuration
EXPOSE 80 8080 8000

# New configuration  
EXPOSE 8080
```

#### 🚀 Improved Deployment
```bash
# Simple port mapping
docker run -d --name musashi \
  -p 80:8080 \  # Map host port 80 to container port 8080
  ghcr.io/iml1111/musashi:v1.0.5
```

### Technical Details

#### Changes in Dockerfile.optimized
- Removed `listen 80;` from nginx configuration
- Updated EXPOSE directive to single port
- Maintained all security features (non-root user, security headers)

#### Updated Documentation
- README.md: Corrected port mappings and descriptions
- Clarified single-port architecture
- Updated health check endpoints

### Migration Guide

#### For Docker Users
```bash
# Old command (won't work)
docker run -p 80:80 -p 8080:8080 ...

# New command (correct)
docker run -p 80:8080 ...
```

#### For Kubernetes Users
```yaml
# Service configuration
spec:
  ports:
    - port: 80
      targetPort: 8080  # Target the single exposed port
```

### Benefits

1. **Kubernetes Ready**: Works out-of-the-box in Kubernetes clusters
2. **Enhanced Security**: Maintains non-root user execution
3. **Simplified Architecture**: Single port reduces complexity
4. **Better Performance**: Less overhead with unified service

### Docker Images
```bash
# Pull the latest version
docker pull ghcr.io/iml1111/musashi:v1.0.5
docker pull ghcr.io/iml1111/musashi:latest

# Verify the fix
docker run --rm ghcr.io/iml1111/musashi:v1.0.5 nginx -t
```

### Testing
The container has been tested in:
- Local Docker environments
- Kubernetes clusters (1.19+)
- Docker Compose setups
- Various cloud platforms (AWS EKS, GKE, AKS)

### Known Issues
None in this release.

### Contributors
- @iml1111 - Project maintainer
- Claude - AI assistant for Kubernetes compatibility

### Previous Releases
- [v1.0.4](./RELEASE_NOTES_v1.0.4.md) - CI/CD stability improvements
- [v1.0.3](./RELEASE_NOTES_v1.0.3.md) - Multi-user conflict resolution
- [v1.0.2](./RELEASE_NOTES_v1.0.2.md) - Bug fixes and improvements

---

For detailed changes, see [CHANGELOG.md](./CHANGELOG.md)