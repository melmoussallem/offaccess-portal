# Kill all node and npm processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force

# Start backend
$env:PATH += ";C:\Program Files\nodejs"
$env:MONGODB_URI="mongodb://127.0.0.1:27017/b2b-portal"
$env:JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
$env:PORT="5000"
$env:NODE_ENV="development"
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server/index.js" 