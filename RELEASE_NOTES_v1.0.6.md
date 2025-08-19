# Release Notes - v1.0.6

## 🔧 HTTPS Mixed Content Error Fix

Release Date: 2025-08-19

### Overview
Version 1.0.6 fixes the Mixed Content error that occurred when accessing Musashi through HTTPS in Kubernetes environments. This critical fix ensures that API requests work correctly in production HTTPS deployments.

### What's Fixed

#### 🐛 HTTPS Mixed Content Error
**Problem**: When accessing Musashi through HTTPS (e.g., https://musashi.alocados.io), the browser blocked API requests with the error:
```
Mixed Content: The page at 'https://musashi.alocados.io/dashboard' was loaded over HTTPS, 
but requested an insecure resource 'http://musashi.alocados.io/api/v1/workflows/'.
This request has been blocked; the content must be served over HTTPS.
```

**Root Cause**: The nginx proxy was not correctly preserving the original protocol (HTTPS) from the Kubernetes Ingress, causing the backend to think requests were coming via HTTP.

**Solution**: Modified nginx configuration to properly forward the `X-Forwarded-Proto` header from Kubernetes Ingress to the backend.

### What's Changed

#### 🔧 Nginx Configuration Update
**Before**:
```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

**After**:
```nginx
proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
```

This change ensures that:
- The original protocol (HTTPS) from Kubernetes Ingress is preserved
- Backend services correctly identify the request protocol
- API responses use the correct protocol in URLs
- No Mixed Content errors occur in browsers

### Technical Details

#### Changes in Dockerfile.optimized
- Updated line 184: Changed `X-Forwarded-Proto` header handling
- Now uses `$http_x_forwarded_proto` to preserve the original protocol from upstream proxies
- Compatible with standard Kubernetes Ingress configurations

### Deployment Notes

#### For Kubernetes Users
No configuration changes required. Simply update to v1.0.6:
```bash
kubectl set image deployment/musashi musashi=ghcr.io/iml1111/musashi:v1.0.6
```

#### For Docker Users
No changes required for standard Docker deployments:
```bash
docker pull ghcr.io/iml1111/musashi:v1.0.6
docker run -d --name musashi -p 80:8080 ghcr.io/iml1111/musashi:v1.0.6
```

### Testing
The fix has been tested in:
- Kubernetes clusters with HTTPS Ingress
- Docker environments (no regression)
- Various reverse proxy configurations

### Security Benefits
- Eliminates Mixed Content warnings in browsers
- Ensures all API communications use the same protocol as the main site
- Maintains security best practices for HTTPS deployments

### Docker Images
```bash
# Pull the latest version
docker pull ghcr.io/iml1111/musashi:v1.0.6
docker pull ghcr.io/iml1111/musashi:latest

# Verify the fix
docker run --rm ghcr.io/iml1111/musashi:v1.0.6 grep X-Forwarded-Proto /etc/nginx/nginx.conf
```

### Known Issues
None in this release.

### Contributors
- @iml1111 - Project maintainer
- Claude - AI assistant for HTTPS compatibility

### Previous Releases
- [v1.0.5](./RELEASE_NOTES_v1.0.5.md) - Kubernetes port binding fix
- [v1.0.4](./RELEASE_NOTES_v1.0.4.md) - CI/CD stability improvements
- [v1.0.3](./RELEASE_NOTES_v1.0.3.md) - Multi-user conflict resolution

---

For detailed changes, see [CHANGELOG.md](./CHANGELOG.md)