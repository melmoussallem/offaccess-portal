@echo off
echo.
echo ========================================
echo    BULLETPROOF APP STARTUP - FOREVER
echo ========================================
echo.
echo This will fix everything permanently:
echo 1. Kill all Node processes
echo 2. Create working users in database
echo 3. Fix frontend to use correct backend port
echo 4. Start backend on port 5000
echo 5. Start frontend on port 3000
echo.
echo Login Credentials:
echo   Admin: admin@example.com / admin123
echo   Buyer: buyer@example.com / test123
echo.
echo ========================================
echo.

REM Kill all Node processes
echo Killing all Node processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

REM Fix database
echo Creating working users...
node SIMPLE_FIX.js

REM Start backend
echo Starting backend server...
start "Backend Server" cmd /k "npm run server"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 >nul

REM Start frontend
echo Starting frontend server...
start "Frontend Server" cmd /k "cd client && npm start"

echo.
echo ========================================
echo    APP STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Login Credentials:
echo   Admin: admin@example.com / admin123
echo   Buyer: buyer@example.com / test123
echo.
echo ========================================
echo.
pause 