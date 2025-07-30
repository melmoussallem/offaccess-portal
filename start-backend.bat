@echo off
echo Starting Backend Server...
echo.

REM Kill any existing node processes on port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Set environment variables
set PATH=%PATH%;C:\Program Files\nodejs
set MONGODB_URI=mongodb://127.0.0.1:27017/b2b-portal
set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
set PORT=5000
set NODE_ENV=development

REM Check if node is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not found in PATH
    echo Please install Node.js or add it to your PATH
    pause
    exit /b 1
)

REM Start the server
echo Starting server on port 5000...
node server/index.js

pause 