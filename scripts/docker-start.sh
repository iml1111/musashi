#!/bin/bash

# ===========================================
# Musashi Docker Compose 빠른 시작 스크립트
# ===========================================
# 
# 사용법:
# ./scripts/docker-start.sh [ENVIRONMENT] [OPTIONS]
#
# 환경:
#   prod       - 프로덕션 환경 (기본값)
#   dev        - 개발 환경
#   build      - 빌드 테스트 환경
#
# 옵션:
#   --rebuild  - 이미지 강제 재빌드
#   --clean    - 기존 컨테이너/볼륨 정리 후 시작
#   --logs     - 시작 후 로그 모니터링
#   --help     - 도움말 표시

set -e  # 에러 발생시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수들
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

# 도움말 표시
show_help() {
    cat << EOF
🚀 Musashi Docker Compose 빠른 시작 도구

사용법:
  $0 [ENVIRONMENT] [OPTIONS]

환경:
  prod       프로덕션 환경 (docker-compose.yml)
  dev        개발 환경 (docker-compose.dev.yml)
  build      빌드 테스트 (docker-compose.build.yml)

옵션:
  --rebuild  이미지 강제 재빌드
  --clean    기존 컨테이너/볼륨 정리 후 시작
  --logs     시작 후 로그 모니터링  
  --help     이 도움말 표시

예제:
  $0                     # 프로덕션 환경으로 시작
  $0 dev                 # 개발 환경으로 시작  
  $0 prod --rebuild      # 프로덕션 환경, 이미지 재빌드
  $0 dev --clean --logs  # 개발 환경, 정리 후 시작, 로그 모니터링

환경 변수 설정:
  1. .env.example을 .env로 복사
  2. SECRET_KEY 등 필수 값 설정
  3. 필요시 포트 및 데이터베이스 설정 조정

문제 해결:
  - 포트 충돌: .env에서 MUSASHI_PORT 변경
  - 권한 문제: sudo 없이 Docker 실행 가능한지 확인
  - 볼륨 문제: --clean 옵션으로 볼륨 정리 후 재시작

EOF
}

# 환경 변수 파일 확인
check_env_file() {
    if [[ ! -f .env ]]; then
        log_warning ".env 파일이 없습니다"
        
        if [[ -f .env.example ]]; then
            log_info ".env.example에서 .env 파일을 생성합니다..."
            cp .env.example .env
            log_warning "⚠️  .env 파일을 열어서 SECRET_KEY 등 필수 값들을 설정하세요!"
            log_warning "특히 프로덕션 환경에서는 보안을 위해 모든 기본값을 변경해주세요."
        else
            log_error ".env.example 파일도 찾을 수 없습니다!"
            log_error "환경 변수 설정 파일이 필요합니다."
            exit 1
        fi
    else
        log_success ".env 파일이 존재합니다"
        
        # SECRET_KEY 확인
        if grep -q "your-super-secure-secret-key-change-this-in-production" .env; then
            log_warning "⚠️  기본 SECRET_KEY가 사용되고 있습니다!"
            log_warning "보안을 위해 .env 파일에서 SECRET_KEY를 변경해주세요."
        fi
    fi
}

# Docker 및 Docker Compose 확인
check_dependencies() {
    log_info "의존성 확인 중..."
    
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
    
    # Docker 데몬 실행 확인
    if ! docker info &> /dev/null; then
        log_error "Docker 데몬이 실행되고 있지 않습니다!"
        log_error "Docker Desktop을 시작하거나 Docker 서비스를 시작하세요."
        exit 1
    fi
    
    log_success "모든 의존성이 준비되었습니다"
}

# 컨테이너 및 볼륨 정리
cleanup() {
    log_info "기존 컨테이너 및 볼륨 정리 중..."
    
    # 실행 중인 컨테이너 중지
    if docker-compose -f "$COMPOSE_FILE" ps -q 2>/dev/null | grep -q .; then
        log_info "실행 중인 컨테이너를 중지합니다..."
        docker-compose -f "$COMPOSE_FILE" down
    fi
    
    # 볼륨 정리 (선택적)
    read -p "데이터 볼륨도 삭제하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_warning "볼륨을 삭제합니다... (데이터가 손실될 수 있습니다)"
        docker-compose -f "$COMPOSE_FILE" down -v
        
        # 이름이 지정된 볼륨 정리
        docker volume ls -q | grep musashi | xargs -r docker volume rm
    fi
    
    # 미사용 이미지 정리
    log_info "미사용 Docker 이미지 정리 중..."
    docker image prune -f
    
    log_success "정리 완료"
}

