#!/bin/bash

# ===========================================
# Musashi Docker Compose Quick Start Script
# ===========================================
# 
# Usage:
# ./scripts/docker-start.sh [ENVIRONMENT] [OPTIONS]
#
# Environment:
# prod       - Production Environment (default)
# dev        - Development Environment
# build      - Build Testing Environment
#
# Option:
# --rebuild  - Force rebuild images
# --clean    - Clean existing containers/volumes before start
# --logs     - Monitor logs after start
# --help     - Show help message

set -e  # Stop script on error

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show help message
show_help() {
    cat << EOF
🚀 Musashi Docker Compose Quick Start Tool

Usage:
  $0 [ENVIRONMENT] [OPTIONS]

Environment:
  prod       Production Environment (docker-compose.yml)
  dev        Development Environment (docker-compose.dev.yml)
  build      Build Testing (docker-compose.build.yml)

Option:
  --rebuild  Force rebuild images
  --clean    Clean existing containers/volumes before start
  --logs     Monitor logs after start  
  --help     Show this help message

Example:
  $0                     # Start with Production Environment
  $0 dev                 # Start with Development Environment  
  $0 prod --rebuild      # Production Environment, Image 재Build
  $0 dev --clean --logs  # Development Environment, 정리 후 Start, Log Monitoring

Environment Variables Settings:
  1. .env.example을 .env로 Copy
  2. SECRET_KEY 등 Required Value Settings
  3. 필요Hour Port 및 Database Settings 조정

Problem Resolve:
  - Port Conflict: .env에서 MUSASHI_PORT Change
  - Permission Problem: sudo 없이 Docker Execute 가능한지 Confirm
  - Volume Problem: --clean Option으로 Volume 정리 후 재Start

EOF
}

# Environment Variables File Confirm
check_env_file() {
    if [[ ! -f .env ]]; then
        log_warning ".env File이 없습니다"
        
        if [[ -f .env.example ]]; then
            log_info ".env.example에서 .env File을 Create합니다..."
            cp .env.example .env
            log_warning "⚠️  .env File을 열어서 SECRET_KEY 등 Required Value들을 Settings하세요!"
            log_warning "특히 Production Environment에서는 Security을 위해 모든 DefaultValue을 Change해주세요."
        else
            log_error ".env.example File도 찾을 수 없습니다!"
            log_error "Environment Variables Settings File이 필요합니다."
            exit 1
        fi
    else
        log_success ".env File이 존재합니다"
        
        # SECRET_KEY Confirm
        if grep -q "your-super-secure-secret-key-change-this-in-production" .env; then
            log_warning "⚠️  Default SECRET_KEY가 사용되고 있습니다!"
            log_warning "Security을 위해 .env File에서 SECRET_KEY를 Change해주세요."
        fi
    fi
}

# Docker 및 Docker Compose Confirm
check_dependencies() {
    log_info "Dependencies Confirm 중..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되어 있지 않습니다!"
        log_error "https://docs.docker.com/get-docker/ 에서 Docker를 설치하세요."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose가 설치되어 있지 않습니다!"
        log_error "https://docs.docker.com/compose/install/ 에서 Docker Compose를 설치하세요."
        exit 1
    fi
    
    # Docker 데몬 Execute Confirm
    if ! docker info &> /dev/null; then
        log_error "Docker 데몬이 Execute되고 있지 않습니다!"
        log_error "Docker Desktop을 Start하거나 Docker Service를 Start하세요."
        exit 1
    fi
    
    log_success "모든 Dependencies이 준비되었습니다"
}

# Container 및 Volume 정리
cleanup() {
    log_info "기존 Container 및 Volume 정리 중..."
    
    # Execute 중인 Stop container
    if docker-compose -f "$COMPOSE_FILE" ps -q 2>/dev/null | grep -q .; then
        log_info "Execute 중인 Container를 Stop합니다..."
        docker-compose -f "$COMPOSE_FILE" down
    fi
    
    # Volume 정리 (Select적)
    read -p "Data Volume도 Delete하Hour겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Volume을 Delete합니다... (Data가 손실될 수 있습니다)"
        docker-compose -f "$COMPOSE_FILE" down -v
        
        # Name이 지정된 Volume 정리
        docker volume ls -q | grep musashi | xargs -r docker volume rm
    fi
    
    # 미사용 Image 정리
    log_info "미사용 Docker Image 정리 중..."
    docker image prune -f
    
    log_success "정리 Complete"
}

