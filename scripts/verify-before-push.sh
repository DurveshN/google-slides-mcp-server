#!/bin/bash

# Pre-Push Verification Script
# Run this before pushing to GitHub to ensure no sensitive data is committed

echo "🔍 Verifying repository before push..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any issues found
ISSUES_FOUND=0

# Check 1: Verify .gitignore exists
echo "1️⃣  Checking .gitignore..."
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓${NC} .gitignore exists"
else
    echo -e "${RED}✗${NC} .gitignore not found!"
    ISSUES_FOUND=1
fi
echo ""

# Check 2: Verify sensitive files are ignored
echo "2️⃣  Checking if sensitive files are ignored..."
SENSITIVE_FILES=("credentials.json" "token.json" ".env")
for file in "${SENSITIVE_FILES[@]}"; do
    if git check-ignore "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $file is ignored"
    else
        echo -e "${RED}✗${NC} $file is NOT ignored!"
        ISSUES_FOUND=1
    fi
done
echo ""

# Check 3: Search for potential secrets in staged files
echo "3️⃣  Scanning staged files for potential secrets..."
PATTERNS=("client_secret" "access_token" "refresh_token" "private_key" "api_key" "password")
FOUND_SECRETS=0
for pattern in "${PATTERNS[@]}"; do
    if git diff --cached | grep -i "$pattern" > /dev/null 2>&1; then
        echo -e "${RED}✗${NC} Found potential secret: $pattern"
        FOUND_SECRETS=1
        ISSUES_FOUND=1
    fi
done
if [ $FOUND_SECRETS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No obvious secrets found in staged files"
fi
echo ""

# Check 4: Verify credentials.json is not staged
echo "4️⃣  Checking if credentials.json is staged..."
if git diff --cached --name-only | grep -q "credentials.json"; then
    echo -e "${RED}✗${NC} credentials.json is staged! DO NOT COMMIT!"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✓${NC} credentials.json is not staged"
fi
echo ""

# Check 5: Verify token.json is not staged
echo "5️⃣  Checking if token.json is staged..."
if git diff --cached --name-only | grep -q "token.json"; then
    echo -e "${RED}✗${NC} token.json is staged! DO NOT COMMIT!"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✓${NC} token.json is not staged"
fi
echo ""

# Check 6: Verify .env is not staged
echo "6️⃣  Checking if .env is staged..."
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo -e "${RED}✗${NC} .env is staged! DO NOT COMMIT!"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✓${NC} .env is not staged"
fi
echo ""

# Check 7: Verify build succeeds
echo "7️⃣  Verifying build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build succeeds"
else
    echo -e "${RED}✗${NC} Build failed!"
    ISSUES_FOUND=1
fi
echo ""

# Check 8: List what will be committed
echo "8️⃣  Files to be committed:"
git diff --cached --name-only | while read file; do
    echo "   - $file"
done
echo ""

# Final result
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Safe to push.${NC}"
    echo ""
    echo "Next steps:"
    echo "  git push origin main"
    exit 0
else
    echo -e "${RED}❌ Issues found! DO NOT PUSH!${NC}"
    echo ""
    echo "Fix the issues above before pushing."
    echo ""
    echo "To unstage sensitive files:"
    echo "  git reset HEAD credentials.json"
    echo "  git reset HEAD token.json"
    echo "  git reset HEAD .env"
    exit 1
fi
