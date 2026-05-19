# Security Check Script - PowerShell version for Windows
# Run before git push to check for accidentally committed secrets

Write-Host "🔒 Security Check - Scanning for sensitive data..." -ForegroundColor Cyan
Write-Host ""

$errors = 0

# Check 1: Look for .env files
Write-Host "📋 Checking for .env files..." -ForegroundColor Yellow
$envFiles = git ls-files | Select-String -Pattern "\.env$|\.env\.local$|\.env\.production$"
if ($envFiles) {
    Write-Host "❌ CRITICAL: .env files found in git!" -ForegroundColor Red
    $envFiles
    $errors++
} else {
    Write-Host "✅ No .env files in git" -ForegroundColor Green
}
Write-Host ""

# Check 2: Look for Firebase service account keys
Write-Host "🔑 Checking for Firebase service account keys..." -ForegroundColor Yellow
$firebaseKeys = git ls-files | Select-String -Pattern "serviceAccountKey|firebase-adminsdk"
if ($firebaseKeys) {
    Write-Host "❌ CRITICAL: Firebase credentials found in git!" -ForegroundColor Red
    $firebaseKeys
    $errors++
} else {
    Write-Host "✅ No Firebase credentials in git" -ForegroundColor Green
}
Write-Host ""

# Check 3: Look for private keys
Write-Host "🔐 Checking for private key files..." -ForegroundColor Yellow
$privateKeys = git ls-files | Select-String -Pattern "\.pem$|\.key$|\.p12$"
if ($privateKeys) {
    Write-Host "❌ CRITICAL: Private key files found in git!" -ForegroundColor Red
    $privateKeys
    $errors++
} else {
    Write-Host "✅ No private key files in git" -ForegroundColor Green
}
Write-Host ""

# Check 4: Search for hardcoded API keys in staged files
Write-Host "🔍 Scanning staged files for hardcoded secrets..." -ForegroundColor Yellow
$apiKeys = git diff --cached | Select-String -Pattern "AIzaSy|sk-|pk_|AKIA"
if ($apiKeys) {
    Write-Host "❌ WARNING: Potential API keys found in staged changes!" -ForegroundColor Red
    Write-Host "Review these lines:"
    $apiKeys
    $errors++
} else {
    Write-Host "✅ No hardcoded API keys detected" -ForegroundColor Green
}
Write-Host ""

# Check 5: Search for hardcoded private keys
Write-Host "🔑 Scanning for hardcoded private keys..." -ForegroundColor Yellow
$privateKeyContent = git diff --cached | Select-String -Pattern "BEGIN PRIVATE KEY|BEGIN RSA PRIVATE KEY"
if ($privateKeyContent) {
    Write-Host "❌ CRITICAL: Private keys found in code!" -ForegroundColor Red
    $errors++
} else {
    Write-Host "✅ No hardcoded private keys" -ForegroundColor Green
}
Write-Host ""

# Check 6: Verify .env.example has no real values
Write-Host "📝 Checking .env.example..." -ForegroundColor Yellow
if (Test-Path ".env.example") {
    $envExample = Get-Content ".env.example" -Raw
    if ($envExample -match "AIzaSy|eyJhbGc|-----BEGIN") {
        Write-Host "❌ WARNING: .env.example contains real values!" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "✅ .env.example looks safe" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  .env.example not found" -ForegroundColor Yellow
}
Write-Host ""

# Check 7: Look for database dumps
Write-Host "💾 Checking for database dumps..." -ForegroundColor Yellow
$dbFiles = git ls-files | Select-String -Pattern "\.sql$|\.dump$|\.backup$"
if ($dbFiles) {
    Write-Host "⚠️  Database files found (may contain sensitive data):" -ForegroundColor Yellow
    $dbFiles
    Write-Host "Verify these are schema-only migrations, not data dumps"
} else {
    Write-Host "✅ No database dump files" -ForegroundColor Green
}
Write-Host ""

# Check 8: Verify .gitignore exists
Write-Host "📄 Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    if ($gitignore -match "\.env" -and $gitignore -match "serviceAccountKey") {
        Write-Host "✅ .gitignore properly configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .gitignore may be incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ CRITICAL: .gitignore not found!" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "✅ SECURITY CHECK PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Safe to commit and push!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ SECURITY CHECK FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Found $errors issue(s). DO NOT PUSH until resolved!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Actions to take:"
    Write-Host "1. Remove sensitive files from git: git rm --cached <file>"
    Write-Host "2. Add files to .gitignore"
    Write-Host "3. Replace hardcoded secrets with process.env"
    Write-Host "4. Run this script again"
    Write-Host ""
    exit 1
}