# 메인 함수
main() {
    # DefaultValue Settings
    ENVIRONMENT="prod"
    REBUILD=false
    CLEAN=false  
    SHOW_LOGS=false
    
    # 명령행 인수 Process
    while [[ $# -gt 0 ]]; do
        case $1 in
            prod|dev|build)
                ENVIRONMENT="$1"
                shift
                ;;
            --rebuild)
                REBUILD=true
                shift
                ;;
            --clean)
                CLEAN=true
                shift
                ;;
            --logs)
                SHOW_LOGS=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "알 수 없는 Option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Compose File Select
    case $ENVIRONMENT in
        prod)
            COMPOSE_FILE="docker-compose.yml"
            ;;
        dev)
            COMPOSE_FILE="docker-compose.dev.yml"
            ;;
        build)
            COMPOSE_FILE="docker-compose.build.yml"
            ;;
    esac
    
    log_info "🚀 Musashi Docker Compose Start"
    log_info "Environment: $ENVIRONMENT ($COMPOSE_FILE)"
    
    # Dependencies Confirm
    check_dependencies
    
    # Environment Variables File Confirm
    check_env_file
    
    # Compose File 존재 Confirm
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "$COMPOSE_FILE File을 찾을 수 없습니다!"
        exit 1
    fi
    
    # 정리 Option
    if [[ "$CLEAN" == true ]]; then
        cleanup
    fi
    
    # Build Option Settings
    BUILD_ARGS=""
    if [[ "$REBUILD" == true ]]; then
        BUILD_ARGS="--build"
        log_info "Image를 강제로 재Build합니다..."
    fi
    
    # Docker Compose Execute
    log_info "Docker Compose를 Start합니다..."
    
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        log_info "Development Environment Option Service들:"
        log_info "  - Frontend Development Server: docker-compose -f $COMPOSE_FILE --profile frontend-dev up -d"
        log_info "  - Redis Development Server: docker-compose -f $COMPOSE_FILE --profile redis up -d"
        log_info "  - MongoDB Express: docker-compose -f $COMPOSE_FILE --profile mongo-admin up -d"
    fi
    
    # Container Start
    if ! docker-compose -f "$COMPOSE_FILE" up -d $BUILD_ARGS; then
        log_error "Docker Compose Start에 Failed했습니다!"
        exit 1
    fi
    
    # Status Confirm
    log_info "Container Status Confirm 중..."
    sleep 5
    
    # 헬스체크 Wait
    log_info "Service 헬스체크 Wait 중..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f "$COMPOSE_FILE" ps | grep -E "(healthy|Up)" > /dev/null; then
            log_success "Service가 정상적으로 Start되었습니다! 🎉"
            break
        fi
        
        log_info "Wait 중... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_warning "헬스체크 Timeout. Log를 Confirm하세요."
    fi
    
    # 접속 Info 표Hour
    echo
    log_success "=== Musashi 접속 Info ==="
    
    case $ENVIRONMENT in
        prod)
            echo "🌐 Web 애플리케이션: http://localhost:8080"
            echo "📊 API Documentation: http://localhost:8080/docs"
            ;;
        dev)
            echo "🌐 Web 애플리케이션: http://localhost:8080"
            echo "⚙️  Backend API: http://localhost:8000"
            echo "📊 API Documentation: http://localhost:8000/docs"
            echo "🗄️  MongoDB: mongodb://localhost:27017"
            echo "📊 MongoDB Express: http://localhost:8081 (admin/admin123)"
            ;;
        build)
            echo "🌐 Build Testing: http://localhost:8080"
            echo "🗄️  MongoDB: mongodb://localhost:27017"
            ;;
    esac
    
    echo
    log_info "유용한 Command들:"
    echo "  Container Log View: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  Container Status Confirm: docker-compose -f $COMPOSE_FILE ps"
    echo "  Stop container: docker-compose -f $COMPOSE_FILE down"
    echo "  Data와 함께 정리: docker-compose -f $COMPOSE_FILE down -v"
    
    # Log Monitoring
    if [[ "$SHOW_LOGS" == true ]]; then
        echo
        log_info "Log Monitoring을 Start합니다... (Ctrl+C로 중단)"
        sleep 2
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Script Execute
main "$@"