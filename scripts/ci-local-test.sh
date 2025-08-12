#!/bin/bash
# CI Local Test Script - Reproduce GitHub Actions CI environment locally
# This script mirrors the exact CI environment from .github/workflows/ci.yml

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Musashi CI Local Test Runner"
echo "================================"

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Python version
    if ! python3 --version | grep -q "3.12"; then
        echo -e "${RED}❌ Python 3.12 required. Current version:${NC}"
        python3 --version
        exit 1
    fi
    
    # Check Node version
    if ! node --version | grep -q "v18"; then
        echo -e "${RED}❌ Node.js 18 required. Current version:${NC}"
        node --version
        exit 1
    fi
    
    # Check Docker
    if ! docker --version > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is required but not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites OK${NC}"
}

# Setup MongoDB for tests
setup_mongodb() {
    echo -e "${YELLOW}Setting up MongoDB...${NC}"
    
    # Stop existing MongoDB container if running
    docker stop musashi-test-mongodb 2>/dev/null || true
    docker rm musashi-test-mongodb 2>/dev/null || true
    
    # Start MongoDB container (matching CI service)
    docker run -d \
        --name musashi-test-mongodb \
        -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=password123 \
        mongo:7.0
    
    # Wait for MongoDB to be ready
    echo "Waiting for MongoDB to be ready..."
    sleep 5
    
    echo -e "${GREEN}✅ MongoDB running${NC}"
}

# Run backend tests
test_backend() {
    echo -e "${YELLOW}🔧 Testing Backend...${NC}"
    
    cd backend
    
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Install dependencies
    echo "Installing backend dependencies..."
    pip install -r requirements.txt
    pip install ruff
    
    # Run linting
    echo "Running backend linting..."
    ruff check . || {
        echo -e "${RED}❌ Backend linting failed${NC}"
        deactivate
        return 1
    }
    
    # Run tests with CI environment variables
    echo "Running backend tests..."
    export MONGODB_URL="mongodb://admin:password123@localhost:27017/musashi_test?authSource=admin"
    export DATABASE_NAME="musashi_test"
    export SECRET_KEY="test-secret-key"
    
    python -m pytest || {
        echo -e "${RED}❌ Backend tests failed${NC}"
        deactivate
        return 1
    }
    
    deactivate
    cd ..
    
    echo -e "${GREEN}✅ Backend tests passed${NC}"
}

# Run frontend tests
test_frontend() {
    echo -e "${YELLOW}🎨 Testing Frontend...${NC}"
    
    cd frontend
    
    # Install dependencies with CI flag
    echo "Installing frontend dependencies..."
    npm ci
    
    # Run linting
    echo "Running frontend linting..."
    npm run lint || {
        echo -e "${RED}❌ Frontend linting failed${NC}"
        return 1
    }
    
    # Run tests with coverage
    echo "Running frontend tests..."
    npm test -- --coverage --watchAll=false || {
        echo -e "${RED}❌ Frontend tests failed${NC}"
        return 1
    }
    
    # Build frontend
    echo "Building frontend..."
    npm run build || {
        echo -e "${RED}❌ Frontend build failed${NC}"
        return 1
    }
    
    cd ..
    
    echo -e "${GREEN}✅ Frontend tests passed${NC}"
}

# Test Docker build
test_docker() {
    echo -e "${YELLOW}🐳 Testing Docker Build...${NC}"
    
    # Build Docker images
    docker-compose build || {
        echo -e "${RED}❌ Docker build failed${NC}"
        return 1
    }
    
    # Test Docker compose
    docker-compose up -d
    
    echo "Waiting for services to be ready..."
    sleep 30
    
    # Test endpoints
    curl -f http://localhost:3000/ || {
        echo -e "${RED}❌ Frontend health check failed${NC}"
        docker-compose down
        return 1
    }
    
    curl -f http://localhost:8000/health || {
        echo -e "${RED}❌ Backend health check failed${NC}"
        docker-compose down
        return 1
    }
    
    docker-compose down
    
    echo -e "${GREEN}✅ Docker tests passed${NC}"
}

# Cleanup function
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    docker stop musashi-test-mongodb 2>/dev/null || true
    docker rm musashi-test-mongodb 2>/dev/null || true
    docker-compose down 2>/dev/null || true
}

# Main execution
main() {
    # Set trap for cleanup on exit
    trap cleanup EXIT
    
    check_prerequisites
    
    # Parse arguments
    if [ "$1" == "--backend-only" ]; then
        setup_mongodb
        test_backend
    elif [ "$1" == "--frontend-only" ]; then
        test_frontend
    elif [ "$1" == "--docker-only" ]; then
        test_docker
    else
        # Run all tests (matching CI pipeline)
        setup_mongodb
        test_backend
        test_frontend
        test_docker
    fi
    
    echo -e "${GREEN}🎉 All CI tests passed successfully!${NC}"
}

# Run main function
main "$@"