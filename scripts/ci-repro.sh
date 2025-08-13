#!/bin/bash

# CI Reproduction Script for Musashi
# Mimics GitHub Actions CI environment exactly

set -e

echo "🔄 Musashi CI 재현 스크립트 시작..."
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉터리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "📍 프로젝트 루트: $PROJECT_ROOT"

# 환경 변수 설정 (GitHub Actions와 동일)
export MONGODB_URL="mongodb://admin:password123@localhost:27017/musashi_test?authSource=admin"
export DATABASE_NAME="musashi_test"
export SECRET_KEY="test-secret-key"

# MongoDB 컨테이너 확인 및 시작
echo -e "\n${YELLOW}🍃 MongoDB 컨테이너 확인 및 시작...${NC}"
if ! docker ps | grep -q mongo:7.0; then
    echo "MongoDB 컨테이너 시작중..."
    docker run -d --name mongodb-test \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=password123 \
        -p 27017:27017 \
        mongo:7.0 || echo "MongoDB 컨테이너가 이미 존재하거나 실행 중입니다."
else
    echo "MongoDB 컨테이너가 이미 실행중입니다."
fi

# MongoDB 연결 대기
echo "MongoDB 연결 대기중..."
sleep 5

# Python 버전 확인 (CI에서는 3.12 사용)
echo -e "\n${YELLOW}🐍 Python 환경 확인...${NC}"
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "현재 Python 버전: $python_version"
if [[ "$python_version" != "3.12" ]]; then
    echo -e "${RED}⚠️  경고: CI는 Python 3.12를 사용합니다. 현재 버전과 다를 수 있습니다.${NC}"
fi

# Node.js 버전 확인 (CI에서는 20 사용)
echo -e "\n${YELLOW}📦 Node.js 환경 확인...${NC}"
if command -v node &> /dev/null; then
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    echo "현재 Node.js 버전: v$(node --version | cut -d'v' -f2)"
    if [[ "$node_version" != "20" ]]; then
        echo -e "${RED}⚠️  경고: CI는 Node.js 20을 사용합니다. 현재 버전과 다를 수 있습니다.${NC}"
    fi
else
    echo -e "${RED}❌ Node.js가 설치되지 않았습니다.${NC}"
    exit 1
fi

# =============================================================================
# 백엔드 테스트 (GitHub Actions와 동일한 순서)
# =============================================================================

echo -e "\n${YELLOW}🔧 백엔드 테스트 시작...${NC}"

# 백엔드 디렉터리 이동
cd "$PROJECT_ROOT/backend"

# 백엔드 의존성 설치
echo -e "\n📦 백엔드 의존성 설치..."
if [[ -f "requirements.txt" ]]; then
    pip install -r requirements.txt
    pip install ruff
else
    echo -e "${RED}❌ requirements.txt 파일을 찾을 수 없습니다.${NC}"
    exit 1
fi

# 백엔드 린팅 (GitHub Actions와 동일)
echo -e "\n🔍 백엔드 린팅 검사..."
if ruff check .; then
    echo -e "${GREEN}✅ 백엔드 린팅 통과${NC}"
else
    echo -e "${RED}❌ 백엔드 린팅 실패${NC}"
    BACKEND_LINT_FAILED=1
fi

# 백엔드 테스트 실행
echo -e "\n🧪 백엔드 테스트 실행..."
if python -m pytest -v; then
    echo -e "${GREEN}✅ 백엔드 테스트 통과${NC}"
else
    echo -e "${RED}❌ 백엔드 테스트 실패${NC}"
    BACKEND_TEST_FAILED=1
fi

# =============================================================================
# 프론트엔드 테스트 (GitHub Actions와 동일한 순서)
# =============================================================================

echo -e "\n${YELLOW}⚛️  프론트엔드 테스트 시작...${NC}"

# 프론트엔드 디렉터리 이동
cd "$PROJECT_ROOT/frontend"

# 프론트엔드 의존성 설치 (npm ci 사용)
echo -e "\n📦 프론트엔드 의존성 설치..."
if [[ -f "package-lock.json" ]]; then
    npm ci
else
    echo -e "${RED}❌ package-lock.json 파일을 찾을 수 없습니다.${NC}"
    exit 1
fi

# 프론트엔드 린팅
echo -e "\n🔍 프론트엔드 린팅 검사..."
if npm run lint; then
    echo -e "${GREEN}✅ 프론트엔드 린팅 통과${NC}"
else
    echo -e "${RED}❌ 프론트엔드 린팅 실패${NC}"
    FRONTEND_LINT_FAILED=1
fi

# 프론트엔드 테스트 (커버리지 포함)
echo -e "\n🧪 프론트엔드 테스트 실행 (커버리지 포함)..."
if npm run test:coverage; then
    echo -e "${GREEN}✅ 프론트엔드 테스트 통과${NC}"
else
    echo -e "${RED}❌ 프론트엔드 테스트 실패${NC}"
    FRONTEND_TEST_FAILED=1
fi

# 프론트엔드 빌드
echo -e "\n🔨 프론트엔드 빌드..."
if npm run build; then
    echo -e "${GREEN}✅ 프론트엔드 빌드 통과${NC}"
else
    echo -e "${RED}❌ 프론트엔드 빌드 실패${NC}"
    FRONTEND_BUILD_FAILED=1
