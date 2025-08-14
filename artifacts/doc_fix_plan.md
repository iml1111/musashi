# Documentation Fix Plan

Last analyzed: 2025-01-14

## Summary of Discrepancies Found

Total issues found: **12**

## 1. README.md

### Port Configuration Issues
- **Current**: Claims Frontend runs on port 80, Backend API on port 8080
- **Actual** (from inventory.json): 
  - Single container mode: Frontend on port 80, Backend API on port 8080 (direct access)
  - Docker compose mode: Frontend on port 3000 (dev), Backend on port 8000 (dev)
- **Fix**: Clarify that ports 80/8080 are for the single container production mode

### Docker Image Repository
- **Current**: References `ghcr.io/iml1111/musashi` (with lowercase L)
- **Should be**: `ghcr.io/imiml/musashi` (consistent with actual GitHub username)
- **Fix**: Update all image references to use correct username

### Health Check Endpoints
- **Current**: Shows `/health` for frontend and `/api/v1/health` for backend
- **Actual**: Backend has both `/health` and `/api/v1/health`
- **Fix**: Update to show correct health endpoints

### Docker Run Command
- **Current**: Shows port mapping `-p 8080:8000`
- **Actual**: Should be `-p 8080:8080` for backend API access
- **Fix**: Correct port mapping in docker run examples

## 2. INSTALL.md

### Port Mapping Issues
- **Current**: Shows `-p 8080:8000` in Quick Start
- **Actual**: Should be `-p 8080:8080` based on Dockerfile.optimized
- **Fix**: Update all docker run commands

### GitHub Container Registry
- **Current**: References `ghcr.io/imiml/musashi`
- **Issue**: Inconsistent with README.md which uses `iml1111`
- **Fix**: Standardize to correct GitHub username

## 3. DOCKER_COMPOSE_GUIDE.md

### Architecture Diagram
- **Current**: Shows Nginx on :8080 and FastAPI on :8000 inside container
- **Actual**: Nginx serves on port 80 internally, exposed as 8080 externally
- **Fix**: Update architecture diagram to reflect actual internal ports

### Access URLs
- **Current**: Lists web app at `http://localhost:8080`
- **Actual**: In single container mode, frontend is on port 80, API on port 8080
- **Fix**: Clarify access points for different modes

### Script References
- **Current**: References `./scripts/docker-start.sh`
- **Actual**: The main script is `./run-musashi.sh`
- **Fix**: Update script references

## 4. CLAUDE.md

### Docker Commands
- **Current**: Shows old docker commands and port configurations
- **Actual**: Should reflect single container architecture
- **Fix**: Update all docker commands to match current implementation

### Make Commands
- **Current**: References legacy make targets
- **Actual**: Should emphasize docker-* prefixed commands for single container
- **Fix**: Update make command documentation

## 5. CI_DEBUG_GUIDE.md

### Health Check Commands
- **Current**: May have outdated health check URLs
- **Fix**: Verify and update health check endpoints

## 6. Common Issues Across Multiple Files

### Environment Variables
- Several files have inconsistent environment variable documentation
- Need to standardize based on .env.example

### MongoDB Connection URLs
- Mix of `mongodb://localhost:27017`, `mongodb://mongo:27017`, and `mongodb://host.docker.internal:27017`
- Need to clarify which is used when

### Version Numbers
- Some files reference v1.0.0, others v1.0.1
- Need to update to consistent current version

## Files to Update

1. **README.md** - 5 issues
2. **INSTALL.md** - 2 issues  
3. **DOCKER_COMPOSE_GUIDE.md** - 3 issues
4. **CLAUDE.md** - 2 issues
5. **CI_DEBUG_GUIDE.md** - Check needed
6. **CONTRIBUTING.md** - Review needed
7. **CHANGELOG.md** - Version sync needed

## Automated Fix Strategy

1. Replace all incorrect port mappings
2. Standardize GitHub Container Registry URLs
3. Update health check endpoints
4. Correct docker run commands
5. Update version numbers to v1.0.1
6. Add "Last updated: YYYY-MM-DD" headers
7. Fix MongoDB URL examples based on context (docker vs local)

---

**md_issues**: 12md_issues=0
