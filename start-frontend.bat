@echo off
echo Starting Frontend Server...
echo.

REM Kill any existing node processes on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Set environment variables
set PATH=%PATH%;C:\Program Files\nodejs
set NODE_OPTIONS=--openssl-legacy-provider

REM Check if node is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not found in PATH
    echo Please install Node.js or add it to your PATH
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not found in PATH
    echo Please install Node.js or add it to your PATH
    pause
    exit /b 1
)

REM Change to client directory
cd client

REM Start the frontend
echo Starting React development server on port 3000...
npm start

pause 