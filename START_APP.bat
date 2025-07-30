@echo off
echo.
echo ========================================
echo    BULLETPROOF APP STARTUP
echo ========================================
echo.
echo This will:
echo 1. Delete all users and create fresh ones
echo 2. Fix frontend to use correct backend port
echo 3. Start backend on port 5000
echo 4. Start frontend on port 3000
echo 5. Verify everything works
echo.
echo Login Credentials:
echo   Admin: admin@example.com / admin123
echo   Buyer: buyer@example.com / test123
echo.
echo ========================================
echo.
pause
node BULLETPROOF_START.js
pause 