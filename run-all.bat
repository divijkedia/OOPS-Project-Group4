@echo off
title Resolvo Launcher
cd /d "%~dp0"

echo ========================================================
echo   Launching Resolvo Full Stack ITSM Application
echo ========================================================

start "Resolvo Backend (:8080)" /d "%~dp0" "%~dp0start-backend.bat"
ping -n 4 127.0.0.1 >nul
start "Resolvo Frontend (:5173)" /d "%~dp0" "%~dp0start-frontend.bat"

echo.
echo Both servers have been launched in separate terminal windows.
echo - Backend:  http://localhost:8080/swagger-ui.html
echo - Frontend: http://localhost:5173
echo.
pause
