# Kill any existing node processes on port 5000
Write-Host "Killing existing processes on port 5000..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
$processes | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Set environment variables
$env:PATH += ";C:\Program Files\nodejs"
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/b2b-portal"
$env:JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production"
$env:PORT = "5000"
$env:NODE_ENV = "development"

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

# Start the server
Write-Host "Starting backend server on port 5000..." -ForegroundColor Green
node server/index.js 