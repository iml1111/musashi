#!/bin/bash

# Optimized Docker Build Script for Musashi
# Features: Multi-stage caching, parallel builds, size optimization

set -euo pipefail

# Configuration
REGISTRY="${REGISTRY:-}"
TAG="${TAG:-latest}"
PLATFORM="${PLATFORM:-linux/amd64,linux/arm64}"
BUILD_ARGS="${BUILD_ARGS:-}"
PUSH="${PUSH:-false}"
CACHE_FROM="${CACHE_FROM:-true}"
PARALLEL="${PARALLEL:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi

    # Check Docker Buildx for multi-platform builds
    if [[ "$PLATFORM" == *","* ]]; then
        if ! docker buildx version &> /dev/null; then
            log_error "Docker Buildx is required for multi-platform builds"
            exit 1
        fi
    fi

    log_success "Dependencies check passed"
}

# Setup build environment
setup_build_env() {
    log_info "Setting up build environment..."
    
    # Create buildx builder if it doesn't exist
    if [[ "$PLATFORM" == *","* ]]; then
        if ! docker buildx inspect musashi-builder &> /dev/null; then
            log_info "Creating buildx builder for multi-platform builds..."
            docker buildx create --name musashi-builder --use
        else
            docker buildx use musashi-builder
        fi
    fi

    # Clean up old images if requested
    if [[ "${CLEAN:-false}" == "true" ]]; then
        log_info "Cleaning up old images..."
        docker system prune -f
        docker builder prune -f
    fi
}

# Build with cache optimization
build_with_cache() {
    local dockerfile="$1"
    local context="$2"
    local image_name="$3"
    local target="${4:-}"
    
    log_info "Building ${image_name}..."
    
    # Build cache options
    local cache_opts=""
    if [[ "$CACHE_FROM" == "true" ]]; then
        # Try to pull existing images for cache
        log_info "Pulling cache images..."
        docker pull "${image_name}:latest" || true
        docker pull "${image_name}:python-deps" || true
        docker pull "${image_name}:frontend-deps" || true
        docker pull "${image_name}:frontend-builder" || true
        
        cache_opts="--cache-from ${image_name}:latest --cache-from ${image_name}:python-deps --cache-from ${image_name}:frontend-deps --cache-from ${image_name}:frontend-builder"
    fi
    
    # Build target if specified
    local target_opt=""
    if [[ -n "$target" ]]; then
        target_opt="--target $target"
    fi
    
    # Platform option
    local platform_opt=""
    if [[ -n "$PLATFORM" ]]; then
        platform_opt="--platform $PLATFORM"
    fi
    
    # Build args
    local build_args_opt=""
    if [[ -n "$BUILD_ARGS" ]]; then
        build_args_opt="$BUILD_ARGS"
    fi

    # Execute build
    if [[ "$PLATFORM" == *","* ]]; then
        # Multi-platform build with buildx
        docker buildx build \
            $platform_opt \
            $target_opt \
            $cache_opts \
            $build_args_opt \
            --tag "$image_name" \
            --file "$dockerfile" \
            ${PUSH:+--push} \
            "$context"
    else
        # Single platform build
        docker build \
            $platform_opt \
            $target_opt \
            $cache_opts \
            $build_args_opt \
            --tag "$image_name" \
            --file "$dockerfile" \
            "$context"
    fi
}

# Build intermediate cache layers
build_cache_layers() {
    log_info "Building cache layers..."
    
    # Build frontend dependencies cache
    build_with_cache "Dockerfile.optimized" "." "musashi:frontend-deps" "frontend-deps"
    
    # Build Python dependencies cache
    build_with_cache "Dockerfile.optimized" "." "musashi:python-deps" "python-deps"
    
    # Build frontend builder cache
    build_with_cache "Dockerfile.optimized" "." "musashi:frontend-builder" "frontend-builder"
    
    log_success "Cache layers built successfully"
}

