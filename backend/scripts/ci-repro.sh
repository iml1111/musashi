#!/bin/bash
# CI 환경 재현 스크립트 - GitHub Actions와 동일한 환경으로 로컬 테스트 실행

set -e  # 에러 발생시 즉시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 로그 디렉토리 생성
mkdir -p logs

# 로그 파일 초기화
LOG_FILE="logs/local-ci.log"
echo "CI Reproduction Log - $(date)" > $LOG_FILE

echo -e "${YELLOW}🔧 CI 환경 재현 스크립트 시작${NC}"

# 환경 변수 설정 (CI와 동일)
export MONGODB_URL="mongodb://localhost:27017/musashi_test?authSource=admin"
export DATABASE_NAME="musashi_test"  
export SECRET_KEY="test-secret-key"

echo -e "${YELLOW}📋 환경 정보 확인${NC}" | tee -a $LOG_FILE
echo "Python version: $(python3 --version)" | tee -a $LOG_FILE
echo "Node version: $(node --version)" | tee -a $LOG_FILE
echo "MONGODB_URL: $MONGODB_URL" | tee -a $LOG_FILE

# MongoDB 서비스 확인
echo -e "${YELLOW}🔍 MongoDB 연결 확인${NC}" | tee -a $LOG_FILE
if ! mongosh --eval "db.runCommand('ping').ok" $MONGODB_URL &>/dev/null; then
    echo -e "${RED}❌ MongoDB 연결 실패. Docker Compose로 MongoDB 시작 중...${NC}" | tee -a $LOG_FILE
    
    # MongoDB 컨테이너가 없으면 시작
    if ! docker ps | grep -q mongo; then
        echo "MongoDB Docker 컨테이너 시작 중..." | tee -a $LOG_FILE
        docker run -d --name test-mongo -p 27017:27017 mongo:latest || {
            echo -e "${RED}❌ MongoDB 컨테이너 시작 실패${NC}" | tee -a $LOG_FILE
            exit 1
        }
        
        # MongoDB가 준비될 때까지 대기
        echo "MongoDB가 준비될 때까지 대기 중..." | tee -a $LOG_FILE
        for i in {1..30}; do
            if mongosh --eval "db.runCommand('ping').ok" $MONGODB_URL &>/dev/null; then
                echo -e "${GREEN}✅ MongoDB 연결 성공${NC}" | tee -a $LOG_FILE
                break
            fi
            echo "대기 중... ($i/30)" | tee -a $LOG_FILE
            sleep 2
        done
    fi
else
    echo -e "${GREEN}✅ MongoDB 연결 성공${NC}" | tee -a $LOG_FILE
fi

# 백엔드 테스트 실행
echo -e "${YELLOW}🧪 백엔드 테스트 실행 (CI 환경과 동일)${NC}" | tee -a $LOG_FILE
cd ../  # backend 디렉토리로 이동

# Python 의존성 설치 확인
echo "Python 의존성 확인 중..." | tee -a $LOG_FILE
pip install -r requirements.txt >> $LOG_FILE 2>&1

# 린트 먼저 실행 (CI와 동일한 순서)
echo "백엔드 린트 실행 중..." | tee -a $LOG_FILE
python -m ruff check . >> $LOG_FILE 2>&1 || {
    echo -e "${RED}❌ 백엔드 린트 실패${NC}" | tee -a $LOG_FILE
    exit 1
}
echo -e "${GREEN}✅ 백엔드 린트 통과${NC}" | tee -a $LOG_FILE

# 테스트 실행
echo "백엔드 테스트 실행 중..." | tee -a $LOG_FILE
python -m pytest --tb=short -v >> $LOG_FILE 2>&1
BACKEND_EXIT_CODE=$?

if [ $BACKEND_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ 백엔드 테스트 실패 (Exit code: $BACKEND_EXIT_CODE)${NC}" | tee -a $LOG_FILE
else
    echo -e "${GREEN}✅ 백엔드 테스트 통과${NC}" | tee -a $LOG_FILE
fi

# 프론트엔드 테스트 실행
echo -e "${YELLOW}🧪 프론트엔드 테스트 실행 (CI 환경과 동일)${NC}" | tee -a $LOG_FILE
cd ../frontend  # frontend 디렉토리로 이동

# Node.js 의존성 설치 확인
echo "프론트엔드 의존성 확인 중..." | tee -a $LOG_FILE
npm install >> $LOG_FILE 2>&1

# 린트 먼저 실행 (CI와 동일한 순서)
echo "프론트엔드 린트 실행 중..." | tee -a $LOG_FILE
npm run type-check >> $LOG_FILE 2>&1 || {
    echo -e "${RED}❌ 프론트엔드 린트 실패${NC}" | tee -a $LOG_FILE
    exit 1
}
echo -e "${GREEN}✅ 프론트엔드 린트 통과${NC}" | tee -a $LOG_FILE

# 테스트 실행
echo "프론트엔드 테스트 실행 중..." | tee -a $LOG_FILE
npm run test:coverage >> $LOG_FILE 2>&1
FRONTEND_EXIT_CODE=$?

if [ $FRONTEND_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ 프론트엔드 테스트 실패 (Exit code: $FRONTEND_EXIT_CODE)${NC}" | tee -a $LOG_FILE
else
    echo -e "${GREEN}✅ 프론트엔드 테스트 통과${NC}" | tee -a $LOG_FILE
fi

# 결과 요약
echo -e "\n${YELLOW}📊 테스트 결과 요약${NC}" | tee -a $LOG_FILE
echo "백엔드 테스트: $([ $BACKEND_EXIT_CODE -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")" | tee -a $LOG_FILE
echo "프론트엔드 테스트: $([ $FRONTEND_EXIT_CODE -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")" | tee -a $LOG_FILE

# 최종 종료 코드 결정
FINAL_EXIT_CODE=0
if [ $BACKEND_EXIT_CODE -ne 0 ] || [ $FRONTEND_EXIT_CODE -ne 0 ]; then
    FINAL_EXIT_CODE=1
    echo -e "\n${RED}❌ CI 재현 테스트 실패${NC}" | tee -a $LOG_FILE
    echo -e "자세한 로그는 logs/local-ci.log 파일을 확인하세요." | tee -a $LOG_FILE
else
    echo -e "\n${GREEN}✅ CI 재현 테스트 성공${NC}" | tee -a $LOG_FILE
fi

echo "로그 파일 위치: $(pwd)/logs/local-ci.log" | tee -a $LOG_FILE
exit $FINAL_EXIT_CODE