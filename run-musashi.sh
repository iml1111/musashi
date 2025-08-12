#!/bin/bash

# Musashi 단일 Docker 컨테이너 실행 스크립트
# 사용법: ./run-musashi.sh

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Musashi Container...${NC}"

# 기존 컨테이너가 있다면 중지 및 제거
if [ "$(docker ps -aq -f name=musashi)" ]; then
    echo -e "${YELLOW}📦 Removing existing musashi container...${NC}"
    docker stop musashi 2>/dev/null
    docker rm musashi 2>/dev/null
fi

# 컨테이너 실행
docker run -d \
  --name musashi \
  --restart unless-stopped \
  -p 80:80 \
  -p 8080:8000 \
  -e MONGODB_URL=mongodb://host.docker.internal:27017 \
  -e DATABASE_NAME=musashi \
  -e SECRET_KEY="${SECRET_KEY:-dev-secret-key-change-in-production}" \
  -e BACKEND_CORS_ORIGINS="http://localhost,http://localhost:80,http://localhost:8080" \
  -e ENVIRONMENT="${ENVIRONMENT:-development}" \
  -e DEBUG="${DEBUG:-true}" \
  -e LOG_LEVEL="${LOG_LEVEL:-info}" \
  --add-host host.docker.internal:host-gateway \
  musashi:latest

# 실행 결과 확인
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Musashi container started successfully!${NC}"
    echo ""
    echo -e "${GREEN}📌 Access points:${NC}"
    echo -e "  • Frontend: ${GREEN}http://localhost${NC} (port 80)"
    echo -e "  • Backend API: ${GREEN}http://localhost:8080${NC} (port 8080)"
    echo -e "  • Health Check: ${GREEN}http://localhost/health${NC}"
    echo ""
    echo -e "${YELLOW}📝 Useful commands:${NC}"
    echo -e "  • View logs: ${YELLOW}docker logs -f musashi${NC}"
    echo -e "  • Stop container: ${YELLOW}docker stop musashi${NC}"
    echo -e "  • Restart container: ${YELLOW}docker restart musashi${NC}"
    echo -e "  • Remove container: ${YELLOW}docker rm -f musashi${NC}"
else
    echo -e "${RED}❌ Failed to start Musashi container${NC}"
    echo -e "${YELLOW}Check logs with: docker logs musashi${NC}"
    exit 1
fi