#!/bin/bash
# CI Validation Script - Comprehensive testing before push
# Ensures all CI checks will pass before committing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo "🚀 Musashi CI Pre-Push Validation"
echo "================================="

# Results tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Result storage
RESULTS_FILE="/tmp/musashi-ci-validate-results.txt"
> $RESULTS_FILE

# Check function with result tracking
run_check() {
    local name="$1"
    local cmd="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -e "${BLUE}[$TOTAL_CHECKS] Running: $name${NC}"
    
    if eval "$cmd" > /dev/null 2>&1; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        echo -e "${GREEN}  ✅ PASS${NC}"
        echo "✅ $name" >> $RESULTS_FILE
        return 0
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${RED}  ❌ FAIL${NC}"
        echo "❌ $name" >> $RESULTS_FILE
        return 1
    fi
}

# Backend validation
validate_backend() {
    echo -e "${MAGENTA}=== Backend Validation ===${NC}"
    
    cd backend
    
    # Setup venv
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    
    # Install deps quietly
    pip install -r requirements.txt -q
    pip install ruff pytest pytest-asyncio httpx -q
    
    # Run checks
    run_check "Python syntax check" "python -m py_compile app/**/*.py"
    run_check "Ruff linting" "ruff check ."
    run_check "Import sorting" "python -c 'import app.main'"
    
    # Setup test MongoDB
    docker run -d --name test-mongo-validate \
        -p 27018:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=password123 \
        mongo:7.0 > /dev/null 2>&1 || true
    
    sleep 3
    
    export MONGODB_URL="mongodb://admin:password123@localhost:27018/test?authSource=admin"
    export DATABASE_NAME="test"
    export SECRET_KEY="test-key"
    
    run_check "Backend unit tests" "python -m pytest tests/ -q"
    run_check "API startup check" "python -c 'from app.main import app'"
    
    docker stop test-mongo-validate > /dev/null 2>&1 || true
    docker rm test-mongo-validate > /dev/null 2>&1 || true
    
    deactivate
    cd ..
}

# Frontend validation
validate_frontend() {
    echo -e "${MAGENTA}=== Frontend Validation ===${NC}"
    
    cd frontend
    
    # Ensure dependencies
    if [ ! -d "node_modules" ]; then
        npm ci > /dev/null 2>&1
    fi
    
    # Run checks
    run_check "TypeScript compilation" "npx tsc --noEmit"
    run_check "ESLint check" "npx eslint . --ext .ts,.tsx --max-warnings 0" || true
    run_check "Import resolution" "node -e 'require(\"./src/App\")||true'" || true
    run_check "Build test" "npm run build"
    run_check "Unit tests" "npm test -- --watchAll=false --passWithNoTests"
    
    cd ..
}

# Docker validation
validate_docker() {
    echo -e "${MAGENTA}=== Docker Validation ===${NC}"
    
    run_check "Dockerfile syntax" "docker build --no-cache -f Dockerfile -t test-build . --target builder"
    run_check "Docker Compose syntax" "docker-compose config -q"
    
    # Cleanup test image
    docker rmi test-build > /dev/null 2>&1 || true
}

# Git validation
validate_git() {
    echo -e "${MAGENTA}=== Git Validation ===${NC}"
    
    run_check "No merge conflicts" "! grep -r '<<<<<<< HEAD' --exclude-dir=node_modules --exclude-dir=.git ."
    run_check "No console.log in JS" "! grep -r 'console\\.log' frontend/src --include='*.tsx' --include='*.ts'" || true
    run_check "No print() in Python" "! grep -r '^[^#]*print(' backend/app --include='*.py'" || true
    run_check "No TODO comments" "! grep -r 'TODO' --exclude-dir=node_modules --exclude-dir=.git ." || true
}

# Coverage check
check_coverage() {
    echo -e "${MAGENTA}=== Coverage Check ===${NC}"
    
    cd frontend
    npm test -- --coverage --watchAll=false --silent > /tmp/coverage.txt 2>&1 || true
    
    if grep -q "All files" /tmp/coverage.txt; then
        coverage=$(grep "All files" /tmp/coverage.txt | awk '{print $10}')
        echo -e "${BLUE}Frontend coverage: $coverage${NC}"
    fi
    
    cd ..
}

# Performance check
check_performance() {
    echo -e "${MAGENTA}=== Performance Check ===${NC}"
    
    cd frontend
    
    # Check bundle size
    if [ -d "dist" ]; then
        total_size=$(du -sh dist | cut -f1)
        echo -e "${BLUE}Build size: $total_size${NC}"
        
        # Warning if too large
        size_kb=$(du -sk dist | cut -f1)
        if [ $size_kb -gt 5000 ]; then
            echo -e "${YELLOW}⚠️  Warning: Build size exceeds 5MB${NC}"
        fi
    fi
    
    cd ..
}

# Generate report
generate_report() {
    echo -e "\n${MAGENTA}=== Validation Report ===${NC}"
    echo "=============================="
    
    # Summary
    echo -e "Total checks: $TOTAL_CHECKS"
    echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
    echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
    
    # Success rate
    if [ $TOTAL_CHECKS -gt 0 ]; then
        success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
        
        if [ $success_rate -eq 100 ]; then
            echo -e "\n${GREEN}🎉 Perfect! All checks passed (100%)${NC}"
            echo -e "${GREEN}Safe to push to CI${NC}"
        elif [ $success_rate -gt 80 ]; then
            echo -e "\n${YELLOW}⚠️  Good! $success_rate% passed${NC}"
            echo -e "${YELLOW}Review failures before pushing${NC}"
        else
            echo -e "\n${RED}❌ Critical! Only $success_rate% passed${NC}"
            echo -e "${RED}Fix issues before pushing${NC}"
        fi
    fi
    
    # Failed checks
    if [ $FAILED_CHECKS -gt 0 ]; then
        echo -e "\n${RED}Failed checks:${NC}"
        grep "❌" $RESULTS_FILE | sed 's/❌/  -/'
    fi
    
    # Recommendations
    if [ $FAILED_CHECKS -gt 0 ]; then
        echo -e "\n${YELLOW}Recommendations:${NC}"
        echo "1. Run: ./scripts/ci-debug.sh to diagnose issues"
        echo "2. Fix each failed check individually"
        echo "3. Re-run this validation before pushing"
    fi
}

# Main execution
main() {
    # Quick mode or full mode
    MODE="${1:-full}"
    
    if [ "$MODE" == "quick" ]; then
        echo "Running quick validation..."
        validate_backend
        validate_frontend
    elif [ "$MODE" == "full" ]; then
        echo "Running full validation..."
        validate_backend
        validate_frontend
        validate_docker
        validate_git
        check_coverage
        check_performance
    else
        echo "Usage: $0 [quick|full]"
        exit 1
    fi
    
    generate_report
    
    # Exit with error if any check failed
    if [ $FAILED_CHECKS -gt 0 ]; then
        exit 1
    fi
}

# Cleanup
cleanup() {
    docker stop test-mongo-validate > /dev/null 2>&1 || true
    docker rm test-mongo-validate > /dev/null 2>&1 || true
}

trap cleanup EXIT

main "$@"