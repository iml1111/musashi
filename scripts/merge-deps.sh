#!/usr/bin/env bash
set -euo pipefail

# Configuration
REPO=iml1111/musashi
export GH_PAGER=

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Dependency PR Auto-Merger for ${REPO}${NC}"
echo "========================================="

# Find dependency PRs (from dependabot/renovate or with deps labels)
echo -e "${YELLOW}📋 Finding dependency PRs...${NC}"
MAP=$(gh pr list -R $REPO --state open --json number,author,labels,title | \
  jq '[ .[] | select( 
    (.author.login=="dependabot[bot]" or .author.login=="app/dependabot" or .author.login=="renovate[bot]") or 
    (.author.is_bot==true and (.title | test("deps"; "i"))) or
    (any(.labels[]?.name; test("dependenc|deps"; "i"))) 
  ) | {number, title} ]')

# Check if any PRs found
PR_COUNT=$(echo "$MAP" | jq '. | length')
if [ "$PR_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}No dependency PRs found.${NC}"
    exit 0
fi

echo -e "${GREEN}Found ${PR_COUNT} dependency PR(s) to process:${NC}"
echo "$MAP" | jq -r '.[] | "  PR #\(.number): \(.title)"'
echo ""

# Process each PR
SUCCESS_COUNT=0
FAIL_COUNT=0

for pr in $(echo "$MAP" | jq -c '.[]'); do
    PR_NUM=$(echo "$pr" | jq -r '.number')
    PR_TITLE=$(echo "$pr" | jq -r '.title')
    
    echo -e "${YELLOW}Processing PR #${PR_NUM}: ${PR_TITLE}${NC}"
    
    # Approve the PR
    echo -n "  Approving... "
    if gh pr review -R $REPO $PR_NUM --approve 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ (may already be approved)${NC}"
    fi
    
    # Merge the PR
    echo -n "  Merging... "
    if gh pr merge -R $REPO $PR_NUM --merge --delete-branch 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}✗ (check merge conflicts or CI status)${NC}"
        ((FAIL_COUNT++))
    fi
    
    echo ""
done

# Summary
echo "========================================="
echo -e "${GREEN}📊 Summary:${NC}"
echo -e "  Successfully merged: ${GREEN}${SUCCESS_COUNT}${NC}"
echo -e "  Failed to merge: ${RED}${FAIL_COUNT}${NC}"

if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  Some PRs failed to merge. Check for:${NC}"
    echo "  - Merge conflicts"
    echo "  - Failing CI checks"
    echo "  - Branch protection rules"
    exit 1
fi

echo -e "\n${GREEN}✅ Done!${NC}"