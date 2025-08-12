#!/bin/bash
# CI Docker Test - Run tests in exact CI environment using Docker
# This creates containers matching GitHub Actions Ubuntu environment

set -e

echo "🐳 Musashi CI Docker Environment Test"
echo "===================================="

# Create Docker network for test
docker network create musashi-ci-test 2>/dev/null || true

# Cleanup function
cleanup() {
    echo "Cleaning up Docker resources..."
    docker stop musashi-ci-mongodb 2>/dev/null || true
    docker rm musashi-ci-mongodb 2>/dev/null || true
    docker stop musashi-ci-runner 2>/dev/null || true
    docker rm musashi-ci-runner 2>/dev/null || true
    docker network rm musashi-ci-test 2>/dev/null || true
}

trap cleanup EXIT

# Start MongoDB matching CI
echo "Starting MongoDB service..."
docker run -d \
    --name musashi-ci-mongodb \
    --network musashi-ci-test \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=password123 \
    mongo:7.0

# Build test runner image
echo "Building CI test runner image..."
cat > /tmp/Dockerfile.ci-test << 'EOF'
FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3.12 \
    python3.12-venv \
    python3-pip \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.12 as default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1

# Install Node 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app
EOF

docker build -t musashi-ci-runner -f /tmp/Dockerfile.ci-test .

# Run tests in CI environment
echo "Running tests in CI environment..."
docker run --rm \
    --name musashi-ci-runner \
    --network musashi-ci-test \
    -v $(pwd):/app \
    -e MONGODB_URL=mongodb://admin:password123@musashi-ci-mongodb:27017/musashi_test?authSource=admin \
    -e DATABASE_NAME=musashi_test \
    -e SECRET_KEY=test-secret-key \
    musashi-ci-runner bash -c '
        set -e
        
        echo "=== Backend Tests ==="
        cd backend
        pip install -r requirements.txt
        pip install ruff
        ruff check .
        python -m pytest
        
        echo "=== Frontend Tests ==="
        cd ../frontend
        npm ci
        npm run lint
        npm test -- --coverage --watchAll=false
        npm run build
        
        echo "✅ All tests passed!"
    '

echo "🎉 CI Docker tests completed successfully!"