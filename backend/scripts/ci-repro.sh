#!/bin/bash
# CI Environment Reproduction Script - Execute local testing with the same environment as GitHub Actions

set -e  # Stop immediately when error occurs

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create log directory
mkdir -p logs

# Initialize log file
LOG_FILE="logs/local-ci.log"
echo "CI Reproduction Log - $(date)" > $LOG_FILE

echo -e "${YELLOW}🔧 Starting CI Environment Reproduction Script${NC}"

# Environment Variables Settings (same as CI)
export MONGODB_URL="mongodb://localhost:27017/musashi_test?authSource=admin"
export DATABASE_NAME="musashi_test"  
export SECRET_KEY="test-secret-key"

echo -e "${YELLOW}📋 Confirming Environment Info${NC}" | tee -a $LOG_FILE
echo "Python version: $(python3 --version)" | tee -a $LOG_FILE
echo "Node version: $(node --version)" | tee -a $LOG_FILE
echo "MONGODB_URL: $MONGODB_URL" | tee -a $LOG_FILE

# Confirm MongoDB service
echo -e "${YELLOW}🔍 Confirming MongoDB Connection${NC}" | tee -a $LOG_FILE
if ! mongosh --eval "db.runCommand('ping').ok" $MONGODB_URL &>/dev/null; then
    echo -e "${RED}❌ MongoDB Connection Failed. Starting MongoDB with Docker Compose...${NC}" | tee -a $LOG_FILE
    
    # Start MongoDB container if it doesn't exist
    if ! docker ps | grep -q mongo; then
        echo "Starting MongoDB Docker Container..." | tee -a $LOG_FILE
        docker run -d --name test-mongo -p 27017:27017 mongo:latest || {
            echo -e "${RED}❌ Failed to Start MongoDB Container${NC}" | tee -a $LOG_FILE
            exit 1
        }
        
        # Wait until MongoDB is ready
        echo "Waiting until MongoDB is ready..." | tee -a $LOG_FILE
        for i in {1..30}; do
            if mongosh --eval "db.runCommand('ping').ok" $MONGODB_URL &>/dev/null; then
                echo -e "${GREEN}✅ MongoDB Connection Successful${NC}" | tee -a $LOG_FILE
                break
            fi
            echo "Waiting... ($i/30)" | tee -a $LOG_FILE
            sleep 2
        done
    fi
else
    echo -e "${GREEN}✅ MongoDB Connection Successful${NC}" | tee -a $LOG_FILE
fi

# Execute backend testing
echo -e "${YELLOW}🧪 Executing Backend Testing (same as CI Environment)${NC}" | tee -a $LOG_FILE
cd ../  # Move to backend directory

# Confirm Python dependencies installation
echo "Confirming Python Dependencies..." | tee -a $LOG_FILE
pip install -r requirements.txt >> $LOG_FILE 2>&1

# 린트 먼저 Execute (CI와 동Day한 순서)
echo "Executing Backend Linting..." | tee -a $LOG_FILE
python -m ruff check . >> $LOG_FILE 2>&1 || {
    echo -e "${RED}❌ Backend Linting Failed${NC}" | tee -a $LOG_FILE
    exit 1
}
echo -e "${GREEN}✅ Backend Linting Passed${NC}" | tee -a $LOG_FILE

# Testing Execute
echo "Executing Backend Testing..." | tee -a $LOG_FILE
python -m pytest --tb=short -v >> $LOG_FILE 2>&1
BACKEND_EXIT_CODE=$?

if [ $BACKEND_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Backend Testing Failed (Exit code: $BACKEND_EXIT_CODE)${NC}" | tee -a $LOG_FILE
else
    echo -e "${GREEN}✅ Backend Testing Passed${NC}" | tee -a $LOG_FILE
fi

# Execute frontend testing
echo -e "${YELLOW}🧪 Executing Frontend Testing (same as CI Environment)${NC}" | tee -a $LOG_FILE
cd ../frontend  # Move to frontend directory

# Confirm Node.js dependencies installation
echo "Confirming Frontend Dependencies..." | tee -a $LOG_FILE
npm install >> $LOG_FILE 2>&1

# 린트 먼저 Execute (CI와 동Day한 순서)
echo "Executing Frontend Linting..." | tee -a $LOG_FILE
npm run type-check >> $LOG_FILE 2>&1 || {
    echo -e "${RED}❌ Frontend Linting Failed${NC}" | tee -a $LOG_FILE
    exit 1
}
echo -e "${GREEN}✅ Frontend Linting Passed${NC}" | tee -a $LOG_FILE

# Testing Execute
echo "Executing Frontend Testing..." | tee -a $LOG_FILE
npm run test:coverage >> $LOG_FILE 2>&1
FRONTEND_EXIT_CODE=$?

if [ $FRONTEND_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Frontend Testing Failed (Exit code: $FRONTEND_EXIT_CODE)${NC}" | tee -a $LOG_FILE
else
    echo -e "${GREEN}✅ Frontend Testing Passed${NC}" | tee -a $LOG_FILE
fi

# Result summary
echo -e "\n${YELLOW}📊 Testing Result Summary${NC}" | tee -a $LOG_FILE
echo "Backend Testing: $([ $BACKEND_EXIT_CODE -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")" | tee -a $LOG_FILE
echo "Frontend Testing: $([ $FRONTEND_EXIT_CODE -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")" | tee -a $LOG_FILE

# Determine final exit code
FINAL_EXIT_CODE=0
if [ $BACKEND_EXIT_CODE -ne 0 ] || [ $FRONTEND_EXIT_CODE -ne 0 ]; then
    FINAL_EXIT_CODE=1
    echo -e "\n${RED}❌ CI Reproduction Testing Failed${NC}" | tee -a $LOG_FILE
    echo -e "Please check logs/local-ci.log file for detailed logs." | tee -a $LOG_FILE
else
    echo -e "\n${GREEN}✅ CI Reproduction Testing Successful${NC}" | tee -a $LOG_FILE
fi

echo "Log File Location: $(pwd)/logs/local-ci.log" | tee -a $LOG_FILE
exit $FINAL_EXIT_CODE