# 메인 함수
main() {
    # 기본값 설정
    ENVIRONMENT="prod"
    REBUILD=false
    CLEAN=false  
    SHOW_LOGS=false
    
    # 명령행 인수 처리
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
                log_error "알 수 없는 옵션: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Compose 파일 선택
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
    
    log_info "🚀 Musashi Docker Compose 시작"
    log_info "환경: $ENVIRONMENT ($COMPOSE_FILE)"
    
    # 의존성 확인
    check_dependencies
    
    # 환경 변수 파일 확인
    check_env_file
    
    # Compose 파일 존재 확인
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "$COMPOSE_FILE 파일을 찾을 수 없습니다!"
        exit 1
    fi
    
    # 정리 옵션
    if [[ "$CLEAN" == true ]]; then
        cleanup
    fi
    
    # 빌드 옵션 설정
    BUILD_ARGS=""
    if [[ "$REBUILD" == true ]]; then
        BUILD_ARGS="--build"
        log_info "이미지를 강제로 재빌드합니다..."
    fi
    
    # Docker Compose 실행
    log_info "Docker Compose를 시작합니다..."
    
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        log_info "개발 환경 옵션 서비스들:"
        log_info "  - 프론트엔드 개발 서버: docker-compose -f $COMPOSE_FILE --profile frontend-dev up -d"
        log_info "  - Redis 개발 서버: docker-compose -f $COMPOSE_FILE --profile redis up -d"
        log_info "  - MongoDB Express: docker-compose -f $COMPOSE_FILE --profile mongo-admin up -d"
    fi
    
    # 컨테이너 시작
    if ! docker-compose -f "$COMPOSE_FILE" up -d $BUILD_ARGS; then
        log_error "Docker Compose 시작에 실패했습니다!"
        exit 1
    fi
    
    # 상태 확인
    log_info "컨테이너 상태 확인 중..."
    sleep 5
    
    # 헬스체크 대기
    log_info "서비스 헬스체크 대기 중..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f "$COMPOSE_FILE" ps | grep -E "(healthy|Up)" > /dev/null; then
            log_success "서비스가 정상적으로 시작되었습니다! 🎉"
            break
        fi
        
        log_info "대기 중... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_warning "헬스체크 타임아웃. 로그를 확인하세요."
    fi
    
    # 접속 정보 표시
    echo
    log_success "=== Musashi 접속 정보 ==="
    
    case $ENVIRONMENT in
        prod)
            echo "🌐 웹 애플리케이션: http://localhost:8080"
            echo "📊 API 문서: http://localhost:8080/docs"
            ;;
        dev)
            echo "🌐 웹 애플리케이션: http://localhost:8080"
            echo "⚙️  백엔드 API: http://localhost:8000"
            echo "📊 API 문서: http://localhost:8000/docs"
            echo "🗄️  MongoDB: mongodb://localhost:27017"
            echo "📊 MongoDB Express: http://localhost:8081 (admin/admin123)"
            ;;
        build)
            echo "🌐 빌드 테스트: http://localhost:8080"
            echo "🗄️  MongoDB: mongodb://localhost:27017"
            ;;
    esac
    
    echo
    log_info "유용한 명령어들:"
    echo "  컨테이너 로그 보기: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  컨테이너 상태 확인: docker-compose -f $COMPOSE_FILE ps"
    echo "  컨테이너 중지: docker-compose -f $COMPOSE_FILE down"
    echo "  데이터와 함께 정리: docker-compose -f $COMPOSE_FILE down -v"
    
    # 로그 모니터링
    if [[ "$SHOW_LOGS" == true ]]; then
        echo
        log_info "로그 모니터링을 시작합니다... (Ctrl+C로 중단)"
        sleep 2
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

# 스크립트 실행
main "$@"