# Build production image
build_production() {
    log_info "Building production image..."
    
    local image_name="musashi"
    if [[ -n "$REGISTRY" ]]; then
        image_name="${REGISTRY}/musashi"
    fi
    
    build_with_cache "Dockerfile.optimized" "." "${image_name}:${TAG}"
    
    # Tag as latest if not already
    if [[ "$TAG" != "latest" ]]; then
        docker tag "${image_name}:${TAG}" "${image_name}:latest"
    fi
    
    log_success "Production image built: ${image_name}:${TAG}"
}

# Analyze image size and layers
analyze_image() {
    local image_name="$1"
    
    log_info "Analyzing image: $image_name"
    
    # Image size
    local size=$(docker images "$image_name" --format "table {{.Size}}" | tail -n +2)
    log_info "Image size: $size"
    
    # Layer analysis
    log_info "Layer analysis:"
    docker history "$image_name" --format "table {{.ID}}\t{{.CreatedBy}}\t{{.Size}}" | head -20
    
    # Security scan if available
    if command -v trivy &> /dev/null; then
        log_info "Running security scan..."
        trivy image --severity HIGH,CRITICAL "$image_name"
    else
        log_warn "Trivy not found, skipping security scan"
    fi
}

# Push to registry
push_to_registry() {
    if [[ "$PUSH" == "true" && -n "$REGISTRY" ]]; then
        log_info "Pushing to registry..."
        docker push "${REGISTRY}/musashi:${TAG}"
        docker push "${REGISTRY}/musashi:latest"
        log_success "Images pushed to registry"
    fi
}

# Test the built image
test_image() {
    log_info "Testing built image..."
    
    local image_name="musashi:${TAG}"
    
    # Start test container
    local container_id=$(docker run -d \
        --name musashi-test \
        --rm \
        -e MONGODB_URL="mongodb://host.docker.internal:27017" \
        -e DATABASE_NAME="musashi_test" \
        -e SECRET_KEY="test-secret-key" \
        -p 8081:8080 \
        "$image_name")
    
    # Wait for container to be ready
    log_info "Waiting for container to be ready..."
    local timeout=60
    while [ $timeout -gt 0 ]; do
        if docker exec "$container_id" curl -f http://localhost:8080/health >/dev/null 2>&1; then
            log_success "Container is healthy"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -eq 0 ]; then
        log_error "Container health check failed"
        docker logs "$container_id"
        docker stop "$container_id"
        exit 1
    fi
    
    # Test API endpoint
    if curl -f http://localhost:8081/health >/dev/null 2>&1; then
        log_success "API endpoint test passed"
    else
        log_error "API endpoint test failed"
        docker logs "$container_id"
        docker stop "$container_id"
        exit 1
    fi
    
    # Cleanup
    docker stop "$container_id"
    log_success "Image test completed successfully"
}

# Main execution
main() {
    log_info "Starting optimized Docker build for Musashi"
    log_info "Configuration:"
    log_info "  Registry: ${REGISTRY:-<none>}"
    log_info "  Tag: $TAG"
    log_info "  Platform: $PLATFORM"
    log_info "  Cache from: $CACHE_FROM"
    log_info "  Push: $PUSH"
    log_info "  Parallel: $PARALLEL"
    
    check_dependencies
    setup_build_env
    
    # Build process
    if [[ "$PARALLEL" == "true" ]]; then
        log_info "Building with parallel optimization..."
        build_cache_layers
    fi
    
    build_production
    analyze_image "musashi:$TAG"
    
    # Optional testing
    if [[ "${TEST:-false}" == "true" ]]; then
        test_image
    fi
    
    push_to_registry
    
    log_success "Build completed successfully!"
    log_info "To run the container:"
    log_info "  docker run -p 8080:8080 musashi:$TAG"
}

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --push)
            PUSH="true"
            shift
            ;;
        --no-cache)
            CACHE_FROM="false"
            shift
            ;;
        --clean)
            CLEAN="true"
            shift
            ;;
        --test)
            TEST="true"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --registry REGISTRY  Container registry to push to"
            echo "  --tag TAG           Image tag (default: latest)"
            echo "  --platform PLATFORM Target platform (default: linux/amd64,linux/arm64)"
            echo "  --push              Push to registry"
            echo "  --no-cache          Disable build cache"
            echo "  --clean             Clean up before build"
            echo "  --test              Test built image"
            echo "  --help              Show this help"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"