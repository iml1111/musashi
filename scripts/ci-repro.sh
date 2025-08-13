#!/bin/bash

# CI Reproduction Script for Musashi
# Mimics GitHub Actions CI environment exactly

set -e

echo "🔄 Musashi CI Reproduction Script Start..."
echo "=================================="

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Confirm project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "📍 Project Root: $PROJECT_ROOT"

# Environment Variables Settings (same as GitHub Actions)
export MONGODB_URL="mongodb://admin:password123@localhost:27017/musashi_test?authSource=admin"
export DATABASE_NAME="musashi_test"
export SECRET_KEY="test-secret-key"

# Confirm and start MongoDB container
echo -e "\n${YELLOW}🍃 Confirming and Starting MongoDB Container...${NC}"
if ! docker ps | grep -q mongo:7.0; then
    echo "Starting MongoDB Container..."
    docker run -d --name mongodb-test \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=password123 \
        -p 27017:27017 \
        mongo:7.0 || echo "MongoDB Container already exists or is running."
else
    echo "MongoDB Container is already running."
fi

# Wait for MongoDB connection
echo "Waiting for MongoDB connection..."
sleep 5

# Confirm Python version (CI uses 3.12)
echo -e "\n${YELLOW}🐍 Confirming Python Environment...${NC}"
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "Current Python Version: $python_version"
if [[ "$python_version" != "3.12" ]]; then
    echo -e "${RED}⚠️  Warning: CI uses Python 3.12. Current version may be different.${NC}"
fi

# Confirm Node.js version (CI uses 20)
echo -e "\n${YELLOW}📦 Confirming Node.js Environment...${NC}"
if command -v node &> /dev/null; then
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    echo "Current Node.js Version: v$(node --version | cut -d'v' -f2)"
    if [[ "$node_version" != "20" ]]; then
        echo -e "${RED}⚠️  Warning: CI uses Node.js 20. Current version may be different.${NC}"
    fi
else
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    exit 1
fi

# =============================================================================
# Backend Testing (same order as GitHub Actions)
# =============================================================================

echo -e "\n${YELLOW}🔧 Starting Backend Testing...${NC}"

# Move to backend directory
cd "$PROJECT_ROOT/backend"

# Install backend dependencies
echo -e "\n📦 Installing Backend Dependencies..."
if [[ -f "requirements.txt" ]]; then
    pip install -r requirements.txt
    pip install ruff
else
    echo -e "${RED}❌ Cannot find requirements.txt file.${NC}"
    exit 1
fi

# Backend linting (same as GitHub Actions)
echo -e "\n🔍 Backend Linting Inspection..."
if ruff check .; then
    echo -e "${GREEN}✅ Backend Linting Passed${NC}"
else
    echo -e "${RED}❌ Backend Linting Failed${NC}"
    BACKEND_LINT_FAILED=1
fi

# Execute backend testing
echo -e "\n🧪 Executing Backend Testing..."
if python -m pytest -v; then
    echo -e "${GREEN}✅ Backend Testing Passed${NC}"
else
    echo -e "${RED}❌ Backend Testing Failed${NC}"
    BACKEND_TEST_FAILED=1
fi

# =============================================================================
# Frontend Testing (same order as GitHub Actions)
# =============================================================================

echo -e "\n${YELLOW}⚛️  Starting Frontend Testing...${NC}"

# Move to frontend directory
cd "$PROJECT_ROOT/frontend"

# Install frontend dependencies (using npm ci)
echo -e "\n📦 Installing Frontend Dependencies..."
if [[ -f "package-lock.json" ]]; then
    npm ci
else
    echo -e "${RED}❌ Cannot find package-lock.json file.${NC}"
    exit 1
fi

# Frontend linting
echo -e "\n🔍 Frontend Linting Inspection..."
if npm run lint; then
    echo -e "${GREEN}✅ Frontend Linting Passed${NC}"
else
    echo -e "${RED}❌ Frontend Linting Failed${NC}"
    FRONTEND_LINT_FAILED=1
fi

# Frontend testing (including coverage)
echo -e "\n🧪 Executing Frontend Testing (including coverage)..."
if npm run test:coverage; then
    echo -e "${GREEN}✅ Frontend Testing Passed${NC}"
else
    echo -e "${RED}❌ Frontend Testing Failed${NC}"
    FRONTEND_TEST_FAILED=1
fi

# Frontend Build
echo -e "\n🔨 Frontend Build..."
if npm run build; then
    echo -e "${GREEN}✅ Frontend Build Passed${NC}"
else
    echo -e "${RED}❌ Frontend Build Failed${NC}"
    FRONTEND_BUILD_FAILED=1
fi

# =============================================================================
# Docker Build and Compose Testing (same as GitHub Actions)
# =============================================================================

