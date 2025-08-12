#!/bin/bash
# CI Debug Script - Interactive debugging for CI failures
# Provides detailed error analysis and fix suggestions

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔍 Musashi CI Debug Tool"
echo "========================"

# Error log file
ERROR_LOG="/tmp/musashi-ci-debug.log"
> $ERROR_LOG

# Debug function with detailed logging
debug_run() {
    local cmd="$1"
    local description="$2"
    
    echo -e "${BLUE}Running: $description${NC}"
    echo "Command: $cmd" >> $ERROR_LOG
    
    if eval "$cmd" >> $ERROR_LOG 2>&1; then
        echo -e "${GREEN}✅ Success${NC}"
        return 0
    else
        local exit_code=$?
        echo -e "${RED}❌ Failed with exit code: $exit_code${NC}"
        echo "Error output:" >> $ERROR_LOG
        tail -20 $ERROR_LOG
        return $exit_code
    fi
}

# Check TypeScript errors
check_typescript() {
    echo -e "${YELLOW}Checking TypeScript...${NC}"
    
    cd frontend
    
    # Check for type errors
    if ! npx tsc --noEmit 2>&1 | tee -a $ERROR_LOG; then
        echo -e "${RED}TypeScript errors found:${NC}"
        
        # Parse and suggest fixes
        if grep -q "TS6133" $ERROR_LOG; then
            echo "📝 Unused variable errors detected"
            echo "Fix: Prefix unused parameters with underscore or remove them"
        fi
        
        if grep -q "TS2345" $ERROR_LOG; then
            echo "📝 Type compatibility errors detected"
            echo "Fix: Check type definitions match between imports"
        fi
        
        if grep -q "TS2339" $ERROR_LOG; then
            echo "📝 Property does not exist errors"
            echo "Fix: Add missing properties or use type assertions"
        fi
        
        echo -e "${YELLOW}Suggested action:${NC}"
        echo "Run: npm run lint -- --fix"
        return 1
    fi
    
    cd ..
    echo -e "${GREEN}✅ TypeScript OK${NC}"
}

# Check Python linting
check_python() {
    echo -e "${YELLOW}Checking Python...${NC}"
    
    cd backend
    
    # Create venv if not exists
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    # Install ruff
    pip install ruff -q
    
    # Check for linting errors
    if ! ruff check . 2>&1 | tee -a $ERROR_LOG; then
        echo -e "${RED}Python linting errors found${NC}"
        echo -e "${YELLOW}Attempting auto-fix...${NC}"
        ruff check . --fix
        
        echo -e "${YELLOW}Suggested actions:${NC}"
        echo "1. Review and commit the auto-fixes"
        echo "2. Manually fix remaining issues"
    fi
    
    deactivate
    cd ..
    echo -e "${GREEN}✅ Python linting OK${NC}"
}

# Check test failures
check_tests() {
    echo -e "${YELLOW}Checking test failures...${NC}"
    
    # Backend tests
    echo "Backend tests..."
    cd backend
    source venv/bin/activate
    
    export MONGODB_URL="mongodb://admin:password123@localhost:27017/musashi_test?authSource=admin"
    export DATABASE_NAME="musashi_test"
    export SECRET_KEY="test-secret-key"
    
    if ! python -m pytest -v 2>&1 | tee -a $ERROR_LOG; then
        echo -e "${RED}Backend test failures detected${NC}"
        
        # Analyze common failures
        if grep -q "validation error" $ERROR_LOG; then
            echo "📝 Pydantic validation errors found"
            echo "Fix: Check model field requirements match test data"
        fi
        
        if grep -q "connection refused" $ERROR_LOG; then
            echo "📝 MongoDB connection error"
            echo "Fix: Ensure MongoDB is running on port 27017"
        fi
    else
        echo -e "${GREEN}✅ Backend tests pass${NC}"
    fi
    
    deactivate
    cd ..
    
    # Frontend tests
    echo "Frontend tests..."
    cd frontend
    
    if ! npm test -- --watchAll=false 2>&1 | tee -a $ERROR_LOG; then
        echo -e "${RED}Frontend test failures detected${NC}"
        
        # Analyze common failures
        if grep -q "Cannot find module" $ERROR_LOG; then
            echo "📝 Missing module errors"
            echo "Fix: Run 'npm ci' to install exact dependencies"
        fi
        
        if grep -q "SyntaxError" $ERROR_LOG; then
            echo "📝 JavaScript syntax errors"
            echo "Fix: Check for missing semicolons or brackets"
        fi
    else
        echo -e "${GREEN}✅ Frontend tests pass${NC}"
    fi
    
    cd ..
}

# Interactive fix suggestions
suggest_fixes() {
    echo -e "${YELLOW}=== Fix Suggestions ===${NC}"
    
    # Check recent commits
    echo "Recent changes that might have caused issues:"
    git log --oneline -5
    
    # Check modified files
    echo -e "\nModified files:"
    git status --short
    
    # Common fix commands
    echo -e "\n${YELLOW}Quick fix commands:${NC}"
    echo "1. Fix TypeScript: cd frontend && npm run lint"
    echo "2. Fix Python: cd backend && ruff check . --fix"
    echo "3. Update snapshots: cd frontend && npm test -- -u"
    echo "4. Clean install: rm -rf node_modules package-lock.json && npm install"
    echo "5. Reset MongoDB: docker restart musashi-test-mongodb"
}

# Main debug flow
main() {
    # Check what to debug
    case "$1" in
        typescript|ts)
            check_typescript
            ;;
        python|py)
            check_python
            ;;
        tests)
            check_tests
            ;;
        all|"")
            check_typescript
            check_python
            check_tests
            suggest_fixes
            ;;
        *)
            echo "Usage: $0 [typescript|python|tests|all]"
            exit 1
            ;;
    esac
    
    echo -e "\n${YELLOW}Debug log saved to: $ERROR_LOG${NC}"
}

main "$@"