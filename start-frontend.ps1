# Kill any existing node processes on port 3000
Write-Host "Killing existing processes on port 3000..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
$processes | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Set environment variables
$env:PATH += ";C:\Program Files\nodejs"
$env:NODE_OPTIONS = "--openssl-legacy-provider"

# Check if node is available
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not found in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js or add it to your PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "npm not found"
    }
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not found in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js or add it to your PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Change to client directory
Set-Location client

# Start the frontend
Write-Host "Starting React development server on port 3000..." -ForegroundColor Green
npm start 