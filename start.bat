@echo off
title Resolvo ITSM Launcher
cd /d "%~dp0"

echo ========================================================
echo   Launching Resolvo Full Stack ITSM Application
echo ========================================================

rem 1. Start Backend in new window
start "Resolvo Backend (:8080)" /d "%~dp0" "%~dp0start-backend.bat"

rem 2. Safe delay (3 seconds)
ping -n 4 127.0.0.1 >nul

rem 3. Start Frontend in new window (Vite will automatically open the browser)
start "Resolvo Frontend (:5173)" /d "%~dp0" "%~dp0start-frontend.bat"

echo.
echo ========================================================
echo   Resolvo ITSM is running!
echo   Web Portal: http://localhost:5173
echo.
echo   Login: admin / password123
echo ========================================================
echo.
