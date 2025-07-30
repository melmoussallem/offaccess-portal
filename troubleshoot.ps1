# Digital Wholesale Catalogue Troubleshooting Script
Write-Host "=== Digital Wholesale Catalogue Troubleshooting Script ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js installation
Write-Host "1. Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Node.js not found in PATH" -ForegroundColor Red
        Write-Host "   Adding Node.js to PATH..." -ForegroundColor Yellow
        $env:PATH += ";C:\Program Files\nodejs"
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Node.js now available: $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Node.js still not found. Please install Node.js" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ✗ Error checking Node.js" -ForegroundColor Red
}

# 2. Check npm installation
Write-Host "2. Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ npm found: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "   ✗ npm not found" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Error checking npm" -ForegroundColor Red
}

# 3. Check MongoDB connection
Write-Host "3. Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "   ✓ MongoDB is running (PID: $($mongoProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ MongoDB process not found. Make sure MongoDB is running." -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Error checking MongoDB" -ForegroundColor Red
}

# 4. Kill existing Node.js processes
Write-Host "4. Killing existing Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node.js processes, killing them..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Write-Host "   ✓ All Node.js processes killed" -ForegroundColor Green
} else {
    Write-Host "   ✓ No Node.js processes found" -ForegroundColor Green
}

# 5. Check port availability
Write-Host "5. Checking port availability..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port5000) {
    Write-Host "   ⚠ Port 5000 is in use by PID: $($port5000.OwningProcess)" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Port 5000 is available" -ForegroundColor Green
}

if ($port3000) {
    Write-Host "   ⚠ Port 3000 is in use by PID: $($port3000.OwningProcess)" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Port 3000 is available" -ForegroundColor Green
}

# 6. Check dependencies
Write-Host "6. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ Backend dependencies found" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Backend dependencies missing. Run: npm install" -ForegroundColor Yellow
}

if (Test-Path "client/node_modules") {
    Write-Host "   ✓ Frontend dependencies found" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Frontend dependencies missing. Run: cd client && npm install" -ForegroundColor Yellow
}

# 7. Check environment files
Write-Host "7. Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "   ⚠ .env file not found. Using default environment variables" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Troubleshooting Complete ===" -ForegroundColor Cyan
Write-Host "To start the application, run:" -ForegroundColor White
Write-Host "  .\start-app.bat" -ForegroundColor Green
Write-Host "Or use PowerShell scripts:" -ForegroundColor White
Write-Host "  .\start-backend.ps1" -ForegroundColor Green
Write-Host "  .\start-frontend.ps1" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue" 