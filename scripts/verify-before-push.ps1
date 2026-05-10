# Pre-Push Verification Script (PowerShell)
# Run this before pushing to GitHub to ensure no sensitive data is committed

Write-Host "🔍 Verifying repository before push..." -ForegroundColor Cyan
Write-Host ""

$IssuesFound = 0

# Check 1: Verify .gitignore exists
Write-Host "1️⃣  Checking .gitignore..." -ForegroundColor White
if (Test-Path ".gitignore") {
    Write-Host "✓ .gitignore exists" -ForegroundColor Green
} else {
    Write-Host "✗ .gitignore not found!" -ForegroundColor Red
    $IssuesFound++
}
Write-Host ""

# Check 2: Verify sensitive files are ignored
Write-Host "2️⃣  Checking if sensitive files are ignored..." -ForegroundColor White
$SensitiveFiles = @("credentials.json", "token.json", ".env")
foreach ($file in $SensitiveFiles) {
    $result = git check-ignore $file 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $file is ignored" -ForegroundColor Green
    } else {
        Write-Host "✗ $file is NOT ignored!" -ForegroundColor Red
        $IssuesFound++
    }
}
Write-Host ""

# Check 3: Search for potential secrets in staged files
Write-Host "3️⃣  Scanning staged files for potential secrets..." -ForegroundColor White
$Patterns = @("client_secret", "access_token", "refresh_token", "private_key", "api_key", "password")
$FoundSecrets = $false
foreach ($pattern in $Patterns) {
    $result = git diff --cached | Select-String -Pattern $pattern -Quiet
    if ($result) {
        Write-Host "✗ Found potential secret: $pattern" -ForegroundColor Red
        $FoundSecrets = $true
        $IssuesFound++
    }
}
if (-not $FoundSecrets) {
    Write-Host "✓ No obvious secrets found in staged files" -ForegroundColor Green
}
Write-Host ""

# Check 4: Verify credentials.json is not staged
Write-Host "4️⃣  Checking if credentials.json is staged..." -ForegroundColor White
$stagedFiles = git diff --cached --name-only
if ($stagedFiles -match "credentials.json") {
    Write-Host "✗ credentials.json is staged! DO NOT COMMIT!" -ForegroundColor Red
    $IssuesFound++
} else {
    Write-Host "✓ credentials.json is not staged" -ForegroundColor Green
}
Write-Host ""

# Check 5: Verify token.json is not staged
Write-Host "5️⃣  Checking if token.json is staged..." -ForegroundColor White
if ($stagedFiles -match "token.json") {
    Write-Host "✗ token.json is staged! DO NOT COMMIT!" -ForegroundColor Red
    $IssuesFound++
} else {
    Write-Host "✓ token.json is not staged" -ForegroundColor Green
}
Write-Host ""

# Check 6: Verify .env is not staged
Write-Host "6️⃣  Checking if .env is staged..." -ForegroundColor White
if ($stagedFiles -match "^\.env$") {
    Write-Host "✗ .env is staged! DO NOT COMMIT!" -ForegroundColor Red
    $IssuesFound++
} else {
    Write-Host "✓ .env is not staged" -ForegroundColor Green
}
Write-Host ""

# Check 7: Verify build succeeds
Write-Host "7️⃣  Verifying build..." -ForegroundColor White
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build succeeds" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    $IssuesFound++
}
Write-Host ""

# Check 8: List what will be committed
Write-Host "8️⃣  Files to be committed:" -ForegroundColor White
$stagedFiles | ForEach-Object {
    Write-Host "   - $_" -ForegroundColor Gray
}
Write-Host ""

# Final result
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor White
if ($IssuesFound -eq 0) {
    Write-Host "✅ All checks passed! Safe to push." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  git push origin main" -ForegroundColor White
    exit 0
} else {
    Write-Host "❌ Issues found! DO NOT PUSH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fix the issues above before pushing." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To unstage sensitive files:" -ForegroundColor Cyan
    Write-Host "  git reset HEAD credentials.json" -ForegroundColor White
    Write-Host "  git reset HEAD token.json" -ForegroundColor White
    Write-Host "  git reset HEAD .env" -ForegroundColor White
    exit 1
}
