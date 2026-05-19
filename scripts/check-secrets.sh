#!/bin/bash

# Security Check Script - Run before git push
# This script checks for accidentally committed secrets

echo "🔒 Security Check - Scanning for sensitive data..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Look for .env files
echo "📋 Checking for .env files..."
if git ls-files | grep -q "\.env$\|\.env\.local$\|\.env\.production$"; then
    echo -e "${RED}❌ CRITICAL: .env files found in git!${NC}"
    git ls-files | grep "\.env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No .env files in git${NC}"
fi
echo ""

# Check 2: Look for Firebase service account keys
echo "🔑 Checking for Firebase service account keys..."
if git ls-files | grep -q "serviceAccountKey\|firebase-adminsdk"; then
    echo -e "${RED}❌ CRITICAL: Firebase credentials found in git!${NC}"
    git ls-files | grep "serviceAccountKey\|firebase-adminsdk"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No Firebase credentials in git${NC}"
fi
echo ""

# Check 3: Look for private keys
echo "🔐 Checking for private key files..."
if git ls-files | grep -q "\.pem$\|\.key$\|\.p12$"; then
    echo -e "${RED}❌ CRITICAL: Private key files found in git!${NC}"
    git ls-files | grep "\.pem$\|\.key$\|\.p12$"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No private key files in git${NC}"
fi
echo ""

# Check 4: Search for hardcoded API keys in staged files
echo "🔍 Scanning staged files for hardcoded secrets..."
if git diff --cached | grep -q "AIzaSy\|sk-\|pk_\|AKIA"; then
    echo -e "${RED}❌ WARNING: Potential API keys found in staged changes!${NC}"
    echo "Review these lines:"
    git diff --cached | grep --color=always "AIzaSy\|sk-\|pk_\|AKIA"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hardcoded API keys detected${NC}"
fi
echo ""

# Check 5: Search for hardcoded private keys
echo "🔑 Scanning for hardcoded private keys..."
if git diff --cached | grep -q "BEGIN PRIVATE KEY\|BEGIN RSA PRIVATE KEY"; then
    echo -e "${RED}❌ CRITICAL: Private keys found in code!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hardcoded private keys${NC}"
fi
echo ""

# Check 6: Verify .env.example has no real values
echo "📝 Checking .env.example..."
if [ -f ".env.example" ]; then
    if grep -q "AIzaSy\|eyJhbGc\|-----BEGIN" .env.example; then
        echo -e "${RED}❌ WARNING: .env.example contains real values!${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ .env.example looks safe${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.example not found${NC}"
fi
echo ""

# Check 7: Look for database dumps
echo "💾 Checking for database dumps..."
if git ls-files | grep -q "\.sql$\|\.dump$\|\.backup$"; then
    echo -e "${YELLOW}⚠️  Database files found (may contain sensitive data):${NC}"
    git ls-files | grep "\.sql$\|\.dump$\|\.backup$"
    echo "Verify these are schema-only migrations, not data dumps"
else
    echo -e "${GREEN}✅ No database dump files${NC}"
fi
echo ""

# Check 8: Verify .gitignore exists
echo "📄 Checking .gitignore..."
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore && grep -q "serviceAccountKey" .gitignore; then
        echo -e "${GREEN}✅ .gitignore properly configured${NC}"
    else
        echo -e "${YELLOW}⚠️  .gitignore may be incomplete${NC}"
    fi
else
    echo -e "${RED}❌ CRITICAL: .gitignore not found!${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ SECURITY CHECK PASSED${NC}"
    echo ""
    echo "Safe to commit and push!"
    exit 0
else
    echo -e "${RED}❌ SECURITY CHECK FAILED${NC}"
    echo ""
    echo "Found $ERRORS issue(s). DO NOT PUSH until resolved!"
    echo ""
    echo "Actions to take:"
    echo "1. Remove sensitive files from git: git rm --cached <file>"
    echo "2. Add files to .gitignore"
    echo "3. Replace hardcoded secrets with process.env"
    echo "4. Run this script again"
    echo ""
    exit 1
fi