fi

# =============================================================================
# Docker 빌드 및 컴포즈 테스트 (GitHub Actions와 동일)
# =============================================================================

cd "$PROJECT_ROOT"

echo -e "\n${YELLOW}🐳 Docker 빌드 테스트...${NC}"
if docker compose build; then
    echo -e "${GREEN}✅ Docker 빌드 통과${NC}"
else
    echo -e "${RED}❌ Docker 빌드 실패${NC}"
    DOCKER_BUILD_FAILED=1
fi

echo -e "\n${YELLOW}🐳 Docker Compose 헬스체크 테스트...${NC}"
# GitHub Actions CI와 동일한 환경변수 설정
export SECRET_KEY="test-secret-key-for-ci"
export MONGODB_URL="mongodb://mongo:27017"
export DATABASE_NAME="musashi_test"

# 기존 컨테이너 정리
docker compose down 2>/dev/null || true

# 서비스 시작
echo "Docker Compose 서비스 시작..."
if docker compose up -d; then
    echo "컨테이너 시작됨. 대기 중..."
    sleep 30
    
    # 컨테이너 상태 확인
    echo "=== 컨테이너 상태 ==="
    docker compose ps
    
    # 로그 확인
    echo "=== Mongo 로그 ==="
    docker compose logs mongo | tail -10
    echo "=== App 로그 ==="
    docker compose logs musashi | tail -20
    
    # MongoDB 연결 테스트
    if docker compose exec -T mongo mongosh --quiet --eval "db.runCommand('ping')" 2>/dev/null; then
        echo -e "${GREEN}✅ MongoDB 연결 성공${NC}"
    else
        echo -e "${RED}❌ MongoDB 연결 실패${NC}"
        DOCKER_MONGO_FAILED=1
    fi
    
    # 앱 헬스체크 테스트 (GitHub Actions와 동일한 방식)
    echo "앱 연결 테스트..."
    if timeout 30 bash -c 'until docker compose exec -T musashi curl -sf http://localhost:8080/api/v1/health; do sleep 2; done'; then
        echo -e "${GREEN}✅ 앱 헬스체크 성공${NC}"
    else
        echo -e "${RED}❌ 앱 헬스체크 실패${NC}"
        echo "대체 연결 테스트..."
        docker compose exec -T musashi curl -v http://localhost:8080/ || echo "직접 연결 실패"
        DOCKER_HEALTH_FAILED=1
    fi
    
    # 정리
    docker compose down
else
    echo -e "${RED}❌ Docker Compose 시작 실패${NC}"
    DOCKER_COMPOSE_FAILED=1
fi

# =============================================================================
# 결과 요약
# =============================================================================

echo -e "\n${YELLOW}📋 CI 재현 결과 요약${NC}"
echo "=================================="

FAILED_COUNT=0

if [[ -n "$BACKEND_LINT_FAILED" ]]; then
    echo -e "${RED}❌ 백엔드 린팅 실패${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ 백엔드 린팅 성공${NC}"
fi

if [[ -n "$BACKEND_TEST_FAILED" ]]; then
    echo -e "${RED}❌ 백엔드 테스트 실패${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ 백엔드 테스트 성공${NC}"
fi

if [[ -n "$FRONTEND_LINT_FAILED" ]]; then
    echo -e "${RED}❌ 프론트엔드 린팅 실패${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ 프론트엔드 린팅 성공${NC}"
fi

if [[ -n "$FRONTEND_TEST_FAILED" ]]; then
    echo -e "${RED}❌ 프론트엔드 테스트 실패${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ 프론트엔드 테스트 성공${NC}"
fi

if [[ -n "$FRONTEND_BUILD_FAILED" ]]; then
    echo -e "${RED}❌ 프론트엔드 빌드 실패${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ 프론트엔드 빌드 성공${NC}"
fi

if [[ -n "$DOCKER_BUILD_FAILED" ]]; then
    echo -e "${RED}❌ Docker 빌드 실패${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ Docker 빌드 성공${NC}"
fi

if [[ -n "$DOCKER_COMPOSE_FAILED" ]]; then
    echo -e "${RED}❌ Docker Compose 시작 실패${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ Docker Compose 시작 성공${NC}"
fi

if [[ -n "$DOCKER_MONGO_FAILED" ]]; then
    echo -e "${RED}❌ MongoDB 연결 실패${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ MongoDB 연결 성공${NC}"
fi

if [[ -n "$DOCKER_HEALTH_FAILED" ]]; then
    echo -e "${RED}❌ 앱 헬스체크 실패${NC}"
    ((FAILED_COUNT++))
else
    echo -e "${GREEN}✅ 앱 헬스체크 성공${NC}"
fi

# MongoDB 컨테이너 정리
echo -e "\n🧹 테스트 환경 정리..."
docker stop mongodb-test 2>/dev/null || true
docker rm mongodb-test 2>/dev/null || true

if [[ $FAILED_COUNT -gt 0 ]]; then
    echo -e "\n${RED}💥 총 $FAILED_COUNT 개의 검사가 실패했습니다.${NC}"
    echo -e "${YELLOW}🔧 문제를 해결한 후 다시 실행하세요.${NC}"
    exit 1
else
    echo -e "\n${GREEN}🎉 모든 CI 검사가 성공했습니다!${NC}"
    exit 0
fi