cd "$PROJECT_ROOT"

echo -e "\n${YELLOW}🐳 Docker Build Testing...${NC}"
if docker compose build; then
    echo -e "${GREEN}✅ Docker Build Passed${NC}"
else
    echo -e "${RED}❌ Docker Build Failed${NC}"
    DOCKER_BUILD_FAILED=1
fi

echo -e "\n${YELLOW}🐳 Docker Compose Health Check Testing...${NC}"
# Environment variables settings same as GitHub Actions CI
export SECRET_KEY="test-secret-key-for-ci"
export MONGODB_URL="mongodb://mongo:27017"
export DATABASE_NAME="musashi_test"

# Clean up existing containers
docker compose down 2>/dev/null || true

# Start services
echo "Starting Docker Compose Services..."
if docker compose up -d; then
    echo "Containers started. Waiting..."
    sleep 30
    
    # Confirm container status
    echo "=== Container Status ==="
    docker compose ps
    
    # Check logs
    echo "=== Mongo Log ==="
    docker compose logs mongo | tail -10
    echo "=== App Log ==="
    docker compose logs musashi | tail -20
    
    # Test MongoDB connection
    if docker compose exec -T mongo mongosh --quiet --eval "db.runCommand('ping')" 2>/dev/null; then
        echo -e "${GREEN}✅ MongoDB Connection Successful${NC}"
    else
        echo -e "${RED}❌ MongoDB Connection Failed${NC}"
        DOCKER_MONGO_FAILED=1
    fi
    
    # App health check testing (same method as GitHub Actions)
    echo "Testing App Connection..."
    if timeout 30 bash -c 'until docker compose exec -T musashi curl -sf http://localhost:8080/api/v1/health; do sleep 2; done'; then
        echo -e "${GREEN}✅ App Health Check Successful${NC}"
    else
        echo -e "${RED}❌ App Health Check Failed${NC}"
        echo "Testing Alternative Connection..."
        docker compose exec -T musashi curl -v http://localhost:8080/ || echo "Direct Connection Failed"
        DOCKER_HEALTH_FAILED=1
    fi
    
    # Cleanup
    docker compose down
else
    echo -e "${RED}❌ Docker Compose Start Failed${NC}"
    DOCKER_COMPOSE_FAILED=1
fi

# =============================================================================
# Result Summary
# =============================================================================

echo -e "\n${YELLOW}📋 CI Reproduction Result Summary${NC}"
echo "=================================="

FAILED_COUNT=0

if [[ -n "$BACKEND_LINT_FAILED" ]]; then
    echo -e "${RED}❌ Backend Linting Failed${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ Backend Linting Success${NC}"
fi

if [[ -n "$BACKEND_TEST_FAILED" ]]; then
    echo -e "${RED}❌ Backend Testing Failed${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ Backend Testing Success${NC}"
fi

if [[ -n "$FRONTEND_LINT_FAILED" ]]; then
    echo -e "${RED}❌ Frontend Linting Failed${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ Frontend Linting Success${NC}"
fi

if [[ -n "$FRONTEND_TEST_FAILED" ]]; then
    echo -e "${RED}❌ Frontend Testing Failed${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ Frontend Testing Success${NC}"
fi

if [[ -n "$FRONTEND_BUILD_FAILED" ]]; then
    echo -e "${RED}❌ Frontend Build Failed${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ Frontend Build Success${NC}"
fi

if [[ -n "$DOCKER_BUILD_FAILED" ]]; then
    echo -e "${RED}❌ Docker Build Failed${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ Docker Build Success${NC}"
fi

if [[ -n "$DOCKER_COMPOSE_FAILED" ]]; then
    echo -e "${RED}❌ Docker Compose Start Failed${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ Docker Compose Start Success${NC}"
fi

if [[ -n "$DOCKER_MONGO_FAILED" ]]; then
    echo -e "${RED}❌ MongoDB Connection Failed${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ MongoDB Connection Successful${NC}"
fi

if [[ -n "$DOCKER_HEALTH_FAILED" ]]; then
    echo -e "${RED}❌ App Health Check Failed${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ App Health Check Success${NC}"
fi

# Clean up MongoDB container
echo -e "\n🧹 Cleaning Up Testing Environment..."
docker stop mongodb-test 2>/dev/null || true
docker rm mongodb-test 2>/dev/null || true

if [[ $FAILED_COUNT -gt 0 ]]; then
    echo -e "\n${RED}💥 Total $FAILED_COUNT inspections failed.${NC}"
    echo -e "${YELLOW}🔧 Please resolve the problems and retry.${NC}"
    exit 1
else
    echo -e "\n${GREEN}🎉 All CI inspections were successful!${NC}"
    exit 0
fi